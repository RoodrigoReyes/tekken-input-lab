import { describe, expect, it } from 'vitest';
import { parseCombo } from '../../src/features/combo/parseCombo';
import { comboSvgMarkup, exportHeading, safeFilename } from '../../src/features/export/exportImage';
import { estimateText } from '../../src/render/measure';
import { COLORS } from '../../src/render/theme';

const combo = {
  name: 'Tag wall',
  game: 'ttt2' as const,
  character: 'Kazuya',
  partner: 'Armor King',
  damage: 81,
  dialect: 'kage-ttt2',
  notation: 'EWGF, df+1,2~5 ; 1+2',
  sectionCharacters: [],
};

describe('SVG export', () => {
  const svg = comboSvgMarkup(parseCombo(combo), exportHeading(combo), { size: 40, expandNamed: false, measure: estimateText });

  it('is a standalone SVG document with background and heading', () => {
    expect(svg.startsWith('<?xml')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain(`fill="${COLORS.background}"`);
    expect(svg).toContain('Tag wall');
    expect(svg).toContain('Tekken Tag Tournament 2 · Kazuya + Armor King · 81 dmg');
  });

  it('uses attributes only (no CSS classes) so it renders anywhere', () => {
    expect(svg).not.toContain('class=');
  });

  it('keeps simultaneous vs sequential buttons distinct', () => {
    // df+1 → one red, 2 → one red, 1+2 → two red
    expect(svg.match(new RegExp(`fill="${COLORS.buttonActive}"`, 'g'))).toHaveLength(4);
    expect(svg).toContain('TAG ASSAULT');
  });

  it('strips XML-invalid control characters', () => {
    const bad = { ...combo, name: 'bad\u0001name', notation: '1,2 \u0002 3' };
    const out = comboSvgMarkup(parseCombo(bad), exportHeading(bad), { size: 40, expandNamed: false, measure: estimateText });
    expect(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(out)).toBe(false);
    expect(out).toContain('badname');
  });

  it('builds safe file names', () => {
    expect(safeFilename('Kazuya: EWGF / loop!')).toBe('kazuya-ewgf-loop');
    expect(safeFilename('!!!')).toBe('combo');
  });
});
