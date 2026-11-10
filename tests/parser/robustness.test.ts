import { describe, expect, it } from 'vitest';
import { parseNotation, toCompact } from '../../src/parser';

const codes = (text: string, opts: Partial<Parameters<typeof parseNotation>[1]> = {}) =>
  parseNotation(text, { game: 't8', ...opts }).diagnostics.map((d) => d.code);

describe('robustness (review regressions)', () => {
  it.each(['constructor!', 'constructor 1', '__proto__', 'toString!', 'hasOwnProperty', 'valueOf+1'])(
    'prototype keys are never resolved: %s',
    (text) => {
      expect(() => parseNotation(text, { game: 't8' })).not.toThrow();
      const r = parseNotation(text, { game: 't8' });
      expect(r.normalized).not.toContain('undefined');
      expect(r.diagnostics.some((d) => d.code === 'unknown-word' || d.code === 'unknown-event')).toBe(true);
    },
  );

  it('deep [ nesting is capped instead of overflowing the stack', () => {
    expect(() => parseNotation('['.repeat(20000), { game: 't8' })).not.toThrow();
    expect(codes('['.repeat(20))).toContain('nesting-too-deep');
  });

  it('unclosed ( is reported even when the text ends with )', () => {
    const r = parseNotation('(a (b)', { game: 't8' });
    expect(r.diagnostics.map((d) => d.code)).toEqual(['unclosed-group']);
    expect(toCompact(r.ast)).toBe('note(a (b))');
    expect(codes('(note)')).toEqual([]);
  });

  it('unknown dialects and dialect/game mismatches are reported', () => {
    expect(codes('1,2 WB!', { dialect: 'wall-bound' })).toEqual(['unknown-dialect']);
    expect(codes('1,2', { dialect: 'kage-ttt2' })).toEqual(['dialect-game-mismatch']);
    expect(codes('1,2', { game: 'ttt2', dialect: 'kage-ttt2' })).toEqual([]);
  });

  it('whitespace after a held input stays significant when normalized', () => {
    expect(parseNotation('1* 2', { game: 't8' }).normalized).toBe('1* 2');
    expect(parseNotation('df+1 *', { game: 't8' }).normalized).toBe('df+1*');
  });
});
