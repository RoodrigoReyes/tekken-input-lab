import { describe, expect, it } from 'vitest';
import { getGame } from '../../src/notation/games';
import movelists from '../../src/data/ttt2/movelists.json';
import { movesFor } from '../../src/ttt2/movelistData';
import type { MovelistMove } from '../../src/ttt2/candidateEnders';

const catalog = movelists as Record<string, MovelistMove[]>;

describe('movesFor', () => {
  it('resolves short roster names to full wiki move-list keys', () => {
    expect(movesFor(catalog, 'Kazuya').length).toBeGreaterThan(0); // prefix: Kazuya Mishima
    expect(movesFor(catalog, 'Marduk').length).toBeGreaterThan(0); // suffix: Craig Marduk
    expect(movesFor(catalog, 'Xiaoyu').length).toBeGreaterThan(0); // suffix: Ling Xiaoyu
    expect(movesFor(catalog, 'Bob').length).toBeGreaterThan(0); // alias: Robert Richards
    expect(movesFor(catalog, 'Lili').length).toBeGreaterThan(0); // alias: Emilie de Rochefort
    expect(movesFor(catalog, 'Ancient Ogre')).toBe(catalog['Ogre']); // alias
    expect(movesFor(catalog, 'King')).toBe(catalog['King II']); // not confused with Armor King II
    expect(movesFor(catalog, 'Nobody')).toEqual([]);
  });

  it('covers the whole TTT2 roster except Mokujin (no Fandom move list)', () => {
    const missing = getGame('ttt2').roster.filter((n) => movesFor(catalog, n).length === 0);
    expect(missing).toEqual(['Mokujin']);
  });
});
