import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { MusicContext, type MusicApi } from '../../hooks/useMusic';
import { musicManager } from '../../utils/musicManager';
import { music } from '../../data/siteContent';

/**
 * Mounts the theme engine and keeps React in sync with it.
 *
 * Autoplay policy: music can't start before a gesture, so we arm it on the
 * player's first pointer/key interaction — the same moment the UI SFX unlock.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);

  useEffect(() => musicManager.subscribe(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    const arm = () => musicManager.tryAutoplay();
    window.addEventListener('pointerdown', arm, { once: true });
    window.addEventListener('keydown', arm, { once: true });
    return () => {
      window.removeEventListener('pointerdown', arm);
      window.removeEventListener('keydown', arm);
    };
  }, []);

  const api = useMemo<MusicApi>(
    () => ({
      playlist: music.tracks.map((t) => t.id),
      trackId: musicManager.trackId,
      title: music.tracks.find((t) => t.id === musicManager.trackId)?.title ?? '',
      playing: musicManager.playing,
      volume: musicManager.volume,
      toggle: () => musicManager.toggle(),
      play: () => musicManager.play(),
      pause: () => musicManager.pause(),
      next: () => musicManager.next(),
      prev: () => musicManager.prev(),
      setVolume: (v: number) => musicManager.setVolume(v),
    }),
    // `tick` is intentionally "unnecessary" — it is the change signal that
    // pulls fresh values out of the imperative musicManager.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick],
  );

  return <MusicContext.Provider value={api}>{children}</MusicContext.Provider>;
}

export default MusicProvider;
