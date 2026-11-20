/**
 * Public entry point of the notation engine.
 *
 *   parseNotation('df+1,2~5', { game: 'ttt2', dialect: 'standard', characters: ['Kazuya'] })
 *
 * Results are memoized by (parser version, game, dialect, characters, text) so
 * re-rendering is cheap; bumping PARSER_VERSION invalidates everything.
 */
import { findDialect, getDialect } from '../notation/dialects';
import { getGame } from '../notation/games';
import type { Diagnostic, GameId, ParseResult, StageNode } from '../types/notation';
import { normalizeTokens } from './normalizer';
import { parseTokens } from './parser';
import { tokenize } from './tokenizer';
import { validateCombo } from './validate';

export const PARSER_VERSION = '1.0.0';

export interface ParseOptions {
  game: GameId;
  dialect?: string;
  /** Selected characters, primary first (partner second in TTT2). */
  characters?: readonly string[];
}

const CACHE_LIMIT = 300;
const cache = new Map<string, ParseResult>();

function bySpan(a: Diagnostic, b: Diagnostic): number {
  return (a.span?.start ?? 0) - (b.span?.start ?? 0);
}

function dialectDiagnostics(options: ParseOptions): Diagnostic[] {
  if (!options.dialect) return [];
  const found = findDialect(options.dialect);
  if (!found) {
    return [{ code: 'unknown-dialect', severity: 'warning', message: `Unknown notation dialect "${options.dialect}"; using Standard (Wavu Wiki).` }];
  }
  if (!found.games.includes(options.game)) {
    return [{ code: 'dialect-game-mismatch', severity: 'warning', message: `The "${found.name}" dialect is meant for ${found.games.map((g) => getGame(g).shortName).join(', ')}, not ${getGame(options.game).name}.` }];
  }
  return [];
}

function parseUncached(text: string, options: ParseOptions): ParseResult {
  const dialect = getDialect(options.dialect);
  const characters = (options.characters ?? []).filter((c) => c.trim().length > 0);
  const labelNames = [...getGame(options.game).roster, ...characters];
  const tokens = tokenize(text, { labelNames });
  const { ast, diagnostics } = parseTokens(tokens, text, { game: options.game, dialect, characters });
  const normalized = normalizeTokens(tokens, ast);
  for (const section of ast.sections) {
    const expanded: StageNode[] = [];
    for (const stage of section.stages) {
      let current: StageNode = { ...stage, steps: [] };
      for (const step of stage.steps) {
        if (step.node.type !== 'namedMove' || !step.node.expandsTo) {
          current.steps.push(step);
          continue;
        }
        const expansion = step.node.expandsTo;
        const parsed = parseTokens(tokenize(expansion, { labelNames }), expansion, { game: options.game, dialect, characters });
        const stages = parsed.ast.sections.flatMap((part) => part.stages);
        stages.forEach((part, i) => {
          if (i > 0) { expanded.push(current); current = { ...stage, steps: [] }; }
          part.steps.forEach((item, j) => {
            const first = i === 0 && j === 0;
            const last = i === stages.length - 1 && j === part.steps.length - 1;
            current.steps.push({
              ...item,
              relation: first ? step.relation : item.relation && { ...item.relation, span: step.node.span },
              node: {
                ...item.node,
                span: step.node.span,
                prefixes: [...(first ? step.node.prefixes : []), ...item.node.prefixes.map((prefix) => ({ ...prefix, span: step.node.span }))],
                hold: item.node.hold || (last && step.node.hold),
                ...(last && step.node.repeat !== undefined ? { repeat: step.node.repeat } : {}),
              },
            });
          });
        });
      }
      expanded.push(current);
    }
    section.stages = expanded;
  }
  for (const section of ast.sections) for (const stage of section.stages) for (const { node } of stage.steps) {
    for (const prefix of node.prefixes) {
      const token = tokens.find((t) => t.span.start === prefix.span.start);
      if (token) token.canonical = prefix.abbr;
    }
    if (node.type === 'namedMove' || node.type === 'stance') {
      const start = node.prefixes.at(-1)?.span.end ?? node.span.start;
      const token = tokens.find((t) => t.span.start >= start && t.span.end <= node.span.end && t.type === 'word');
      if (token) token.canonical = node.type === 'namedMove' ? node.name : node.abbr;
    }
  }
  const semantic = [...dialectDiagnostics(options), ...validateCombo(ast, options.game)];
  return {
    parserVersion: PARSER_VERSION,
    game: options.game,
    dialect: dialect.id,
    original: text,
    normalized,
    tokens,
    ast,
    diagnostics: [...diagnostics, ...semantic].sort(bySpan),
  };
}

export function parseNotation(text: string, options: ParseOptions): ParseResult {
  const key = JSON.stringify([PARSER_VERSION, options.game, options.dialect ?? '', options.characters ?? [], text]);
  const hit = cache.get(key);
  if (hit) return hit;
  const result = parseUncached(text, options);
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, result);
  return result;
}

export { toCompact } from './compact';
export { resolveSectionCharacters } from './sections';
export type { SectionAssignment, SectionSource } from './sections';
