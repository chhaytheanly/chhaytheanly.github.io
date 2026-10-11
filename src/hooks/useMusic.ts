import { createContext, useContext } from 'react';

export interface MusicApi {
  /** Track ids, in playlist order. */
  playlist: readonly string[];
  trackId: string | null;
  title: string;
  playing: boolean;
  volume: number;
  toggle: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  setVolume: (v: number) => void;
}

const noop: MusicApi = {
  playlist: [],
  trackId: null,
  title: '',
  playing: false,
  volume: 0,
  toggle: () => {},
  play: () => {},
  pause: () => {},
  next: () => {},
  prev: () => {},
  setVolume: () => {},
};

export const MusicContext = createContext<MusicApi>(noop);

/** Safe outside `<MusicProvider>` (no-ops). */
export function useMusic(): MusicApi {
  return useContext(MusicContext);
}
