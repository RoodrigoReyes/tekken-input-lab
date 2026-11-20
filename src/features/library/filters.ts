/** Pure search / filter logic for the combo library. */
import type { Combo, Difficulty } from '../../types/combo';
import type { GameId } from '../../types/notation';

export interface LibraryFilters {
  query: string;
  game: GameId | 'all';
  character: string;
  partner: string;
  difficulty: Difficulty | 'all';
  launcher: string;
  position: 'all' | 'open' | 'wall';
  tags: readonly string[];
  favoritesOnly: boolean;
}

export const EMPTY_FILTERS: LibraryFilters = {
  query: '',
  game: 'all',
  character: '',
  partner: '',
  difficulty: 'all',
  launcher: '',
  position: 'all',
  tags: [],
  favoritesOnly: false,
};

const fold = (s: string): string => s.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
/** Notation compared without whitespace so "df+1, 2" finds "df+1,2". */
const squash = (s: string): string => s.toLocaleLowerCase().replace(/\s+/g, '');

function sameName(a: string, b: string): boolean {
  return a.localeCompare(b, undefined, { sensitivity: 'base' }) === 0;
}

export function launcherOf(notation: string): string {
  const closers: string[] = [];
  let end = notation.length;
  for (let i = 0; i < notation.length; i++) {
    const char = notation[i];
    if (char === '[' || char === '(') closers.push(char === '[' ? ']' : ')');
    else if (char === closers[closers.length - 1]) closers.pop();
    else if (char === '>' && closers.length === 0) {
      end = i;
      break;
    }
  }
  return notation.slice(0, end).trim().replace(/\s+/g, ' ');
}

export function matchesFilters(combo: Combo, f: LibraryFilters): boolean {
  if (f.game !== 'all' && combo.game !== f.game) return false;
  if (f.difficulty !== 'all' && combo.difficulty !== f.difficulty) return false;
  if (f.position !== 'all' && combo.position !== f.position) return false;
  if (f.launcher && launcherOf(combo.notation) !== f.launcher) return false;
  if (f.favoritesOnly && !combo.favorite) return false;
  if (f.character && !sameName(combo.character, f.character)) return false;
  if (f.partner && !(combo.partner && sameName(combo.partner, f.partner))) return false;
  if (f.tags.length && !f.tags.every((t) => combo.tags.some((ct) => sameName(ct, t)))) return false;
  const q = fold(f.query);
  if (!q) return true;
  return fold(combo.name).includes(q) || squash(combo.notation).includes(squash(q)) || combo.tags.some((t) => fold(t).includes(q));
}

export function collectLaunchers(combos: readonly Combo[], filters: LibraryFilters): string[] {
  const counts = new Map<string, number>();
  for (const combo of combos) {
    if (!matchesFilters(combo, { ...filters, launcher: '' })) continue;
    const launcher = launcherOf(combo.notation);
    if (launcher) counts.set(launcher, (counts.get(launcher) ?? 0) + 1);
  }
  return [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)! || a.localeCompare(b));
}

export function filterCombos(combos: readonly Combo[], f: LibraryFilters): Combo[] {
  return combos.filter((c) => matchesFilters(c, f));
}

/** Distinct values (case-insensitive) sorted alphabetically. */
function distinct(values: Iterable<string>): string[] {
  const map = new Map<string, string>();
  for (const v of values) {
    const key = v.toLocaleLowerCase();
    if (v && !map.has(key)) map.set(key, v);
  }
  return [...map.values()].sort((a, b) => a.localeCompare(b));
}

export function collectTags(combos: readonly Combo[]): string[] {
  return distinct(combos.flatMap((c) => c.tags));
}

export function collectCharacters(combos: readonly Combo[]): string[] {
  return distinct(combos.map((c) => c.character));
}

export function collectPartners(combos: readonly Combo[]): string[] {
  return distinct(combos.flatMap((c) => (c.partner ? [c.partner] : [])));
}
