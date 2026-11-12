import { describe, expect, it } from 'vitest';
import { recentCombos } from '../../src/features/home/recent';
import type { Combo } from '../../src/types/combo';

const combo = (id: string, updatedAt: string) => ({ id, updatedAt }) as unknown as Combo;

describe('recentCombos', () => {
  it('returns the most recently updated combos first, up to the limit', () => {
    const list = [combo('a', '2026-01-01T00:00:00Z'), combo('b', '2026-03-01T00:00:00Z'), combo('c', '2026-02-01T00:00:00Z')];
    expect(recentCombos(list, 2).map((c) => c.id)).toEqual(['b', 'c']);
  });

  it('does not reorder the input', () => {
    const list = [combo('a', '2026-01-01T00:00:00Z'), combo('b', '2026-03-01T00:00:00Z')];
    recentCombos(list, 4);
    expect(list.map((c) => c.id)).toEqual(['a', 'b']);
  });
});
