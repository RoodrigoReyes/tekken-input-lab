import { launcherOf } from '../library/filters';
import type { ParseResult } from '../../types/notation';

export type CommunityGame = 't8' | 't7';
export interface CommunityCombo {
  id: number | string;
  game: CommunityGame;
  character: string;
  raw: string;
  hits: number | null;
  damage: number | null;
  tags: string[];
  author: string;
  date: string;
  source: string;
}
export interface ConvertedCombo extends CommunityCombo {
  notation: string;
  result: ParseResult;
  clean: boolean;
}
export interface ExploreFilters {
  character: string;
  query: string;
  tags: string[];
  launcher: string;
  cleanOnly: boolean;
  sort: 'newest' | 'damage' | 'hits';
}
export const DEFAULT_FILTERS: ExploreFilters = { character: '', query: '', tags: [], launcher: '', cleanOnly: true, sort: 'newest' };

function dateValue(date: string): number {
  const [month, day, year] = date.split('/').map(Number);
  return year && month && day ? year * 10000 + month * 100 + day : 0;
}

export function filterAndSortCombos(combos: readonly ConvertedCombo[], filters: ExploreFilters): ConvertedCombo[] {
  const query = filters.query.toLocaleLowerCase().trim();
  return combos.filter((combo) =>
    (!filters.character || combo.character === filters.character) &&
    (!query || combo.notation.toLocaleLowerCase().includes(query) || combo.author.toLocaleLowerCase().includes(query)) &&
    filters.tags.every((tag) => combo.tags.some((t) => t.toLocaleLowerCase() === tag.toLocaleLowerCase())) &&
    (!filters.launcher || launcherOf(combo.notation) === filters.launcher) &&
    (!filters.cleanOnly || combo.clean),
  ).sort((a, b) => {
    if (filters.sort === 'damage') return (b.damage ?? -1) - (a.damage ?? -1);
    if (filters.sort === 'hits') return (b.hits ?? -1) - (a.hits ?? -1);
    return dateValue(b.date) - dateValue(a.date);
  });
}
