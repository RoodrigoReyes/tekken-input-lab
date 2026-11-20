import { describe, expect, it } from 'vitest';
import { CHARACTER_ENTRIES, entriesForCharacter, lookupCharacterWord } from '../../src/notation/characters/dictionary';
import { dialectsForGame, getDialect } from '../../src/notation/dialects';
import { GAMES, getGame, isGameId } from '../../src/notation/games';
import { MECHANICS } from '../../src/notation/mechanics';

describe('notation data', () => {
  it('every game has a non-empty, unique roster and a known extender', () => {
    for (const game of GAMES) {
      expect(game.roster.length).toBeGreaterThan(30);
      expect(new Set(game.roster).size).toBe(game.roster.length);
      expect(MECHANICS[game.extender].extender).toBe(true);
    }
  });

  it('extenders follow the matrix: Bound (T6/TTT2), Screw (T7), Tornado (T8)', () => {
    expect(getGame('t6').extender).toBe('bound');
    expect(getGame('ttt2').extender).toBe('bound');
    expect(getGame('t7').extender).toBe('screw');
    expect(getGame('t8').extender).toBe('tornado');
  });

  it('only TTT2 is a tag game and only it offers the kage dialect', () => {
    expect(GAMES.filter((g) => g.tag).map((g) => g.id)).toEqual(['ttt2']);
    expect(dialectsForGame('ttt2').map((d) => d.id)).toContain('kage-ttt2');
    expect(dialectsForGame('t7').map((d) => d.id)).not.toContain('kage-ttt2');
  });

  it('getDialect falls back to standard', () => {
    expect(getDialect(undefined).id).toBe('standard');
    expect(getDialect('nope').id).toBe('standard');
  });

  it('isGameId validates ids', () => {
    expect(isGameId('t8')).toBe(true);
    expect(isGameId('t5')).toBe(false);
    expect(isGameId(8)).toBe(false);
  });

  it('character entries are per game and deduplicated', () => {
    const kazuya = entriesForCharacter('t8', 'kazuya').map((e) => e.abbr);
    expect(kazuya).toEqual(expect.arrayContaining(['EWGF', 'PEWGF', 'WGF']));
    expect(new Set(kazuya).size).toBe(kazuya.length);
    expect(entriesForCharacter('t6', 'Jin').map((e) => e.abbr)).not.toContain('ZEN');
  });

  it('lookup reports every character defining a word', () => {
    const r = lookupCharacterWord('t8', 'ewgf', ['Jin']);
    expect(r?.inContext).toBe(true);
    expect(r?.characters).toEqual(expect.arrayContaining(['Kazuya', 'Heihachi', 'Devil Jin', 'Jin']));
    expect(lookupCharacterWord('t6', 'ewgf', ['Jin'])?.inContext).toBe(false);
  });

  it('resolves alternate stance names and the double electric alias', () => {
    expect(lookupCharacterWord('ttt2', 'de', ['Lars'])?.entry.abbr).toBe('DEN');
    expect(lookupCharacterWord('t6', 'lfl', ['Hwoarang'])?.entry.abbr).toBe('LFS');
    expect(lookupCharacterWord('ttt2', 'crn', ['Lei'])?.entry.abbr).toBe('CRA');
    expect(lookupCharacterWord('t6', 'dewGF', ['Heihachi'])?.stages).toBe('EWGF > EWGF');
    expect(CHARACTER_ENTRIES.some((entry) => entry.abbr === 'DEWGF')).toBe(false);
  });

  it('resolves an expanding alias supplied by dictionary data', () => {
    const entries = [{ abbr: 'TEST', label: 'Test', kind: 'named' as const, characters: ['Kazuya'], games: ['ttt2' as const], aliases: [{ abbr: 'DOUBLE', expandsTo: 'TEST > TEST' }] }];
    expect(lookupCharacterWord('ttt2', 'double', ['Kazuya'], entries)?.stages).toBe('TEST > TEST');
    expect(lookupCharacterWord('t8', 'double', ['Kazuya'], entries)).toBeNull();
  });

  it('recognizes T6 sheet glossary terms for their characters', () => {
    for (const [word, character, label] of [
      ['SAV', 'Miguel', 'Savage Stance'], ['DSS', 'Law', 'Dragon Sign Stance'],
      ['DCKc', 'Steve', 'Ducking Cancel'], ['VTSc', 'Marduk', 'Vale Tudo Stance Cancel'],
      ['DGF', 'Yoshimitu', 'Dragon Fly'], ['GS', 'King', 'Giant Swing'],
      ['FLA', 'Baek', 'Flamingo'],
    ]) {
      const entry = lookupCharacterWord('t6', word!, [character!]);
      expect(entry?.inContext).toBe(true);
      expect(entry?.entry.label).toBe(label);
    }
    expect(lookupCharacterWord('t6', 'SAV', ['Kazuya'])?.inContext).toBe(false);
    expect(lookupCharacterWord('t6', 'RWV', ['Steve'])).toBeNull();
  });
});
