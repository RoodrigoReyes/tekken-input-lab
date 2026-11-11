import { describe, expect, it } from 'vitest';
import { parseCombo } from '../../src/features/combo/parseCombo';
import { comboSvgMarkup, exportHeading, safeFilename } from '../../src/features/export/exportImage';
import { estimateText } from '../../src/render/measure';
import { BUTTON_COLORS, COLORS } from '../../src/render/theme';

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
    // df+1 → button 1, 2 → button 2, 1+2 → buttons 1 and 2 in one cluster
    const count = (fill: string) => svg.match(new RegExp(`fill="${fill}"`, 'g'))?.length ?? 0;
    expect(count(BUTTON_COLORS[1].fill)).toBe(2);
    expect(count(BUTTON_COLORS[2].fill)).toBe(2);
    expect(count(BUTTON_COLORS[3].fill) + count(BUTTON_COLORS[4].fill)).toBe(0);
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

describe('SVG export from the 2P side', () => {
  const p2 = { ...combo, notation: 'df+1, f+2' };
  const svg = comboSvgMarkup(parseCombo(p2), exportHeading(p2, 'right'), { size: 40, expandNamed: false, side: 'right', measure: estimateText });

  it('mirrors the arrows and says so in the heading', () => {
    expect(svg).toContain('data-side="right"');
    expect(svg).toMatch(/rotate\(135 /);
    expect(svg).toMatch(/rotate\(180 /);
    expect(svg).not.toMatch(/rotate\(45 /);
    expect(svg).toContain('2P side');
  });

  it('is never narrower than its heading', () => {
    const short = { ...p2, notation: '1', name: 'A very long combo name that is much wider than one button' };
    const out = comboSvgMarkup(parseCombo(short), exportHeading(short, 'right'), { size: 40, expandNamed: false, side: 'right', measure: estimateText });
    const width = Number(/<svg[^>]* width="(\d+)"/.exec(out)?.[1]);
    expect(width).toBeGreaterThan(estimateText(short.name, 40 * 0.42, 800));
  });

  it('leaves the 1P heading unchanged', () => {
    expect(exportHeading(p2).subtitle).not.toContain('2P');
  });
});
