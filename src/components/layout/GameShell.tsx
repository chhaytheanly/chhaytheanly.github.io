import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { GameContext, type GameApi } from '../../hooks/useGameInput';
import { useAudio } from '../../hooks/useAudio';
import { useMusic } from '../../hooks/useMusic';
import { ROUTES, navigate } from '../../hooks/useHashRoute';

/**
 * GAME SHELL — turns the portfolio into something you drive with a d-pad.
 *
 * ┌──────────────┬──────────┬─────────────────────────────────────┐
 * │  ↑ / ↓       │ cursor   │ walks the active menu, wrapping      │
 * │  ENTER/SPACE │ confirm  │ fires the highlighted row            │
 * │  ← / →       │ section  │ previous / next route, full transition│
 * │  1 … 4       │ jump     │ straight to a section                │
 * │  M / H       │ music/hud│ toggle theme + control legend        │
 * └──────────────┴──────────┴─────────────────────────────────────┘
 *
 * The cursor is written to the DOM as `data-cursor="true"` rather than held in
 * React state per row: any menu can opt in with two data attributes, and the
 * highlight is styled purely in CSS (an opacity/scale transition), so moving
 * the cursor never re-renders a tree.
 *
 * Typing in a field always wins — the Contact form is not a joystick.
 */
export function GameShell({ children }: { children: ReactNode }) {
  const { play, playVaried } = useAudio();
  const music = useMusic();
  const [cursorIndex, setCursorIndex] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const active = useRef<HTMLElement | null>(null);

  /** The menu the cursor belongs to: whatever the pointer is on, else the first. */
  const resolveMenu = useCallback((): HTMLElement | null => {
    const hovered = document.querySelector<HTMLElement>('[data-game-menu]:hover,[data-game-menu]:focus-within');
    return hovered ?? document.querySelector<HTMLElement>('[data-game-menu]');
  }, []);

  const rows = useCallback((menu: HTMLElement) =>
    Array.from(menu.querySelectorAll<HTMLElement>('[data-game-item]')),
  []);

  const paint = useCallback((menu: HTMLElement, index: number) => {
    const items = rows(menu);
    items.forEach((item, i) => {
      if (i === index) item.dataset.cursor = 'true';
      else delete item.dataset.cursor;
    });
    active.current = menu;
  }, [rows]);

  const moveCursor = useCallback(
    (delta: number) => {
      const menu = resolveMenu();
      if (!menu) return;
      const items = rows(menu);
      if (!items.length) return;

      const current = Math.max(0, items.findIndex((i) => i.dataset.cursor === 'true'));
      const next = (current + delta + items.length) % items.length;

      paint(menu, next);
      setCursorIndex(next);
      // focusing (without scrolling) keeps Enter/activation native
      items[next].focus({ preventScroll: true });
      items[next].scrollIntoView({ block: 'nearest' });
      play('hover', { rate: 0.94 + Math.random() * 0.14 });
    },
    [paint, play, resolveMenu, rows],
  );

  const confirm = useCallback(() => {
    const menu = resolveMenu();
    if (!menu) return;
    const items = rows(menu);
    const target = items.find((i) => i.dataset.cursor === 'true') ?? items[0];
    if (!target) return;
    playVaried('click_heavy');
    target.click();
  }, [playVaried, resolveMenu, rows]);

  const changeRoute = useCallback(
    (delta: 1 | -1) => {
      const i = ROUTES.findIndex((r) => r.path === window.location.hash.slice(1));
      const from = i === -1 ? 0 : i;
      const next = ROUTES[(from + delta + ROUTES.length) % ROUTES.length];
      play('menu_swoosh');
      navigate(next.path);
    },
    [play],
  );

  const goto = useCallback(
    (index: number) => {
      const route = ROUTES[index];
      if (!route) return;
      if (window.location.hash.slice(1) === route.path) return;
      play('menu_swoosh');
      navigate(route.path);
    },
    [play],
  );

  const api = useMemo<GameApi>(
    () => ({ moveCursor, confirm, changeRoute, goto, cursorIndex, engaged }),
    [moveCursor, confirm, changeRoute, goto, cursorIndex, engaged],
  );

  useEffect(() => {
    const isTyping = (el: EventTarget | null) => {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable;
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setEngaged(true);
          // on wide screens → also acts as "next section" when no menu is hovered
          if (e.key === 'ArrowDown') moveCursor(1);
          else changeRoute(1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setEngaged(true);
          if (e.key === 'ArrowUp') moveCursor(-1);
          else changeRoute(-1);
          break;
        case 'Enter':
        case ' ': {
          const menu = resolveMenu();
          if (!menu) return;
          const item = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-game-item]');
          // a row already under the cursor handles its own key press
          if (item && item.dataset.cursor === 'true') return;
          e.preventDefault();
          setEngaged(true);
          confirm();
          break;
        }
        case 'Escape': {
          const detail = document.querySelector<HTMLElement>('[data-project-detail]');
          if (detail) {
            e.preventDefault();
            play('menu_swoosh');
            detail.querySelector<HTMLButtonElement>('[data-close-detail]')?.click();
          } else if (window.location.hash.slice(1) !== '/') {
            e.preventDefault();
            changeRoute(-1);
          }
          break;
        }
        case 'm':
        case 'M':
          music.toggle();
          play('click_light');
          break;
        default:
          if (/^[1-9]$/.test(e.key)) {
            e.preventDefault();
            setEngaged(true);
            goto(Number(e.key) - 1);
          }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [changeRoute, confirm, goto, moveCursor, music, play, resolveMenu]);

  // Put the cursor on the first row as soon as the player touches a key,
  // so the highlight is always visible.
  useEffect(() => {
    if (!engaged) return;
    const menu = resolveMenu();
    if (menu && !menu.querySelector('[data-cursor="true"]')) paint(menu, 0);
  }, [engaged, paint, resolveMenu]);

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export default GameShell;
