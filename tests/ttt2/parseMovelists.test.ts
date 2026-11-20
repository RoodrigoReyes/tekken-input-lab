import { describe, expect, it } from 'vitest';
import movelists from '../../src/data/ttt2/movelists.json';

describe('parsed movelists', () => {
  it('contains the character catalog and Kazuya’s d/b+2', () => {
    expect(Object.keys(movelists).length).toBeGreaterThanOrEqual(50);
    expect(movelists['Kazuya Mishima']).toEqual(expect.arrayContaining([expect.objectContaining({ command: 'd/b+2', hits: ['m'] })]));
  });

  it('gives every move a name and command', () => {
    for (const moves of Object.values(movelists)) {
      for (const move of moves) {
        expect(move.name.trim()).not.toBe('');
        expect(move.command.trim()).not.toBe('');
      }
    }
  });
});
