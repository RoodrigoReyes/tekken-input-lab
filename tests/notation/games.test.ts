import { describe, expect, it } from 'vitest';
import { GAMES } from '../../src/notation/games';

describe('GAMES', () => {
  it('lists the games in release order, oldest first', () => {
    expect(GAMES.map((g) => g.id)).toEqual(['t6', 'ttt2', 't7', 't8']);
  });
});
