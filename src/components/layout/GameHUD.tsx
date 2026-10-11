import { useEffect, useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { useGameInput } from '../../hooks/useGameInput';
import { useMusic } from '../../hooks/useMusic';
import { useAudio } from '../../hooks/useAudio';

const KEYS: [string, string][] = [
  ['↑ ↓', 'MOVE CURSOR'],
  ['← →', 'SWITCH SECTION'],
  ['ENTER', 'CONFIRM'],
  ['1–4', 'JUMP TO'],
  ['M', 'MUSIC'],
  ['ESC', 'BACK'],
];

/**
 * CONTROL LEGEND — the "insert coin" strip.
 *
 * Only appears once the player touches a key (`engaged`), so the first load
 * stays clean and the HUD reveals itself as an invitation to play.
 */
export function GameHUD() {
  const { engaged } = useGameInput();
  const music = useMusic();
  const { play } = useAudio();
  const [hidden, setHidden] = useState(false);

  // H toggles the legend; keep it in sync with the global handler.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'h' || e.key === 'H') && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement | null;
        if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
        setHidden((h) => !h);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!engaged || hidden) return null;

  return (
    <aside
      aria-label="Controls"
      className="pointer-events-none fixed bottom-4 right-4 z-[55] origin-bottom-right scale-95 opacity-0 transition-[transform,opacity] duration-300 ease-out hover:scale-100 sm:scale-100 sm:opacity-100"
    >
      <div className="clip-p3-sm border-2 border-electric-cyan/50 bg-dark-hour/85 px-4 py-3 backdrop-blur-sm">
        <div className="mb-2 flex items-center gap-2 border-b border-electric-cyan/25 pb-2">
          <Gamepad2 size={14} strokeWidth={2.5} className="text-alert-yellow" />
          <span className="font-mono text-[9px] tracking-[0.3em] text-stark-white/70">CONTROLS</span>
          <span className="ml-auto font-mono text-[9px] tracking-[0.2em] text-stark-white/35">
            {music.playing ? '♫ ON' : '♫ OFF'}
          </span>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
          {KEYS.map(([key, label]) => (
            <li key={key} className="flex items-center gap-2">
              <kbd className="min-w-[3.4rem] border border-stark-white/25 px-1 text-center font-mono text-[9px] text-electric-cyan">
                {key}
              </kbd>
              <span className="font-mono text-[9px] tracking-widest text-stark-white/55">{label}</span>
            </li>
          ))}
        </ul>
      </div>
      <span className="sr-only" aria-live="polite">
        Music {music.playing ? 'playing' : 'paused'}
      </span>
      <button
        onClick={() => {
          play('click_light');
          setHidden(true);
        }}
        className="sr-only"
      >
        Hide controls
      </button>
    </aside>
  );
}

export default GameHUD;
