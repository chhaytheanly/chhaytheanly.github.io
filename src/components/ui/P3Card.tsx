import { useRef, useState, type ReactNode } from 'react';
import { gsap } from '../../utils/gsapDefaults';
import { useAudio } from '../../hooks/useAudio';
import { useIsomorphicLayoutEffect } from '../../hooks/useGsap';

interface P3CardProps {
  children: ReactNode;
  onClick?: () => void;
  accent?: 'cyan' | 'yellow' | 'red';
  className?: string;
  /** Adds a subtle 3D tilt on hover. Transform-only. */
  tilt?: boolean;
  index?: number;
  as?: 'div' | 'article' | 'li';
}

const ACCENTS = {
  cyan: { border: 'border-electric-cyan', shadow: 'bg-electric-cyan', label: 'text-electric-cyan' },
  yellow: { border: 'border-alert-yellow', shadow: 'bg-alert-yellow', label: 'text-alert-yellow' },
  red: { border: 'border-blood-red', shadow: 'bg-blood-red', label: 'text-blood-red' },
} as const;

/**
 * Hard-bordered P3R panel.
 * Idle  → flat cyan edge with an offset shadow parked 10px out.
 * Hover → face lifts up-left, shadow tightens and turns alert-yellow.
 * Click → face slams down-right into the shadow.
 *
 * PERF: all motion is GSAP transform (`x`/`y`/`rotationY`); colour swaps are
 * paint-only. `perspective` lives on the face, never on a layout container.
 */
export function P3Card({
  children,
  onClick,
  accent = 'cyan',
  className = '',
  tilt = false,
  as = 'div',
  index,
}: P3CardProps) {
  const face = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const { play, playVaried } = useAudio();
  const a = ACCENTS[accent];
  const interactive = Boolean(onClick);

  useIsomorphicLayoutEffect(() => {
    const el = face.current;
    if (!el) return;
    gsap.set(el, { force3D: true });
    return () => {
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: 'transform' });
    };
  }, []);

  /** `y` carries both the lift and the tilt so the axes never fight. */
  const move = (lift: number, tiltY = 0) =>
    gsap.to(face.current, {
      x: lift,
      y: lift,
      rotationY: tilt ? tiltY : 0,
      duration: 0.2,
      ease: 'power4.out',
      force3D: true,
      overwrite: 'auto',
    });

  const offset = pressed
    ? 'translate-x-0 translate-y-0'
    : hovered
      ? 'translate-x-[5px] translate-y-[5px]'
      : 'translate-x-[10px] translate-y-[10px]';

  const Tag = as as 'div';

  return (
    <div className={`group relative ${className}`} style={tilt ? { perspective: '900px' } : undefined}>
      {/* hard, offset, solid-colour shadow */}
      <span
        aria-hidden
        className={`absolute inset-0 clip-p3-sm transition-transform duration-150 ease-out ${offset} ${
          hovered && !pressed ? 'bg-alert-yellow' : a.shadow
        }`}
      />

      <Tag
        ref={face}
        onPointerEnter={() => {
          if (!interactive) return;
          setHovered(true);
          play('hover', { rate: 0.94 + Math.random() * 0.14 });
          move(-5, -4);
        }}
        onPointerLeave={() => {
          setHovered(false);
          setPressed(false);
          move(0, 0);
        }}
        onPointerDown={() => interactive && setPressed(true)}
        onPointerUp={() => interactive && setPressed(false)}
        onPointerCancel={() => interactive && setPressed(false)}
        onClick={() => {
          if (!onClick) return;
          playVaried('click_heavy');
          onClick();
        }}
        data-index={index}
        className={`relative clip-p3-sm border-2 bg-midnight/90 transition-colors duration-150 ease-out ${
          a.border
        } ${interactive ? 'cursor-pointer' : ''}`}
      >
        {children}
      </Tag>
    </div>
  );
}

export default P3Card;
