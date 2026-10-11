import { useEffect, useMemo, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../utils/gsapDefaults';
import { useIsomorphicLayoutEffect } from '../../hooks/useGsap';

interface Layer {
  src: string;
  /** % of viewport width. */
  size: number;
  /** Horizontal placement as a % of the section width. */
  x: number;
  /** Vertical placement as a % of the section height. */
  y: number;
  opacity: number;
  /** Seconds for one drift cycle. */
  duration: number;
  /** Screen blend = the cyan art glows; multiply = it sinks into the dark. */
  blend: 'screen' | 'multiply' | 'lighten';
  /** px of scroll-linked travel. 0 disables the parallax listener. */
  parallax: number;
}

/**
 * Deterministic layout — no Math.random() in render, so the composition is
 * identical on every load (and between server/client if you ever SSR).
 */
const COMPOSITIONS: Record<string, Layer> = {
  'persona3.png': {
    src: '/pf/persona3.png',
    size: 46,
    x: 68,
    y: 6,
    opacity: 0.16,
    duration: 18,
    blend: 'screen',
    parallax: -40,
  },
  'persona3-rel.png': {
    src: '/pf/persona3-rel.png',
    size: 30,
    x: 88,
    y: 58,
    opacity: 0.12,
    duration: 22,
    blend: 'screen',
    parallax: 26,
  },
  'persona3-alt.png': {
    src: '/pf/persona3-alt.png',
    size: 34,
    x: 8,
    y: 52,
    opacity: 0.1,
    duration: 26,
    blend: 'lighten',
    parallax: 18,
  },
};

const FALLBACK: Layer = {
  src: '/pf/persona3.png',
  size: 40,
  x: 70,
  y: 10,
  opacity: 0.14,
  duration: 20,
  blend: 'screen',
  parallax: -30,
};

/**
 * PORTRAIT BACKDROP
 *
 * Animates the artwork in `public/pf/` behind a section. Drop new images in
 * that folder and add them to `siteContent.about.backdrop` — each one becomes
 * its own drifting, parallaxed, blend-moded layer.
 *
 * PERF:
 *  · Drift is one infinite GSAP tween per layer on its OWN element
 *    (`x`/`y`/`rotation` only) — it never touches the parallax tween, which
 *    owns a separate `yPercent`. Two axes, two tweens, zero conflict.
 *  · Parallax uses `gsap.quickTo`, so scrolling reuses a single tween per
 *    layer instead of creating one per scroll event.
 *  · Layers are `pointer-events-none` and `aria-hidden` — decorative only.
 */
export function PortraitBackdrop({ files, className = '' }: { files: string[]; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  const layers = useMemo<Layer[]>(
    () =>
      files
        .map((src) => COMPOSITIONS[src.split('/').pop() ?? ''] ?? { ...FALLBACK, src })
        .map((layer, i) => ({
          ...layer,
          // nudge anything not explicitly composed so overlapping art still reads
          y: layer.y + i * 14,
          duration: layer.duration + i * 3,
        })),
    [files],
  );

  // ---- ambient drift -------------------------------------------------
  useIsomorphicLayoutEffect(() => {
    const rootEl = root.current;
    if (!rootEl || prefersReducedMotion()) return;

    const nodes = rootEl.querySelectorAll<HTMLElement>('[data-backdrop-layer]');
    const tweens = Array.from(nodes, (node, i) => {
      const layer = layers[i];
      node.style.willChange = 'transform';
      return gsap.to(node, {
        x: `random(-26, 26)`,
        y: `random(-20, 20)`,
        rotation: `random(-5, 5)`,
        duration: layer.duration,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        force3D: true,
      });
    });

    return () => {
      tweens.forEach((t) => t.kill());
      nodes.forEach((n) => {
        n.style.willChange = 'auto';
      });
    };
  }, []);

  // ---- scroll parallax (quickTo: one reused tween per layer) ----------
  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl || prefersReducedMotion()) return;

    const setters = Array.from(rootEl.querySelectorAll<HTMLElement>('[data-backdrop-layer]'), (node, i) => ({
      node,
      setY: gsap.quickTo(node, 'yPercent', { duration: 0.6, ease: 'power3.out', force3D: true }),
      amount: layers[i]?.parallax ?? 0,
    }));

    const onScroll = () => {
      const rect = rootEl.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      setters.forEach(({ setY, amount }) => setY(amount * (progress - 0.5)));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div ref={root} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {layers.map((layer, i) => (
        <img
          key={`${layer.src}-${i}`}
          data-backdrop-layer
          src={layer.src}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute select-none"
          style={{
            width: `${layer.size}vw`,
            left: `${layer.x}%`,
            top: `${layer.y}%`,
            opacity: layer.opacity,
            mixBlendMode: layer.blend,
            transform: 'translate3d(-50%, -50%, 0)',
          }}
          onError={(e) => {
            // a missing extra in public/pf shouldn't leave a broken frame
            e.currentTarget.style.display = 'none';
          }}
        />
      ))}
    </div>
  );
}

export default PortraitBackdrop;
