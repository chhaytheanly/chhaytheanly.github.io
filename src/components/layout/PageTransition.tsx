import { useRef, useState, type ReactNode } from 'react';
import { gsap, setWillChange, prefersReducedMotion, D } from '../../utils/gsapDefaults';
import { useIsomorphicLayoutEffect } from '../../hooks/useGsap';
import { useAudio } from '../../hooks/useAudio';
import { useScreenShake } from '../../hooks/useScreenShake';

/**
 * P3R PAGE TRANSITION
 *
 * Sequence on navigate (total ≈ 0.6s, nothing floaty):
 *   1. electric-cyan full-screen flash    opacity 0 → 1 → 0 in 150ms
 *   2. old page slams out                xPercent 0 → -100, power2.in
 *   3. content swaps at full coverage    (the seam is invisible)
 *   4. new page slams in                 xPercent 100 → 0, power4.out, force3D
 *   5. micro screen shake + impact cue   sells the landing
 *
 * PERF: only `xPercent` and `opacity` are ever tweened, on a single composited
 * layer. `will-change` is attached when a transition starts and stripped the
 * instant it lands — never parked on an idle element.
 */
export function PageTransition({ route, children }: { route: string; children: ReactNode }) {
  const [displayed, setDisplayed] = useState(route);
  const shell = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const locked = useRef(false);
  const enterNext = useRef(false); // set by the OUT timeline, consumed by IN
  const booted = useRef(false);
  const { play } = useAudio();
  const { shake } = useScreenShake();

  /* ---------- OUT: flash → slam out → swap ---------- */
  useIsomorphicLayoutEffect(() => {
    const el = shell.current;
    const fl = flash.current;
    if (!el || !fl || route === displayed || locked.current) return;

    if (prefersReducedMotion()) {
      setDisplayed(route);
      gsap.set(el, { xPercent: 0 });
      return;
    }

    locked.current = true;
    play('menu_swoosh');
    const release = setWillChange(el, 'transform');
    gsap.set(el, { force3D: true, xPercent: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        locked.current = false;
      },
    });

    tl.fromTo(
      fl,
      { opacity: 0 },
      { opacity: 1, duration: D.flash * 0.4, ease: 'power2.out', force3D: true },
    )
      .to(fl, { opacity: 0, duration: D.flash * 0.6, ease: 'power2.in' }, D.flash * 0.4)
      .to(el, { xPercent: -100, duration: 0.28, ease: 'power2.in', force3D: true }, D.flash * 0.7)
      .add(() => {
        play('transition_impact');
        enterNext.current = true;
        setDisplayed(route);
      })
      .add(() => release());

    return () => {
      tl.kill();
      release();
      // The effect re-runs the instant `displayed` changes (which happens INSIDE
      // the timeline), so the lock must be released here too — otherwise every
      // navigation after the first is silently swallowed.
      locked.current = false;
    };
  }, [route, displayed, play]);

  /* ---------- IN: slam the new page in from the right ---------- */
  useIsomorphicLayoutEffect(() => {
    const el = shell.current;
    if (!el) return;

    // First paint: the page simply IS. No entrance animation on boot.
    if (!booted.current) {
      booted.current = true;
      gsap.set(el, { xPercent: 0 });
      return;
    }

    if (!enterNext.current || prefersReducedMotion()) {
      gsap.set(el, { xPercent: 0 });
      return;
    }
    enterNext.current = false;

    gsap.fromTo(
      el,
      { xPercent: 100 },
      {
        xPercent: 0,
        duration: 0.35,
        ease: 'power4.out',
        force3D: true,
        onComplete: () => {
          gsap.set(el, { clearProps: 'willChange,transform' });
          shake(3);
        },
      },
    );
  }, [displayed, shake]);

  return (
    <>
      <div ref={shell} data-p3-shell="">
        {children}
      </div>

      {/* full-screen flash — above chrome, never blocks pointer events */}
      <div
        ref={flash}
        aria-hidden
        data-p3-flash=""
        className="pointer-events-none fixed inset-0 z-[60] bg-electric-cyan opacity-0"
      />
    </>
  );
}

export default PageTransition;
