import type { Combo } from '../../types/combo';

/** The `limit` most recently updated combos, newest first (the input is left untouched). */
export function recentCombos(combos: readonly Combo[], limit: number): Combo[] {
  return [...combos].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit);
}
