/**
 * Normalization: canonical notation text built from tokens (aliases resolved,
 * whitespace collapsed). Used for search and display; the original text is
 * always kept separately as the source of truth.
 */
import type { Token } from '../types/notation';
import { TIGHT_TOKENS } from './grammar';

const SPACED = new Set(['stage', 'semicolon']);

export function normalizeTokens(tokens: readonly Token[]): string {
  let out = '';
  tokens.forEach((t, i) => {
    if (t.type === 'ws') {
      const prev = tokens[i - 1];
      const next = tokens[i + 1];
      const tightPrev = TIGHT_TOKENS.has(prev?.type ?? 'ws') && prev?.type !== 'hold';
      if (!prev || !next || tightPrev || TIGHT_TOKENS.has(next.type)) return;
      out += t.newline ? '\n' : ' ';
      return;
    }
    out += SPACED.has(t.type) ? ` ${t.canonical} ` : t.canonical;
  });
  return out.replace(/ {2,}/g, ' ').trim();
}
