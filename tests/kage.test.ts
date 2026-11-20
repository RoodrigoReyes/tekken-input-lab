import { describe, expect, it } from 'vitest';
import { kageToNotation } from '../src/features/explore/kage';
import { parseNotation } from '../src/parser';

describe('Kage conversion', () => {
  it('converts inputs, stages, words, events and extras', () => {
    expect(kageToNotation('d/f,2 ► f,N,d,d/f,2 ► f,F,2 ► Heat Burst ► Zenshin ► W! ► 3~4,1:4,2*', 't8')).toBe('df+2 > f,n,d,df+2 > f,F+2 > HB > ZEN > W! > 3~4,1:4,2*');
    expect(kageToNotation('WS 1 2 , 3 1 4 , f N d d/f 3', 't7')).toBe('WS 1,2 > 3,1,4 > f,n,d,df+3');
    expect(kageToNotation('F<2', 't8')).toBe('F<2');
    expect(kageToNotation('During Heat,f,2,1', 't8')).toBe('H.f+2,1');
    expect(kageToNotation('1+2 * dash', 't7')).toBe('1+2*,dash');
    expect(kageToNotation('2*(max) ► Left Flamingo', 't8')).toBe('2* (max) > LFS');
    expect(kageToNotation('Left Flamingo 3', 't7')).toBe('LFS 3');
    expect(kageToNotation('EWGF,(f,N,d,d/f,2) ► Unknown stance', 't8')).toBe('EWGF > (Unknown stance)');
  });
  const files = import.meta.glob<{ default: { combos: { raw: string; character: string }[] } }>('../src/data/community/kage-*.json', { eager: true });
  for (const game of ['t8', 't7'] as const) {
    const data = files[`../src/data/community/kage-${game}.json`]?.default;
    if (!data) continue;
    const clean = data.combos.filter((combo) => !parseNotation(kageToNotation(combo.raw, game, combo.character), { game, characters: [combo.character] }).diagnostics.some((d) => d.severity === 'warning')).length;
    const percentage = (100 * clean / data.combos.length).toFixed(2);
    it(`${game} bundled conversions: ${clean}/${data.combos.length} (${percentage}%) warning-free`, () => {
      expect(clean / data.combos.length).toBeGreaterThanOrEqual(0.85);
    });
  }
});

describe('kageToNotation just frames and motions', () => {
  it('keeps a just-frame direction as notation', () => {
    expect(kageToNotation('f,N,d/f:1 ► CD,3', 't8')).toBe('f,n,df:1 > cd+3');
  });
});
