import { describe, expect, it } from 'vitest';
import { parseNotation } from '../../src/parser';
import { DEFAULT_FILTERS, filterAndSortCombos, type ConvertedCombo } from '../../src/features/explore/filters';

const combo = (overrides: Partial<ConvertedCombo>): ConvertedCombo => ({
  id: 1, game: 't8', character: 'Jin', raw: 'd/f,2', notation: 'df+2 > 1',
  hits: 5, damage: 50, tags: ['Heat', 'v3.02'], author: 'Alice', date: '01/05/2026', source: 'https://example.com',
  clean: true, result: parseNotation('df+2 > 1', { game: 't8' }), ...overrides,
});
const combos = [combo({}), combo({ id: 2, character: 'King', notation: 'f+2 > 3', tags: ['Wall'], author: 'Bob', date: '12/01/2025', damage: 80, hits: 3, clean: false }), combo({ id: 3, date: '02/01/2026', damage: null, hits: 8 })];

describe('community filters', () => {
  it('filters by character, notation, author, tags, launcher and conversion status', () => {
    expect(filterAndSortCombos(combos, { ...DEFAULT_FILTERS, character: 'Jin', query: 'DF+2', tags: ['heat'], launcher: 'df+2' }).map((c) => c.id)).toEqual([3, 1]);
    expect(filterAndSortCombos(combos, { ...DEFAULT_FILTERS, query: 'bob' })).toEqual([]);
    expect(filterAndSortCombos(combos, { ...DEFAULT_FILTERS, query: 'bob', tags: ['Wall'], cleanOnly: false }).map((c) => c.id)).toEqual([2]);
  });
  it('sorts dates, damage and hits descending with missing numbers last', () => {
    const filters = { ...DEFAULT_FILTERS, cleanOnly: false };
    expect(filterAndSortCombos(combos, filters).map((c) => c.id)).toEqual([3, 1, 2]);
    expect(filterAndSortCombos(combos, { ...filters, sort: 'damage' }).map((c) => c.id)).toEqual([2, 1, 3]);
    expect(filterAndSortCombos(combos, { ...filters, sort: 'hits' }).map((c) => c.id)).toEqual([3, 1, 2]);
  });
});
