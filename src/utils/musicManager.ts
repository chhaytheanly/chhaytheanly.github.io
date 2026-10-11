import { Howl } from 'howler';
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
 * Swap in the Persona 3 Reload theme by dropping files in
 * `src/assets/audio/` and editing `siteContent.music.tracks` — no code here
 * needs to change.
 */
export type TrackId = string;

class MusicManager {
  private howls = new Map<TrackId, Howl>();
  private current: TrackId | null = null;
  private level: number = music.volume;
  private _playing = false;
  private onChange: (() => void) | null = null;

  constructor() {
    for (const track of music.tracks) {
      const howl = new Howl({
        src: [track.src],
        loop: true,
        html5: false, // WebAudio — keeps the UI SFX engine on the same clock
        volume: 0,
        preload: true,
      });
      howl.on('loaderror', () => console.warn(`[music] failed to load "${track.id}"`));
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
   * Autoplay policy: browsers block audio until a user gesture. The Music
   * provider calls this from the first pointer/key event, so the theme can
   * start on the first interaction instead of silently failing.
   */
  tryAutoplay() {
    if (this._playing) return;
    this.play();
  }

  play(fade = 0.8) {
    if (!this.current) this.current = music.tracks[0]?.id ?? null;
    const howl = this.current ? this.howls.get(this.current) : null;
    if (!howl) return;

    if (!howl.playing()) howl.play();
    howl.volume(0, howl.seek() ?? 0);
    howl.fade(0, this.volume, fade);
    this._playing = true;
    this.emit();
  }

  pause(fade = 0.45) {
    const howl = this.current ? this.howls.get(this.current) : null;
    if (!howl || !howl.playing()) {
      this._playing = false;
      this.emit();
      return;
    }
    howl.fade(howl.volume(), 0, fade);
    // let the fade finish before tearing the node down
    window.setTimeout(() => {
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
        prev.fade(prev.volume(), 0, 0.35);
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
    this.howls.forEach((h) => h.unload());
    this.howls.clear();
  }
}

export const musicManager = new MusicManager();
