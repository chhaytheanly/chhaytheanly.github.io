import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { MusicContext, type MusicApi } from '../../hooks/useMusic';
import { musicManager } from '../../utils/musicManager';
import { music } from '../../data/siteContent';

/**
 * Mounts the theme engine and keeps React in sync with it.
 *
 * Autoplay policy is handled inside `musicManager.armAutoplay()` — it binds to
 * the full set of gesture events and keeps retrying until playback is actually
 * confirmed, which is what mobile needs (iOS fires `pointerdown` before the
 * AudioContext unlocks, so a single `once: true` handler silently loses the
 * race and music never starts).
 *
 * This provider only adds the lifecycle wiring: subscribe for re-renders,
 * arm on mount, and revive on the events where mobile suspends audio.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
  const [tick, setTick] = useState(0);

  useEffect(() => musicManager.subscribe(() => setTick((t) => t + 1)), []);

  useEffect(() => {
    musicManager.armAutoplay();

    // Mobile browsers suspend the AudioContext when the tab is backgrounded and
    // don't reliably restore it — resume on the way back in, on both the
    // visibility API and the bfcache-restore path.
    const onVisible = () => {
      if (document.visibilityState === 'visible') musicManager.revive();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onVisible);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('pageshow', onVisible);
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
