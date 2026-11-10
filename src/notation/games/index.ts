import type { GameId } from '../../types/notation';
import { T6 } from './t6';
import { T7 } from './t7';
import { T8 } from './t8';
import { TTT2 } from './ttt2';
import type { GameConfig } from './types';

export type { GameConfig } from './types';

/** Display order used by selectors. */
export const GAMES: readonly GameConfig[] = [T8, T7, TTT2, T6];

const BY_ID: Readonly<Record<GameId, GameConfig>> = { t6: T6, t7: T7, t8: T8, ttt2: TTT2 };

export function getGame(id: GameId): GameConfig {
  return BY_ID[id];
}

export function isGameId(value: unknown): value is GameId {
  return typeof value === 'string' && value in BY_ID;
}
