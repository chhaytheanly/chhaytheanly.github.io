import { Howl, Howler } from 'howler';
import { music } from '../data/siteContent';

export type Track = (typeof music.tracks)[number];

/**
 * BACKGROUND MUSIC
 *
 * Kept separate from `audioManager` (UI SFX) on purpose: SFX are one-shot
 * WebAudio blips that must be instant, while music is a long, looping,
 * volume-controlled stream that must fade in and out and never interrupt a
 * UI cue. Two systems, two lifecycles.
 *
 * MOBILE NOTES — the three things that actually broke playback on phones:
 *
 *  1. `html5: true`. A theme track is minutes long. WebAudio decodes the WHOLE
 *     file into a Float32 PCM buffer up front, which for a multi-megabyte mp3
 *     is a huge allocation that stalls or fails on mobile. The HTML5 Audio
 *     element streams instead, costs nothing to hold idle, and still obeys
 *     `Howler.mute()` / `Howler.volume()`, so global mute keeps working.
 *     The UI SFX stay on WebAudio — that's where low latency actually matters.
 *
 *  2. Autoplay is armed on `touchend`/`click`, not `pointerdown`. iOS fires
 *     `pointerdown` BEFORE `touchstart`, so a play() issued from `pointerdown`
 *     hits a still-suspended AudioContext and is lost. Listeners stay bound
 *     until playback is genuinely confirmed, rather than being `once: true`
 *     and gone after one unlucky tap.
 *
 *  3. The AudioContext is re-resumed on `visibilitychange`/`pageshow`. Mobile
 *     browsers suspend audio when the tab is backgrounded and do not always
 *     restore it, which leaves a "playing" track that outputs nothing.
 *
 * Swap in the Persona 3 Reload theme by dropping files in
 * `src/assets/audio/` and editing `siteContent.music.tracks` — no code here
 * needs to change.
 */
export type TrackId = string;

/** Every event that can legitimately constitute the "user gesture" unlock. */
const GESTURES = ['touchend', 'click', 'pointerup', 'keydown'] as const;

/**
 * The slice of Howler's private `Sound` shape that we need to read.
 * Untyped upstream — kept minimal and local rather than casting to `any`.
 */
interface SoundInternals {
  _node?: HTMLAudioElement;
}

class MusicManager {
  private howls = new Map<TrackId, Howl>();
  private current: TrackId | null = null;
  private level: number = music.volume;
  private _playing = false;
  /** Fade-in (seconds) to apply once the node confirms it is running. */
  private pendingFade: number | null = null;
  /** User intent — survives a failed autoplay so the next gesture can retry. */
  private _wanted = false;
  private onChange: (() => void) | null = null;
  private armed = false;
  private armTeardown: (() => void) | null = null;

  constructor() {
    Howler.autoUnlock = true;

    for (const track of music.tracks) {
      const howl = new Howl({
        src: [track.src],
        loop: true,
        html5: true, // see MOBILE NOTES above — streaming, not a giant PCM buffer
        volume: 0,
        preload: true,
      });
      howl.on('loaderror', () => console.warn(`[music] failed to load "${track.id}"`));
      // Howler emits 'unlock' the moment audio is actually permitted. This is
      // the only trustworthy signal that a play() issued earlier will work.
      howl.on('unlock', () => {
        if (this._wanted) this.play();
      });
      howl.on('play', () => {
        this._playing = true;
        this.applyPendingFade(howl);
        this.emit();
      });
      howl.on('pause', () => {
        this._playing = false;
        this.emit();
      });
      howl.on('playerror', (_id, err) => {
        console.warn(`[music] playback blocked for "${track.id}" — waiting for a gesture.`, err);
        this._playing = false;
        this.emit();
      });
      this.howls.set(track.id, howl);
    }
  }

  subscribe(fn: () => void) {
    this.onChange = fn;
    return () => {
      this.onChange = null;
    };
  }

  private emit() {
    this.onChange?.();
  }

  get playing() {
    return this._playing;
  }

  get trackId() {
    return this.current;
  }

  get volume() {
    return this.level;
  }

  /**
   * Arm autoplay for the first real gesture. Listeners stay attached until the
   * track is confirmed playing, so a first tap that lands on a still-locked
   * context doesn't permanently consume the unlock.
   */
  armAutoplay() {
    if (this.armed) return;
    this.armed = true;
    this._wanted = true;

    const attempt = () => {
      this.resumeContext();
      if (!this._wanted) return;
      this.play();
      // `play` emits asynchronously; check on the next tick so we only
      // disconnect once playback actually took.
      window.setTimeout(() => {
        if (this._playing) this.disarm();
      }, 0);
    };

    GESTURES.forEach((evt) => window.addEventListener(evt, attempt, { passive: true }));
    this.armTeardown = () => GESTURES.forEach((evt) => window.removeEventListener(evt, attempt));
  }

  private disarm() {
    this.armed = false;
    this.armTeardown?.();
    this.armTeardown = null;
  }

  /** Mobile suspends the AudioContext whenever the tab is backgrounded. */
  resumeContext() {
    const ctx = Howler.ctx;
    if (ctx && ctx.state === 'suspended') void ctx.resume();
  }

