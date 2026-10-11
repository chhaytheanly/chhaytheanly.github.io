import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import '../utils/gsapDefaults'; // registers the house defaults once

/** SSR-safe layout effect. */
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Scoped GSAP context. Every tween created inside is reverted on unmount, so
 * fast navigation can never leak orphaned tweens or stranded GPU layers.
 */
export function useGsap(
  setup: (ctx: { root: HTMLElement; isMobile: boolean; reduced: boolean }) => void,
  deps: unknown[] = [],
) {
  const root = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      setup({
        root: el,
        reduced,
        isMobile: window.matchMedia('(max-width: 768px)').matches,
      });
    }, el);

    return () => ctx.revert();
  }, deps);

  return root;
}
