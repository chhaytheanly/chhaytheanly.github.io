import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../utils/gsapDefaults';
import { useIsomorphicLayoutEffect } from '../../hooks/useGsap';

export type ShapeName =
  | 'slant'
  | 'slant-sm'
  | 'slant-r'
  | 'notch'
  | 'cut'
  | 'arrow'
  | 'triangle'
  | 'diamond'
  | 'hex'
  | 'parallelogram'
  | 'bolt';

type Color = 'cyan' | 'yellow' | 'red' | 'white' | 'hour';

const CLIP: Record<ShapeName, string> = {
  slant: 'polygon(0 0, 100% 0, calc(100% - 1.25rem) 100%, 0 100%)',
  'slant-sm': 'polygon(0 0, 100% 0, calc(100% - 0.75rem) 100%, 0 100%)',
  'slant-r': 'polygon(1.25rem 0, 100% 0, 100% 100%, 0 100%)',
  notch: 'polygon(0 0, 100% 0, 100% calc(100% - 1.25rem), calc(100% - 1.25rem) 100%, 0 100%)',
  cut: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)',
  arrow: 'polygon(0 0, 100% 0, 100% 60%, 50% 100%, 0 60%)',
  triangle: 'polygon(50% 0, 100% 100%, 0 100%)',
  diamond: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
  hex: 'polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)',
  parallelogram: 'polygon(0 0, 88% 0, 100% 100%, 12% 100%)',
  bolt: 'polygon(0 0, 62% 0, 38% 42%, 100% 42%, 22% 100%, 44% 56%, 0 56%)',
};

const COLORS: Record<Color, string> = {
  cyan: '#00E5FF',
  yellow: '#FFD700',
  red: '#E60000',
  white: '#F8F9FA',
  hour: '#001F3F',
};

export interface GeometricShapeProps {
  shape?: ShapeName;
  color?: Color;
  /** Tailwind sizing, e.g. "h-24 w-24". */
  size?: string;
  /** px travelled per drift cycle. */
  drift?: number;
  /** Degrees of drift per cycle. */
  sway?: number;
  /** Degrees of slow spin per cycle (0 disables). */
  spin?: number;
  /** Seconds for one full drift cycle. Slow = ambient. */
  duration?: number;
  delay?: number;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Decorative P3R geometry — pure CSS `clip-path`, zero SVG, zero images.
 *
 * The drift loop tweens ONLY `x`, `y` and `rotation`, forever, on the GPU.
 * `will-change` is attached while it runs and stripped if motion is reduced.
 */
export function GeometricShape({
  shape = 'slant',
  color = 'cyan',
  size = 'h-16 w-16',
  drift = 18,
  sway = 4,
  spin = 0,
  duration = 6,
  delay = 0,
  opacity = 0.2,
  className = '',
  style,
}: GeometricShapeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { force3D: true });
    if (prefersReducedMotion()) return;

    el.style.willChange = 'transform';

    const tween = gsap.to(el, {
      x: drift,
      y: -drift * 0.6,
      rotation: spin || sway,
      duration,
      delay,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      force3D: true,
    });

    return () => {
      tween.kill();
      el.style.willChange = 'auto';
      gsap.set(el, { clearProps: 'transform,willChange' });
    };
  }, [drift, duration, delay, sway, spin]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute select-none ${size} ${className}`}
      style={{
        clipPath: CLIP[shape],
        backgroundColor: COLORS[color],
        opacity,
        ...style,
      }}
    />
  );
}

export default GeometricShape;