  /**
   * Is the sound actually emitting audio right now?
   *
   * `howl.playing()` only reflects Howler's own `sound._paused` flag, which it
   * has no way of updating when the BROWSER suspends an HTML5 audio node behind
   * its back — the common case when a mobile tab is backgrounded. It will keep
   * reporting "playing" for a node that is silently paused, so we check the
   * node itself as the source of truth.
   */
  private isAudible(howl: Howl): boolean {
    if (!howl.playing()) return false;
    const sounds = (howl as unknown as { _sounds?: SoundInternals[] })._sounds ?? [];
    return sounds.every((s) => {
      const node = s._node;
      // Only HTML5 nodes can be suspended out from under us.
      if (!node || typeof node.paused !== 'boolean') return true;
      return !node.paused;
    });
  }

  /**
   * Rebind the unlock listeners — used when the tab comes back to the
   * foreground on mobile, where the context may have been suspended and the
   * previous gesture is long gone.
   */
  revive() {
    this.resumeContext();
    if (!this._wanted) return;
    const howl = this.current ? this.howls.get(this.current) : null;
    if (howl && !this.isAudible(howl)) {
      // The node was suspended behind Howler's back, so its internal flag still
      // says "playing" and a plain play() is a no-op. Pause first to reset that
      // flag, then start again from where we left off.
      howl.pause();
      this.play(0.4);
    }
  }

  play(fade = 0.8) {
    if (!this.current) this.current = music.tracks[0]?.id ?? null;
    const howl = this.current ? this.howls.get(this.current) : null;
    if (!howl) return;

    this.resumeContext();

    // Idempotence guard. A single user gesture can legitimately reach play()
    // twice — once via the control's own onClick and once via the armed
    // autoplay listener bound to the same click event. HTML5 play() is async and
    // Howler locks the queue until its promise settles, so two overlapping
    // calls race and can leave the node paused while Howler still reports
    // "playing". Only issue a start when the node isn't already running.
    const alreadyRunning = howl.playing() && this.isAudible(howl);
    if (!alreadyRunning) {
      // Playing flag set but node silent (browser suspended it behind Howler's
      // back) — reset the stale flag before restarting.
      if (howl.playing()) howl.pause();
      howl.play();
      // Applied from the 'play' handler, NOT here: while _playLock is set any
      // volume()/fade() is parked on the load queue, and that queue only drains
      // entries matching the event being emitted — so a 'volume' entry stuck
      // there never runs and the track plays silently forever.
      this.pendingFade = fade;
    }

    this._wanted = true;
    this._playing = true;
    this.emit();
  }

  /**
   * Fade in once the node is genuinely running. `fade()` sets its own start
   * value, so this needs no separate volume() call — and note `howl.seek()`
   * returns a POSITION IN SECONDS, not a sound id, so it must never be passed
   * as one.
   */
  private applyPendingFade(howl: Howl) {
    const fade = this.pendingFade;
    if (fade === null) return;
    this.pendingFade = null;
    // Howler's fade length is in MILLISECONDS.
    howl.fade(0, this.level, fade * 1000);
  }

  pause(fade = 0.45) {
    this._wanted = false;
    this.disarm();
    const howl = this.current ? this.howls.get(this.current) : null;
    if (!howl || !howl.playing()) {
      this._playing = false;
      this.emit();
      return;
    }
    // Any fade-in still waiting to be applied is now moot.
    this.pendingFade = null;
    howl.fade(howl.volume(), 0, fade * 1000);
    // let the fade finish before tearing the node down
    window.setTimeout(() => {
      // A play() may have landed during the fade-out — don't stomp it.
      if (this._wanted) return;
      howl.pause();
      this._playing = false;
      this.emit();
    }, fade * 1000);
  }

  toggle() {
    if (this._playing) this.pause();
    else this.play();
  }

  /** Cross-fade to another track in the playlist. */
  select(id: TrackId) {
    if (id === this.current) {
      this.toggle();
      return;
    }
    const wasPlaying = this._playing;
    if (this.current) {
      const prev = this.howls.get(this.current);
      if (prev?.playing()) {
        prev.fade(prev.volume(), 0, 350);
        window.setTimeout(() => prev.pause(), 380);
      }
    }
    this.current = id;
    if (wasPlaying) this.play();
    this.emit();
  }

  step(delta: number) {
    const ids: TrackId[] = music.tracks.map((t) => t.id);
    if (!ids.length) return;
    const i = this.current ? ids.indexOf(this.current) : 0;
    this.select(ids[(i + delta + ids.length) % ids.length]);
  }

  next() {
    this.step(1);
  }

  prev() {
    this.step(-1);
  }

  setVolume(v: number) {
    this.level = Math.max(0, Math.min(1, v));
    const howl = this.current ? this.howls.get(this.current) : null;
    howl?.volume(this.level);
    this.emit();
  }

  dispose() {
    this.disarm();
    this.howls.forEach((h) => h.unload());
    this.howls.clear();
  }
}

export const musicManager = new MusicManager();
