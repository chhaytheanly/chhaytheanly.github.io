import { useRef } from 'react';
import portraitSrc from '../../assets/portrait.png';
import { gsap, setWillChange, prefersReducedMotion, D } from '../../utils/gsapDefaults';
import { useIsomorphicLayoutEffect } from '../../hooks/useGsap';
import { useAudio } from '../../hooks/useAudio';
import { useScreenShake } from '../../hooks/useScreenShake';

interface PortraitDropProps {
  /** Seconds after mount before the drop starts. */
  delay?: number;
  className?: string;
  /** Overrides the built-in hover drift. */
  interactive?: boolean;
}

/**
 * P3R MENU PORTRAIT
 *
 * The main-menu drop: the portrait starts ABOVE the frame and slams down into
 * its slot with `expo.out`, overshooting slightly on scale before settling —
 * the same read as the Persona menu screen.
 *
 * PERF: one composited layer, `yPercent` / `scale` / `skewY` only. The slow
 * hover drift is a separate infinite tween that starts AFTER the drop has
 * landed, so the two never fight over `y`. `will-change` is applied for the
 * drop and then parked only for the (single) drifting element.
 */
export function PortraitDrop({ delay = 0, className = '', interactive = true }: PortraitDropProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const { play } = useAudio();
  const { shake } = useScreenShake();

  useIsomorphicLayoutEffect(() => {
    const el = wrap.current;
    const back = plate.current;
    if (!el) return;

    gsap.set(el, { force3D: true });

    if (prefersReducedMotion()) {
      gsap.set(el, { yPercent: 0, scale: 1, skewY: 0, opacity: 1 });
      gsap.set(back, { scaleX: 1, opacity: 1 });
      return;
    }

    const release = setWillChange(el, 'transform');

    const tl = gsap.timeline({
      delay,
      onComplete: () => {
        release();
        gsap.set(el, { clearProps: 'willChange' });
        shake(3); // the landing kick
      },
    });

    tl.fromTo(
      el,
      { yPercent: -118, scale: 1.08, skewY: -6, opacity: 0 },
      {
        yPercent: 0,
        scale: 1,
        skewY: 0,
        opacity: 1,
        duration: D.slow,
        ease: 'expo.out',
        force3D: true,
      },
    );

    // The hard offset plate snaps in a beat later, like a UI panel locking on.
    if (back) {
      tl.fromTo(
        back,
        { scaleY: 0, opacity: 0, transformOrigin: '50% 0%' },
        { scaleY: 1, opacity: 1, duration: D.base, ease: 'power4.out', force3D: true },
        '-=0.22',
      );
    }

    return () => {
      tl.kill();
      release();
    };
  }, [delay, shake]);

  /* Slow drift while the menu is idle — starts only once the drop has landed. */
  useIsomorphicLayoutEffect(() => {
    const el = wrap.current;
    if (!el || !interactive || prefersReducedMotion()) return;

    el.style.willChange = 'transform';
    const tween = gsap.to(el, {
      y: -10,
      duration: 3.4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: delay + D.slow,
      force3D: true,
    });

    return () => {
      tween.kill();
      el.style.willChange = 'auto';
      gsap.set(el, { clearProps: 'willChange,transform' });
    };
  }, [delay, interactive]);

  return (
    <div className={`pointer-events-none absolute inset-y-0 right-0 select-none ${className}`}>
      {/* ---- hard offset plate behind the portrait ---- */}
      <div
        ref={plate}
        aria-hidden
        className="absolute inset-y-[14%] right-[10%] w-[72%] bg-electric-cyan/20"
        style={{ clipPath: 'polygon(16% 0, 100% 0, 100% 100%, 0 100%)' }}
      />

      {/* ---- the portrait ---- */}
      <div ref={wrap} className="absolute inset-0 flex items-start justify-center">
        <img
          src={portraitSrc}
          alt="Persona 3 Reload protagonist"
          width={900}
          height={945}
          decoding="async"
          draggable={false}
          onPointerEnter={() => interactive && play('hover')}
          className="h-[86%] w-auto max-w-none object-contain object-top"
          style={{
            // the cut-out is black/white line art — punch it up to match the
            // P3 palette without touching a single pixel of layout
            filter: 'contrast(1.14) brightness(1.02)',
            // fades the artwork out before it collides with the menu below
            maskImage: 'linear-gradient(to bottom, #000 68%, rgba(0,0,0,0.35) 88%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, #000 68%, rgba(0,0,0,0.35) 88%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
}

export default PortraitDrop;
