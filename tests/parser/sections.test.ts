import { describe, expect, it } from 'vitest';
import { parseNotation, resolveSectionCharacters } from '../../src/parser';

const TEXT = 'EWGF, EWGF, df+1,2~5 ; 3+4,2 ; cd+3 W!';
const TEAM = { primary: 'Kazuya', partner: 'Armor King' };

function assign(text: string, dialect: string, manual?: Array<string | null>) {
  const r = parseNotation(text, { game: 'ttt2', dialect, characters: [TEAM.primary, TEAM.partner] });
  return resolveSectionCharacters(r.ast, { game: 'ttt2', ...TEAM, manual }).map((a) => [a.character, a.source]);
}

describe('resolveSectionCharacters', () => {
  it('section dialect: switches only on explicit TAG, otherwise unassigned', () => {
    expect(assign(TEXT, 'standard')).toEqual([
      ['Kazuya', 'primary'],
      ['Armor King', 'tag'],
      [null, 'unassigned'],
    ]);
  });

  it('kage dialect: each Tag Assault switches character', () => {
    expect(assign(TEXT, 'kage-ttt2')).toEqual([
      ['Kazuya', 'primary'],
      ['Armor King', 'tagAssault'],
      ['Kazuya', 'tagAssault'],
    ]);
  });

  it('manual assignment wins', () => {
    expect(assign(TEXT, 'standard', [null, null, 'Kazuya'])[2]).toEqual(['Kazuya', 'manual']);
    expect(assign(TEXT, 'kage-ttt2', ['Armor King'])[0]).toEqual(['Armor King', 'manual']);
  });

  it('explicit labels identify characters', () => {
    const text = 'Kazuya:\nEWGF\nArmor King:\n3+4,2\nKazuya:\ncd+3';
    expect(assign(text, 'standard')).toEqual([
      ['Kazuya', 'label'],
      ['Armor King', 'label'],
      ['Kazuya', 'label'],
    ]);
  });

  it('TA! at the end of a section counts as an explicit switch', () => {
    expect(assign('1,2 TA! ; 3,4', 'standard')[1]).toEqual(['Armor King', 'tag']);
  });

  it('cannot infer the other character when the previous one is unknown', () => {
    expect(assign('1 ; 2 ; 3~5 ; 4', 'standard')[3]).toEqual([null, 'unassigned']);
  });

  it('single-character games always use the primary character', () => {
    const r = parseNotation('1,2 ; 3,4', { game: 't7' });
    expect(resolveSectionCharacters(r.ast, { game: 't7', primary: 'Jin' }).map((a) => a.character)).toEqual(['Jin', 'Jin']);
  });

  it('no primary selected leaves the first section unassigned', () => {
    const r = parseNotation('1,2', { game: 'ttt2' });
    expect(resolveSectionCharacters(r.ast, { game: 'ttt2', primary: '' })[0]?.source).toBe('unassigned');
  });
});
