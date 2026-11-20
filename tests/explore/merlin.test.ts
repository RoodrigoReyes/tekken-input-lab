import { describe, expect, it } from 'vitest';
import { merlinToNotation } from '../../src/features/explore/merlin';
import { parseNotation } from '../../src/parser';

describe('Merlin notation', () => {
  it('translates sheet separators, delays and crouch dash without hiding notes', () => {
    expect(merlinToNotation('CD4,1 - df+3,2,[1] (Damage)')).toBe('cd+4,1 > df+3,2,<1 (Damage)');
    expect(merlinToNotation('D/f+2 - U/f+4,4- B!')).toBe('df+2 > uf+4,4 > B!');
    expect(merlinToNotation('EWGF* - df+1*')).toBe('EWGF > df+1');
    expect(merlinToNotation('unknown move (BT oki)')).toBe('unknown move (BT oki)');
    expect(merlinToNotation('Delay 3+4 - delay RFL 2 - deep dash')).toBe('<3+4 > <RFS 2 > deep dash');
    expect(merlinToNotation('delay - 1+2')).toBe('delay > 1+2');
  });
  it('keeps compact inputs the parser already understands', () => {
    for (const text of ['df1', 'ws1,2', 'SS3']) {
      expect(parseNotation(merlinToNotation(text), { game: 't6' }).diagnostics, text).toEqual([]);
    }
  });
});

import sheet from '../../src/data/t6-merlin/t6.json';

const pieces = sheet.characters.flatMap((character) => [
  ...character.structure.flatMap((group) => [...group.launchers, ...group.routes]),
  ...character.counterHit.flatMap((group) => [...group.launchers, ...group.routes]),
  ...character.lowParry, ...character.postBound,
  ...character.wall.splatToBound, ...character.wall.boundToSplat,
  ...character.guaranteed.flatMap(({ starters, followUps }) => [...starters, ...followUps]),
].filter(Boolean).map((text) => ({ text, character: character.name })));
const diagnostics = pieces.map(({ text, character }) =>
  parseNotation(merlinToNotation(text, character), { game: 't6', characters: [character] }).diagnostics,
);
const clean = diagnostics.filter((items) => items.length === 0).length;
const noWarnings = diagnostics.filter((items) => !items.some((item) => item.severity === 'warning')).length;
const percentage = (count: number) => (100 * count / pieces.length).toFixed(1);

it(`parses ${clean}/${pieces.length} pieces without diagnostics (${percentage(clean)}%); ${noWarnings}/${pieces.length} without warnings (${percentage(noWarnings)}%)`, () => {
  expect(clean / pieces.length).toBeGreaterThanOrEqual(0.7);
});

describe('merlinToNotation shorthand', () => {
  it('reads jab as 1 and joins spaced repeats', () => {
    expect(merlinToNotation('EWGF - dash jab x 3')).toBe('EWGF > dash 1x3');
  });
});
