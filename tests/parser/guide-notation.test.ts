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

  it('Lars: TTT2 accepts DE/SE (guide) and DEN/SEN (kagewebsite); Tekken 7 only DEN/SEN', () => {
    expect(warnings('DEN 1 > SEN 3 > DE 1 > SE 1', ['Lars'])).toEqual([]);
    expect(parseNotation('DEN 1', { game: 't7', characters: ['Lars'] }).diagnostics).toEqual([]);
    expect(parseNotation('DE 1', { game: 't7', characters: ['Lars'] }).diagnostics.map((d) => d.code)).toContain('unknown-word');
  });

  it('bf, fb and fn are direction shorthands', () => {
    expect(compact('bf+2,1')).toBe('bf+2 , 1');
    expect(warnings('fb+2,1 B!', ['Lars'])).toEqual([]);
    expect(warnings('fn,3,4', ['Lee'])).toEqual([]);
  });

  it('long movement spellings', () => {
    expect(warnings('b+2,1+2 B! > microdash > df+1+2')).toEqual([]);
    expect(warnings('CH df+2 > wavedash WS+2')).toEqual([]);
    expect(warnings('3 W! > backdash > df+2 W!')).toEqual([]);
  });

  it('HS is Hell Sweep in TTT2, never Heat Smash', () => {
    const r = parse('CH HS,4 B!', ['Devil Jin']);
    expect(r.diagnostics.filter((d) => d.severity !== 'info')).toEqual([]);
    expect(compact('CH HS,4 B!', ['Devil Jin'])).toContain('named(HS)');
  });

  it('stance names from ttt2combo.kagewebsite.com', () => {
    expect(warnings('dash f 4 F KDE 4', ['Kunimitsu'])).toEqual([]);
    expect(warnings('f+4~f > SET 1,2,4', ['Kunimitsu'])).toEqual([]);
    expect(warnings('GEN 3', ['Jun'])).toEqual([]);
    expect(warnings('DRU b 1+2,PLDs 1+2', ['Lei'])).toEqual([]);
    expect(warnings('d/f 1 ~ B,SWY d 4', ['Paul'])).toEqual([]);
  });
});
