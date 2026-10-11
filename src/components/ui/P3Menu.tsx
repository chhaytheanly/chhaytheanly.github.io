import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { gsap, prefersReducedMotion } from '../../utils/gsapDefaults';
import { useIsomorphicLayoutEffect } from '../../hooks/useGsap';

export interface MenuItem {
  id: string;
  label: string;
  hint: string;
  onSelect: () => void;
}

interface P3MenuProps {
  items: MenuItem[];
  /** Seconds after mount before the list staggers in. */
  delay?: number;
}

/**
 * P3 MAIN MENU LIST
 *
 * Slanted rows, index number, right-pointing chevron — the menu grammar of a
 * console UI. Rows arrive on a stagger, each sliding in from the left behind
 * its own accent wedge, transform + opacity only.
 */
export function P3Menu({ items, delay = 0.3 }: P3MenuProps) {
  const list = useRef<HTMLUListElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = list.current;
    if (!el) return;
    const rows = el.children;
    if (!rows.length) return;

    if (prefersReducedMotion()) {
      gsap.set(rows, { opacity: 1, x: 0 });
      return;
    }

    const tl = gsap.timeline({ delay });
    tl.fromTo(
      rows,
      { opacity: 0, x: -36, skewX: -12 },
      { opacity: 1, x: 0, skewX: 0, duration: 0.32, ease: 'power4.out', stagger: 0.06, force3D: true },
    );
    return () => {
      tl.kill();
    };
  }, [delay]);

  return (
    <ul ref={list} data-game-menu="" className="w-full max-w-md">
      {items.map((item, i) => (
        <li key={item.id}>
          <P3MenuRow item={item} index={i} />
        </li>
      ))}
    </ul>
  );
}

function P3MenuRow({ item, index }: { item: MenuItem; index: number }) {
  const row = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={row}
      data-game-item=""
      onClick={item.onSelect}
      onPointerEnter={() => {
        const el = row.current;
        if (!el) return;
        gsap.to(el, { x: 10, duration: 0.2, ease: 'power4.out', force3D: true });
      }}
      onPointerLeave={() => {
        const el = row.current;
        if (!el) return;
        gsap.to(el, { x: 0, duration: 0.25, ease: 'power4.out', force3D: true });
      }}
      className="group relative block w-full will-change-transform"
      style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 1.1rem) 100%, 0 100%)' }}
    >
      {/* hover wedge / game cursor wedge — opacity + transform only */}
      <span
        aria-hidden
        className="absolute inset-0 origin-left scale-x-0 bg-electric-cyan transition-transform duration-200 ease-out group-hover:scale-x-100 group-data-[cursor=true]:scale-x-100"
      />
      {/* the console cursor: a hard yellow wedge that only the keyboard shows */}
      <span
        aria-hidden
        className="absolute left-0 top-1/2 h-0 w-0 -translate-y-1/2 scale-0 bg-alert-yellow transition-transform duration-150 ease-out group-data-[cursor=true]:scale-100"
        style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)', marginLeft: '-10px' }}
      />
      <span className="relative flex items-center gap-4 px-5 py-4">
        <span className="font-mono text-xs text-stark-white/45 transition-colors duration-200 group-hover:text-midnight group-data-[cursor=true]:text-midnight">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="font-display text-2xl italic uppercase tracking-wide text-stark-white transition-colors duration-200 group-hover:text-midnight group-data-[cursor=true]:text-midnight">
          {item.label}
        </span>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-stark-white/50 transition-colors duration-200 group-hover:text-midnight/80 group-data-[cursor=true]:text-midnight/80">
          {item.hint}
        </span>
        <ChevronRight
          size={20}
          strokeWidth={3}
          className="text-electric-cyan transition-all duration-200 ease-out group-hover:translate-x-1 group-hover:text-midnight group-data-[cursor=true]:translate-x-1 group-data-[cursor=true]:text-midnight"
        />
      </span>
    </button>
  );
}

export default P3Menu;
