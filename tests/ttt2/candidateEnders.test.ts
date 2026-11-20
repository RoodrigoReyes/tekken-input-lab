import { describe, expect, it } from 'vitest';
import { candidateEnders, enderKey, isPlainEnderInput } from '../../src/ttt2/candidateEnders';

describe('enderKey', () => {
  it('normalizes crouch dash and while running notation', () => {
    expect(enderKey('cd+4,1')).toBe(enderKey('f,N,d,d/f+4,1'));
    expect(enderKey('cd+4,1')).toBe(enderKey('f, n, d, d/f+4, 1'));
    expect(enderKey('WR3')).toBe(enderKey('f,f,f+3'));
    expect(enderKey('iWS+1')).toBe(enderKey('WS+1'));
  });
});

describe('candidateEnders', () => {
  it('excludes confirmed moves and ranks route finishers before mid and low finishes', () => {
    const result = candidateEnders({
      movelist: [
        { name: 'Confirmed', command: 'cd+4,1', hits: ['m'] },
        { name: 'Mid', command: 'd+2', hits: ['m'] },
        { name: 'Route', command: 'WR3', hits: ['h', 'h'] },
        { name: 'High', command: '1', hits: ['h'] },
        { name: 'Unknown', command: '2', hits: [] },
      ],
      confirmedEnders: ['f,N,d,d/f+4,1'],
      routeFinishers: ['f,f,f+3'],
    });
    expect(result).toEqual([
      { name: 'Route', command: 'WR3', reason: 'route-finisher' },
      { name: 'Mid', command: 'd+2', reason: 'mid-low-finish' },
    ]);
  });

  it('drops moves that need a special state (grounded, stance, transformation)', () => {
    expect(isPlainEnderInput('(With opponent down) d+3+4')).toBe(false);
    expect(isPlainEnderInput('During Devil Transformation f, f+2')).toBe(false);
    expect(isPlainEnderInput('d/f+3, 2, 1')).toBe(true);
    const result = candidateEnders({
      movelist: [
        { name: 'Grounded', command: '(With opponent down) d+3+4', hits: ['l'] },
        { name: 'Clean', command: 'd/f+3,2,1', hits: ['m', 'm', 'm'] },
      ],
      confirmedEnders: [],
      routeFinishers: [],
    });
    expect(result.map((r) => r.command)).toEqual(['d/f+3,2,1']);
  });
});
