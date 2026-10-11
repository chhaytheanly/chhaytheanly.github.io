import { createContext, useContext } from 'react';

export interface GameApi {
  /** Move the menu cursor. Wraps at both ends, like a console menu. */
  moveCursor: (delta: number) => void;
  /** Fire the row under the cursor. */
  confirm: () => void;
  /** Previous / next section, with the full page transition + cues. */
  changeRoute: (delta: 1 | -1) => void;
  /** Jump straight to a section by index (the 1–4 keys). */
  goto: (index: number) => void;
  /** Index of the highlighted row within the active menu, for the HUD. */
  cursorIndex: number;
  /** True once a key has been pressed — the HUD fades in from then on. */
  engaged: boolean;
}

const noop: GameApi = {
  moveCursor: () => {},
  confirm: () => {},
  changeRoute: () => {},
  goto: () => {},
  cursorIndex: 0,
  engaged: false,
};

export const GameContext = createContext<GameApi>(noop);

/**
 * Read the game cursor. Components opt in by marking themselves with
 * `data-game-menu` (the container) and `data-game-item` (each row) — no refs,
 * no prop drilling, and it works for any menu you add later.
 */
export function useGameInput(): GameApi {
  return useContext(GameContext);
}
