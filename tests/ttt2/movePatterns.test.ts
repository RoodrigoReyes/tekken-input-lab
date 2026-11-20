import { describe, expect, it } from 'vitest';
import { collectPieces, type GeneratorOptions } from '../../src/ttt2/generator';
import { importGuide } from '../../src/ttt2/guideImporter';
import { characterPatterns, matchesMove, moveKey, routeMoves, startAtMove } from '../../src/ttt2/movePatterns';
import type { ComboPiece } from '../../src/ttt2/types';
import text from './fixtures/guide-excerpt.md?raw';

const library = importGuide(text, 'excerpt');
const route = (notation: string, character = 'Alisa'): ComboPiece => ({
  id: 'r',
  character,
  role: 'route',
  context: 'open',
  routeKind: 'normal',
  notation,
  additional: false,
  notes: [],
});

describe('moveKey / routeMoves', () => {
  it('matches a move however the guide writes it', () => {
    expect(moveKey('d/f+2')).toBe(moveKey('df+2'));
    expect(moveKey('iWS+1,2')).toBe(moveKey('WS+1,2'));
    expect(moveKey('CH 4')).toBe(moveKey('4'));
    expect(moveKey('f,F+3')).toBe(moveKey('ff+3'));
  });

  it('splits a route into moves without lead-ins or events', () => {
    const moves = routeMoves('LP > dash 1+2 > ff b+2,1 > b+4,3 B! > ff+2,3', 'Alisa');
    expect(moves.map((m) => m.raw)).toEqual(['1+2', 'b+2,1', 'b+4,3', 'ff+2,3']);
  });

  it('finds a move or a string that begins with it', () => {
    expect(matchesMove(moveKey('b+4,3'), moveKey('b+4'))).toBe(true);
    expect(matchesMove(moveKey('b+4'), moveKey('b+1'))).toBe(false);
  });
});

describe('startAtMove', () => {
  const alisa = route('df+2 > b+1 > WS+1,2 > f+1 > b+4,3 B! > ff+2,3');

  it('keeps the whole route when the move is its starter', () => {
    expect(startAtMove(alisa, moveKey('d/f+2'))).toBe(alisa);
  });

  it('starts mid-route from the move and says what came before it', () => {
    const piece = startAtMove(alisa, moveKey('iWS+1,2'))!;
    expect(piece.notation).toBe('WS+1,2 > f+1 > b+4,3 B! > ff+2,3');
    expect(piece.starter).toBe('WS+1,2');
    expect(piece.condition).toMatch(/after "df\+2 > b\+1"/);
    expect(piece.id).not.toBe(alisa.id);
  });

  it('only searches before the B!', () => {
    expect(startAtMove(alisa, moveKey('ff+2,3'))).toBeNull();
    expect(startAtMove(route('LP > f+4'), moveKey('f+4'))?.notation).toBe('LP > f+4');
  });
});

describe('characterPatterns', () => {
  it('counts starters, bound moves and juggles shared by several routes', () => {
    const p = characterPatterns([
      route('df+2 > b+1 > WS+1,2 > f+1 > b+4,3 B! > ff+2,3'),
      route('1+2 > b+1 > WS+1,2 > f+1 > b+4,3 B! > ff+2,3'),
      route('uf+4,4 B! > f+2'),
      route('LP > b+1 > WS+1,2'),
    ]);
    expect(p.bounds.map((m) => [m.move, m.count])).toEqual([['b+4,3', 2], ['uf+4,4', 1]]);
    expect(p.starters.map((m) => m.move)).toEqual(['df+2', '1+2', 'uf+4,4']);
    expect(p.juggles).toEqual([{ move: 'b+1 > WS+1,2 > f+1 > b+4,3', key: expect.any(String), count: 2 }]);
    // The route without B! still counts for the move search list.
    expect(p.moves.find((m) => m.move === 'b+1')?.count).toBe(3);
  });
});

describe('generator: search by move', () => {
  const base: GeneratorOptions = { point: 'Nina', partner: 'Kazuya', context: 'open', routeKinds: ['normal', 'counterHit', 'lowParry'], fillerBy: 'partner', enderBy: 'point' };

  it('offers only the routes using the move before B!, from that move, flagged when mid-route', () => {
    const pools = collectPieces(library, { ...base, move: 'f+1+4' })!;
    expect(pools.routes.length).toBeGreaterThan(0);
    expect(pools.routes.every((r) => r.piece.notation.startsWith('f+1+4 B!'))).toBe(true);
    expect(pools.routes.every((r) => r.flags.some((f) => f.kind === 'condition' && f.text.includes('In the guide this comes after')))).toBe(true);
    expect(collectPieces(library, { ...base, move: 'zzz' })!.routes).toEqual([]);
  });
});
