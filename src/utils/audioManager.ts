import { Howl, Howler } from 'howler';

import hoverSfx from '../assets/audio/hover.wav';
import clickLightSfx from '../assets/audio/click_light.wav';
import clickHeavySfx from '../assets/audio/click_heavy.wav';
import menuSwooshSfx from '../assets/audio/menu_swoosh.wav';
import transitionImpactSfx from '../assets/audio/transition_impact.wav';

export type SfxName =
  | 'hover'
  | 'click_light'
  | 'click_heavy'
  | 'menu_swoosh'
  | 'transition_impact';

/** Per-sound mix levels. UI ticks sit low so they never fatigue the ear. */
const MIX: Record<SfxName, number> = {
  hover: 0.22,
  click_light: 0.4,
  click_heavy: 0.75,
  menu_swoosh: 0.5,
  transition_impact: 0.85,
};

const SOURCES: Record<SfxName, string> = {
  hover: hoverSfx,
  click_light: clickLightSfx,
  click_heavy: clickHeavySfx,
  menu_swoosh: menuSwooshSfx,
  transition_impact: transitionImpactSfx,
};

/**
 * Low-latency UI audio.
 * - Howler uses WebAudio by default (html5: false) → near-zero decode latency.
 * - All five cues are preloaded at module load; nothing decodes on first hover.
 * - `preload: true` buffers the whole clip — these are all < 0.5s.
 * - Fails silently if a file is missing, so the UI never breaks over audio.
 */
class AudioManager {
  private sounds = new Map<SfxName, Howl>();
  private muted = false;
  private volume = 1;
  private unlocked = false;

  constructor() {
    (Object.keys(SOURCES) as SfxName[]).forEach((name) => this.load(name));
    // Browsers block audio until a gesture; Howler handles the unlock internally.
    Howler.autoUnlock = true;
  }

  private load(name: SfxName) {
    try {
      const howl = new Howl({
        src: [SOURCES[name]],
        preload: true,
        html5: false, // WebAudio = lower latency than HTML5 audio
        volume: this.volume,
        mute: this.muted,
      });
      howl.on('loaderror', (_id, err) => {
        console.warn(`[audio] failed to load "${name}" — UI will run silent.`, err);
      });
      this.sounds.set(name, howl);
    } catch (err) {
      console.warn(`[audio] could not create Howl for "${name}".`, err);
    }
  }

  /**
   * Fire a cue. Rapid repeats (fast hovering) are pooled by Howler, so this is
   * safe to call on every pointer-enter without throttling.
   */
  play(name: SfxName, { rate = 1, volume = 1 }: { rate?: number; volume?: number } = {}) {
    if (this.muted) return;
    const howl = this.sounds.get(name);
    if (!howl) return;
    try {
      // Howler pools overlapping plays, so this is safe on every pointer-enter.
      const id = howl.play();
      howl.rate(rate, id);
      howl.volume(MIX[name] * volume, id);
    } catch {
      /* audio unavailable (autoplay policy) — fail silent */
    }
  }

  /** Slight random detune so repeated clicks never sound machine-gunned. */
  playVaried(name: SfxName, spread = 0.06) {
    this.play(name, { rate: 1 + (Math.random() * 2 - 1) * spread });
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    Howler.mute(muted);
    return this.muted;
  }

  toggleMute() {
    return this.setMuted(!this.muted);
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    Howler.volume(this.volume);
  }

  get isMuted() {
    return this.muted;
  }

  /** Call from the first user gesture to be certain playback is permitted. */
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      Howler.ctx?.resume();
    } catch {
      /* not unlocked yet; Howler retries on the next gesture */
    }
  }

  dispose() {
    this.sounds.forEach((howl) => howl.unload());
    this.sounds.clear();
  }
}

export const audioManager = new AudioManager();
export { MIX };
