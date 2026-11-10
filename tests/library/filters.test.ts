import { describe, expect, it } from 'vitest';
import { collectCharacters, collectPartners, collectTags, EMPTY_FILTERS, filterCombos } from '../../src/features/library/filters';
import type { Combo } from '../../src/types/combo';

const base: Combo = {
  id: '1', game: 't8', character: 'Jin', name: 'ZEN loop', notation: 'df+1,2 > ZEN.1', dialect: 'standard',
  sectionCharacters: [], tags: ['BnB'], difficulty: 'beginner', notes: '', favorite: false,
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
};
const combos: Combo[] = [
  base,
  { ...base, id: '2', game: 'ttt2', character: 'Kazuya', partner: 'Armor King', name: 'Tag wall', notation: 'EWGF, df+1,2~5', tags: ['wall', 'bnb'], difficulty: 'advanced', favorite: true },
  { ...base, id: '3', game: 't7', character: 'jin', name: 'Screw', notation: 'df+2 > S!', tags: [], difficulty: 'intermediate' },
];
const ids = (f: Partial<typeof EMPTY_FILTERS>) => filterCombos(combos, { ...EMPTY_FILTERS, ...f }).map((c) => c.id);

describe('library filters', () => {
  it('no filters returns everything', () => expect(ids({})).toEqual(['1', '2', '3']));
  it('searches name, notation (whitespace-insensitive) and tags', () => {
    expect(ids({ query: 'tag WALL' })).toEqual(['2']);
    expect(ids({ query: 'df+1, 2' })).toEqual(['1', '2']);
    expect(ids({ query: 'S!' })).toEqual(['3']);
  });
  it('filters by game, character (case-insensitive), partner, difficulty, favorites', () => {
    expect(ids({ game: 'ttt2' })).toEqual(['2']);
    expect(ids({ character: 'JIN' })).toEqual(['1', '3']);
    expect(ids({ partner: 'armor king' })).toEqual(['2']);
    expect(ids({ difficulty: 'advanced' })).toEqual(['2']);
    expect(ids({ favoritesOnly: true })).toEqual(['2']);
  });
  it('requires every selected tag', () => {
    expect(ids({ tags: ['bnb'] })).toEqual(['1', '2']);
    expect(ids({ tags: ['bnb', 'wall'] })).toEqual(['2']);
  });
  it('collects distinct tags, characters and partners', () => {
    expect(collectTags(combos)).toEqual(['BnB', 'wall']);
    expect(collectCharacters(combos)).toEqual(['Jin', 'Kazuya']);
    expect(collectPartners(combos)).toEqual(['Armor King']);
  });
});
