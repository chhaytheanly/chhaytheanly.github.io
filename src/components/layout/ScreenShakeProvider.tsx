import { useCallback, useMemo, useRef, type ReactNode } from 'react';
import { gsap, setWillChange, prefersReducedMotion } from '../../utils/gsapDefaults';
import { ScreenShakeContext, type ScreenShakeApi } from '../../hooks/useScreenShake';

/**
 * Wraps page content in a single transform layer that heavy impacts kick.
 * Only `x`/`y` are tweened — no layout is ever touched — and `will-change`
 * is attached for the duration of the shake only, never parked on idle nodes.
 */
export function ScreenShakeProvider({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const node = useRef<HTMLDivElement>(null);
  const current = useRef<gsap.core.Timeline | null>(null);

  const shake = useCallback((strength = 5) => {
    const el = node.current;
    if (!el || prefersReducedMotion()) return;

    current.current?.kill();
    const release = setWillChange(el, 'transform');
    const s = Math.min(Math.max(strength, 1), 14);

    current.current = gsap
      .timeline({
        onComplete: () => {
          gsap.set(el, { clearProps: 'willChange' });
          release();
        },
      })
      .set(el, { force3D: true })
      .to(el, {
        keyframes: [
          { x: -s, y: s * 0.4 },
          { x: s * 0.8, y: -s * 0.3 },
          { x: -s * 0.5, y: -s * 0.2 },
          { x: s * 0.3, y: s * 0.15 },
          { x: 0, y: 0 },
        ],
        duration: 0.28, // snappy: well under the 0.5s ceiling
        ease: 'none',
        force3D: true,
      });
  }, []);

  const api = useMemo<ScreenShakeApi>(() => ({ shake }), [shake]);

  return (
    <ScreenShakeContext.Provider value={api}>
      <div ref={node} className={className}>
        {children}
      </div>
    </ScreenShakeContext.Provider>
  );
}

export default ScreenShakeProvider;
