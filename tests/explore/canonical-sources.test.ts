import { expect, it } from 'vitest';
import { kageToNotation } from '../../src/features/explore/kage';
import { merlinToNotation } from '../../src/features/explore/merlin';

it('uses the same spelling across community sources', () => {
  expect(kageToNotation('WS,1,4', 't8')).toBe(merlinToNotation('ws1,4'));
  expect(kageToNotation('d/f,2', 't8')).toBe(merlinToNotation('D/f+2'));
  expect(merlinToNotation('DEWGF', 'Kazuya')).toBe(kageToNotation('EWGF ► EWGF', 't8', 'Kazuya'));
  expect(kageToNotation('wgf', 't7', 'Kazuya')).toBe('WGF');
  expect(kageToNotation('Left Flamingo', 't8', 'Hwoarang')).toBe(merlinToNotation('LFL', 'Hwoarang'));
  expect(merlinToNotation('CD4,1')).toBe('cd+4,1');
  expect(kageToNotation('FC,d/f,1', 't8')).toBe('FC df+1');
});

it('expands double electric into two parsed stages without changing source tokens', async () => {
  const { parseNotation } = await import('../../src/parser');
  const result = parseNotation('DEWGF', { game: 't6', characters: ['Kazuya'] });
  expect(result.normalized).toBe('EWGF > EWGF');
  expect(result.ast.sections[0]?.stages).toHaveLength(2);
  expect(result.tokens.map((token) => token.raw).join('')).toBe('DEWGF');
});

it('preserves modifiers and source spans when expanding an alias', async () => {
  const { parseNotation } = await import('../../src/parser');
  const result = parseNotation('WS DEWGF*x2', { game: 't6', characters: ['Kazuya'] });
  const stages = result.ast.sections[0]!.stages;
  expect(stages[0]!.steps[0]!.node.prefixes[0]?.abbr).toBe('WS');
  expect(stages[1]!.steps[0]!.node).toMatchObject({ hold: true, repeat: 2, span: stages[0]!.steps[0]!.node.span });
  expect(result.normalized).toBe('WS EWGF > EWGF*x2');
});
