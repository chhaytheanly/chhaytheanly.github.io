import { gsap } from 'gsap';

/**
 * P3R GLOBAL GSAP DEFAULTS
 * Everything that animates in this project must be transform/opacity only.
 * These defaults enforce the house style so component code stays terse.
 */
gsap.defaults({
  duration: 0.3, // snappy: 0.2s–0.5s, never floaty
  ease: 'power4.out',
  overwrite: 'auto',
  // NOTE: `force3D` is deliberately NOT set here — gsap.core rejects it as a
  // default ("Missing plugin?"). CSSPlugin honours it per-tween, so every
  // tween in this codebase passes `force3D: true` explicitly.
});

/** The only two properties this codebase is allowed to tween. */
export const ANIMATABLE = ['x', 'y', 'scale', 'scaleX', 'scaleY', 'rotation', 'rotationZ', 'skewX', 'skewY', 'opacity'] as const;

/** Eases we are allowed to use (snappy, game-menu feel). */
export const EASE = {
  snappy: 'power4.out',
  slam: 'power4.in',
  kinetic: 'expo.out',
  impact: 'expo.inOut',
} as const;

/** Durations, in seconds. Hard-capped at 0.5 for UI interactions. */
export const D = {
  instant: 0.12,
  fast: 0.2,
  base: 0.3,
  slow: 0.45,
  flash: 0.15,
} as const;

/**
 * `will-change` is a GPU-memory hint, not free. Apply it on tween start,
 * strip it on complete — never leave it parked on idle elements.
 */
export function setWillChange(target: gsap.TweenTarget, value = 'transform') {
  const el = gsap.utils.toArray<HTMLElement>(target);
  el.forEach((node) => {
    node.style.willChange = value;
  });
  return () => {
    el.forEach((node) => {
      node.style.willChange = 'auto';
    });
  };
}

/**
 * Hard guard: dev-only tripwire. If a tween ever targets a layout-triggering
 * property, warn loudly instead of silently tanking the frame budget.
 */
const FORBIDDEN = /^(width|height|top|left|right|bottom|margin\w*|padding\w*|fontSize|lineHeight|flexBasis|borderWidth)$/;

if (import.meta.env.DEV) {
  const proto = gsap.core.Animation.prototype as unknown as Record<string, unknown>;
  const originalRender = proto.render as (this: unknown, ...args: unknown[]) => void;
  proto.render = function patchedRender(
    this: { vars?: Record<string, unknown>; targets?: () => unknown },
    ...args: unknown[]
  ) {
    if (this.vars) {
      for (const key of Object.keys(this.vars)) {
        if (FORBIDDEN.test(key)) {
          console.warn(
            `[p3] PERF VIOLATION: tweening "${key}" triggers layout. Use transform/opacity instead.`,
          );
        }
      }
    }
    return originalRender.apply(this, args);
  };
}

/** Users who ask for less motion still get instant, non-animated states. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap };
