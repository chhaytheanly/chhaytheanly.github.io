import { createContext, useContext } from 'react';

export interface ScreenShakeApi {
  /** `strength` in px (5 = the spec'd micro shake). Transform-only, ~0.28s. */
  shake: (strength?: number) => void;
}

/** No-op outside a provider, so components stay testable in isolation. */
const noop: ScreenShakeApi = { shake: () => {} };

export const ScreenShakeContext = createContext<ScreenShakeApi>(noop);

/** Access the active screen shake. Safe (no-op) outside `<ScreenShakeProvider>`. */
export function useScreenShake(): ScreenShakeApi {
  return useContext(ScreenShakeContext);
}
