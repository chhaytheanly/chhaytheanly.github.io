import { useRef, type ElementType } from 'react';
import { gsap, setWillChange, prefersReducedMotion } from '../../utils/gsapDefaults';
import { useIsomorphicLayoutEffect } from '../../hooks/useGsap';

export interface KineticTextProps {
  text: string;
  /** Rendered element. Defaults to `span` so it composes anywhere. */
  as?: ElementType;
  /** Stagger granularity. */
  per?: 'char' | 'word';
  className?: string;
  /** Seconds before the first unit animates. */
  delay?: number;
  stagger?: number;
  duration?: number;
  /**
   * Change this value to replay the entrance (e.g. the current route).
   * Without it, the text animates once on mount.
   */
  replayKey?: string | number;
  /** Override the default entrance. */
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
}

type Unit = { chars: string[]; key: string; space: boolean };

/** Split into words → chars, keeping trailing spaces so wrapping still works. */
function split(text: string, per: 'char' | 'word'): Unit[] {
  if (per === 'word') {
    return text.split(' ').map((w, i) => ({ chars: [w], key: `w${i}`, space: i < text.split(' ').length - 1 }));
  }
  return Array.from(text).map((c, i) => ({
    chars: [c],
    key: `c${i}`,
    space: c === ' ',
  }));
}

/**
 * KINETIC TEXT
 *
 * Splits a string into per-word / per-character spans and slams them in.
 * Default entrance (P3R house style):
 *     scale 3 → 1 · opacity 0 → 1 · skewY 10 → 0 · expo.out · stagger 0.05
 *
 * PERF: each unit is `inline-block`, so the browser keeps normal text layout
 * and wrapping. Only `transform` + `opacity` are tweened — no layout, ever.
 * `will-change` is applied for the duration of the run and stripped after.
 */
export function KineticText({
  text,
  as: Tag = 'span',
  per = 'char',
  className = '',
  delay = 0,
  stagger = 0.05,
  duration = 0.45,
  replayKey,
  from,
  to,
}: KineticTextProps) {
  const root = useRef<HTMLElement>(null);
  const units = split(text, per);
  const fromKey = JSON.stringify(from ?? null);
  const toKey = JSON.stringify(to ?? null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = el.querySelectorAll('[data-unit]');
    if (!targets.length) return;

    if (prefersReducedMotion()) {
      gsap.set(targets, { clearProps: 'all' });
      return;
    }

    const release = setWillChange(targets, 'transform,opacity');

    const start = { scale: 3, opacity: 0, skewY: 10, transformOrigin: '0% 50%', force3D: true, ...from };
    const end = {
      scale: 1,
      opacity: 1,
      skewY: 0,
      duration,
      ease: 'expo.out' as const,
      stagger,
      delay,
      force3D: true,
      ...to,
    };

    const tl = gsap.timeline({
      onComplete: () => {
        release();
        gsap.set(targets, { clearProps: 'willChange,transform,opacity' });
      },
    });

    tl.fromTo(targets, start, end);

    return () => {
      tl.kill();
      release();
    };
    // `from`/`to` are compared by value so an inline object literal doesn't
    // re-run the entrance on every parent render.
  }, [text, per, delay, stagger, duration, replayKey, fromKey, toKey]);

  return (
    <Tag ref={root} className={className} aria-label={text}>
      {units.map((unit) => (
        <span
          key={unit.key}
          data-unit=""
          className="inline-block whitespace-pre will-change-transform"
          aria-hidden
        >
          {unit.chars}
          {/* Non-breaking gap after a word. A space char is already its own
              unit, so adding one here too would double the gap. */}
          {unit.space && !/\s/.test(unit.chars[0] ?? '') && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}

export default KineticText;
