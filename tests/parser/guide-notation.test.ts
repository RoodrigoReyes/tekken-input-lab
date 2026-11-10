import { describe, expect, it } from 'vitest';
import { parseNotation, toCompact } from '../../src/parser';

const parse = (text: string, characters: string[] = []) => parseNotation(text, { game: 'ttt2', characters });
const compact = (text: string, characters: string[] = []) => toCompact(parse(text, characters).ast);
const warnings = (text: string, characters: string[] = []) =>
  parse(text, characters).diagnostics.filter((d) => d.severity === 'warning').map((d) => d.code);

describe('guide notation (TTT2 BNB Combos)', () => {
  it('movement followed by "+" means the attack out of the movement', () => {
    expect(compact('ss+1~f~2')).toBe('move(SS) _ 1 ~ f ~ 2');
    expect(compact('SSR+1+2')).toBe('move(SSR) _ 1+2');
    expect(warnings('df+3,2~ss+1~b~u~f+4,3,3')).toEqual([]);
  });

  it('parentheses with clean notation are optional inputs', () => {
    expect(compact('uf+4,(3,)4')).toBe('uf+4 , opt[3] , 4');
    expect(compact('(1,2),2')).toBe('opt[1 , 2] , 2');
    expect(compact('(u/b+1),2')).toBe('opt[ub+1] , 2');
    const r = parse('uf+4,(3,)4');
    expect(r.diagnostics.map((d) => [d.code, d.severity])).toEqual([['parenthesis-optional', 'info']]);
  });

  it('parentheses with text stay notes', () => {
    expect(compact('1,2 (2 hits)')).toBe('1 , 2 _ note(2 hits)');
    expect(compact('df+2 (either starter)')).toBe('df+2 _ note(either starter)');
    expect(warnings('1,2 (2 hits)')).toEqual([]);
  });

  it('LP (low parry) starts a route', () => {
    expect(compact('LP > b+1 > WS+1,2')).toBe('stance(LP) > b+1 > WS.1 , 2');
    expect(warnings('LP > b+1 > WS+1,2')).toEqual([]);
  });

  it('TTT2 character notation from the guide', () => {
    expect(warnings('EWGF > uf+1+2', ['Angel'])).toEqual([]);
    expect(warnings('df+1 > EWHF', ['Jin'])).toEqual([]);
    expect(warnings('f+2 > RDS 2,1', ['Miharu'])).toEqual([]);
    expect(compact('ff+3 > SE 1', ['Lars'])).toBe('ff+3 > SE.1');
    expect(compact('VTSc 2', ['Marduk'])).toBe('VTSc.2');
  });

  it('Lars uses DE/SE in TTT2 and DEN/SEN in Tekken 7', () => {
    expect(warnings('DEN 1', ['Lars'])).toContain('unknown-word');
    expect(parseNotation('DEN 1', { game: 't7', characters: ['Lars'] }).diagnostics).toEqual([]);
  });
});
