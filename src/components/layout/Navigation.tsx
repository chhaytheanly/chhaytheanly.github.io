import { Volume2, VolumeX } from 'lucide-react';
import { useRef } from 'react';
import { useAudio } from '../../hooks/useAudio';
import { useIsomorphicLayoutEffect } from '../../hooks/useGsap';
import { ROUTES, navigate } from '../../hooks/useHashRoute';
import { gsap, prefersReducedMotion, setWillChange } from '../../utils/gsapDefaults';
import { MusicControls } from './MusicControls';

/** Degrees the bar rests at. The label row counter-skews to stay upright. */
const REST_SKEW = -8;
const ENTRY_SKEW = -22;

/**
 * P3R NAVIGATION
 *
 * It does not fade in. The whole bar SLAMS in from the left while unskewing
 * from -22° to its resting -8°, and each item staggers behind it.
 *
 * PERF: `xPercent` + `skewX` are pure transforms on one composited layer.
 * `will-change` is attached for the 0.45s entrance, then stripped forever.
 */
export function Navigation({ route }: { route: string }) {
  const bar = useRef<HTMLDivElement>(null);
  const items = useRef<HTMLDivElement>(null);
  const { muted, toggleMute, play } = useAudio();

  useIsomorphicLayoutEffect(() => {
    const el = bar.current;
    const list = items.current;
    if (!el || !list) return;

    if (prefersReducedMotion()) {
      gsap.set(el, { xPercent: 0, skewX: REST_SKEW });
      gsap.set(list.children, { opacity: 1, x: 0 });
      return;
    }

    const release = setWillChange(el, 'transform');
    gsap.set(el, { force3D: true });

    const tl = gsap.timeline({
      onComplete: () => {
        release();
        gsap.set(el, { clearProps: 'willChange' });
      },
    });

    tl.fromTo(
      el,
      { xPercent: -120, skewX: ENTRY_SKEW },
      { xPercent: 0, skewX: REST_SKEW, duration: 0.45, ease: 'expo.out', force3D: true },
    ).fromTo(
      list.children,
      { opacity: 0, x: -28 },
      { opacity: 1, x: 0, duration: 0.3, ease: 'power4.out', stagger: 0.05, force3D: true },
      0.18,
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-50" aria-label="Primary">
      <div
        ref={bar}
        className="origin-top border-b-2 border-electric-cyan/40 bg-dark-hour/90 backdrop-blur-sm"
      >
        <div
          ref={items}
          className="mx-auto flex max-w-7xl items-stretch justify-between gap-4 px-6 py-3"
          style={{ transform: `skewX(${-REST_SKEW}deg)` }}
        >
          {/* WORDMARK */}
          <button
            onClick={() => {
              play('click_heavy');
              navigate('/');
            }}
            className="group flex items-center gap-2 text-left"
          >
            <span className="clip-p3-slant-sm bg-electric-cyan px-2 py-1 font-display text-sm italic text-midnight transition-transform duration-150 ease-out group-hover:-translate-y-0.5">
              LCT
            </span>
            <span className="hidden font-mono text-[11px] tracking-[0.3em] text-stark-white/70 group-hover:text-alert-yellow sm:block">
              PORTFOLIO
            </span>
          </button>

          {/* ROUTES */}
          <ul className="flex items-stretch gap-1 overflow-x-auto">
            {ROUTES.map((item) => {
              const active = route === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => {
                      play('click_heavy');
                      navigate(item.path);
                    }}
                    onPointerEnter={() => !active && play('hover')}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative flex items-baseline gap-2 px-3 py-2 font-display text-sm uppercase italic tracking-wider transition-colors duration-150 ease-out ${
                      active ? 'text-alert-yellow' : 'text-stark-white/80 hover:text-electric-cyan'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-60">{item.index}</span>
                    <span className="whitespace-nowrap">{item.label}</span>
                    {/* active marker — transform/opacity only */}
                    <span
                      className={`absolute inset-x-1 bottom-0 h-[3px] origin-left bg-electric-cyan transition-transform duration-200 ease-out ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* AUDIO + THEME */}
          <div className="flex items-center gap-2">
            <MusicControls />
            <button
              onClick={() => {
                if (muted) play('click_light');
                toggleMute();
              }}
              aria-label={muted ? 'Unmute UI audio' : 'Mute UI audio'}
              title={muted ? 'SFX OFF' : 'SFX ON'}
              className="flex items-center gap-2 border-2 border-electric-cyan/40 px-2 py-1 font-mono text-[10px] tracking-widest text-electric-cyan transition-colors duration-150 hover:border-alert-yellow hover:text-alert-yellow"
            >
              {muted ? <VolumeX size={14} strokeWidth={2.5} /> : <Volume2 size={14} strokeWidth={2.5} />}
              <span className="hidden lg:inline">{muted ? 'OFF' : 'ON'}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
