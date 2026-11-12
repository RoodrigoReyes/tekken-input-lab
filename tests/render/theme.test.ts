import { describe, expect, it } from 'vitest';
import { COLORS, EVENT_COLORS, MECHANIC_COLORS, contrastRatio, textOn } from '../../src/render/theme';

const LABEL_FILLS: Record<string, string> = {
  ...EVENT_COLORS,
  ...MECHANIC_COLORS,
  named: COLORS.named,
  movement: COLORS.movement,
  stance: COLORS.stance,
};

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#777777')).toBeCloseTo(4.48, 2);
    expect(contrastRatio('#000000', '#000000')).toBeCloseTo(1, 5);
  });
});

describe('textOn', () => {
  it.each(Object.entries(LABEL_FILLS))('%s label text reaches WCAG AA (4.5:1) on %s', (_name, fill) => {
    expect(contrastRatio(textOn(fill), fill)).toBeGreaterThanOrEqual(4.5);
  });

  it('uses dark text on the Bound orange, where white only reaches 2.8:1', () => {
    expect(textOn(EVENT_COLORS.bound ?? '')).toBe(COLORS.dark);
  });

  it('keeps white text on dark fills', () => {
    expect(textOn(COLORS.stance)).toBe('#ffffff');
  });
});
