import { useCallback, useEffect, useRef, useState } from 'react';
import { audioManager, type SfxName } from '../utils/audioManager';

export interface UseAudio {
  /** Play a UI cue. Cheap enough to call on every hover. */
  play: (name: SfxName, opts?: { rate?: number; volume?: number }) => void;
  /** Detuned variant — for rapid repeats so they never sound looped. */
  playVaried: (name: SfxName, spread?: number) => void;
  muted: boolean;
  toggleMute: () => void;
}

/**
 * UI audio. Five cues are preloaded by `audioManager` at module load:
 * hover · click_light · click_heavy · menu_swoosh · transition_impact
 *
 * Browsers gate audio behind a gesture, so we unlock on the first interaction
 * and never block rendering on audio readiness.
 */
export function useAudio(): UseAudio {
  const [muted, setMuted] = useState(audioManager.isMuted);
  const unlocked = useRef(false);

  useEffect(() => {
    const unlock = () => {
      if (unlocked.current) return;
      unlocked.current = true;
      audioManager.unlock();
      // first gesture is also the moment a menu cue feels natural
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const play = useCallback<UseAudio['play']>((name, opts) => {
    audioManager.play(name, opts);
  }, []);

  const playVaried = useCallback<UseAudio['playVaried']>((name, spread) => {
    audioManager.playVaried(name, spread);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(audioManager.toggleMute());
  }, []);

  return { play, playVaried, muted, toggleMute };
}
