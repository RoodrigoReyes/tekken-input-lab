import { describe, expect, it } from 'vitest';
import { collectLaunchers, EMPTY_FILTERS, launcherOf, matchesFilters } from '../../src/features/library/filters';
import type { Combo } from '../../src/types/combo';

const combo: Combo = {
  id: '1', game: 't8', character: 'Jin', name: 'Combo', notation: ' df+2  > 1', dialect: 'standard',
  sectionCharacters: [], tags: [], difficulty: 'beginner', position: 'open', notes: '', favorite: false,
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('launcher and position filters', () => {
  it('normalizes the first top-level stage, including nested brackets and notes', () => {
    expect(launcherOf('  df+2  [1 > (2 > 3)]  > 4  ')).toBe('df+2 [1 > (2 > 3)]');
    expect(launcherOf('  df+2\n  1  ')).toBe('df+2 1');
    expect(launcherOf('  > 1')).toBe('');
  });

  it('matches launcher and position together', () => {
    expect(matchesFilters(combo, { ...EMPTY_FILTERS, launcher: 'df+2', position: 'open' })).toBe(true);
    expect(matchesFilters(combo, { ...EMPTY_FILTERS, launcher: 'df+1' })).toBe(false);
    expect(matchesFilters(combo, { ...EMPTY_FILTERS, position: 'wall' })).toBe(false);
    expect(matchesFilters({ ...combo, position: undefined }, { ...EMPTY_FILTERS, position: 'open' })).toBe(false);
  });

  it('collects launchers from other matching filters, ordered by frequency then name', () => {
    const combos: Combo[] = [combo, { ...combo, id: '2', notation: 'df+2 > 3' },
      { ...combo, id: '3', notation: 'b+1 > 3' }, { ...combo, id: '4', notation: 'a+1 > 3' },
      { ...combo, id: '5', notation: 'excluded > 3', position: 'wall' }];
    expect(collectLaunchers(combos, { ...EMPTY_FILTERS, launcher: 'b+1', position: 'open' })).toEqual(['df+2', 'a+1', 'b+1']);
  });
});
