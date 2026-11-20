/**
 * The moves a character executes before the B! in the guide routes. Moves are
 * compared by a normalized key, so the same move matches however the guide
 * writes it: d/f+2 = df+2, iWS+1,2 = WS+1,2, CH 4 = 4.
 *
 * Used to find routes that can grow out of a move landed on the fly: the route
 * is offered from that move onward.
 */
import { parseNotation } from '../parser';
import type { Step } from '../types/notation';
import { analyzeRoute } from './routeAnalysis';
import type { ComboPiece } from './types';

/** One move of a route: a ">" stage without its lead-in (dash, LP) or events (B!, W!). */
export interface RouteMove {
  raw: string;
  key: string;
  /** Offset of the stage in the route notation (lead-in included). */
  start: number;
}

export interface MoveCount {
  /** First spelling seen in the guide. */
  move: string;
  key: string;
  count: number;
}

export interface CharacterPatterns {
  /** First move of the routes that reach B!. */
  starters: MoveCount[];
  /** Everything between the starter and B! (fillers + bound move), shared by several routes. */
  juggles: MoveCount[];
  /** The string that causes the Bound. */
  bounds: MoveCount[];
  /** Every move used before B! (routes without B!: the whole route). */
  moves: MoveCount[];
}

export function moveKey(raw: string): string {
  return raw
    .trim()
    .replace(/^CH\s*/i, '')
    .replace(/^i(?=[A-Z])/, '')
    .toLowerCase()
    .replace(/[/\s+]/g, '')
    .replace(/^f,f/, 'ff');
}

/** A movement, a stance on its own (LP) or a bare direction followed by a space ("ff b+2,1") is not the move. */
function isLeadIn(step: Step, next: Step | undefined): boolean {
  const { node } = step;
  if (node.type === 'movement' || node.type === 'stance') return true;
  return node.type === 'input' && node.buttons.length === 0 && !node.tag && next?.relation?.kind === 'implicit';
}

export function routeMoves(notation: string, character: string): RouteMove[] {
  const result = parseNotation(notation, {
    game: 'ttt2',
    characters: [character],
  });
  return result.ast.sections
    .flatMap((s) => s.stages)
    .flatMap((stage) => {
      let steps = stage.steps.filter((s) => s.node.type !== 'event');
      while (steps[0] && isLeadIn(steps[0], steps[1])) steps = steps.slice(1);
      const first = steps[0];
      const last = steps[steps.length - 1];
      const begin = stage.steps[0];
      if (!first || !last || !begin) return [];
      const raw = notation.slice(first.node.span.start, last.node.span.end);
      return [{ raw, key: moveKey(raw), start: begin.node.span.start }];
    });
}

/** The searched move, or a string that begins with it (b+4 finds b+4,3). */
export function matchesMove(key: string, query: string): boolean {
  return key === query || key.startsWith(`${query},`) || key.startsWith(`${query}~`);
}

/** Moves before the B! (the whole route when it has none). */
function movesBeforeBound(piece: ComboPiece): {
  moves: RouteMove[];
  bound: boolean;
} {
  const opener = analyzeRoute(piece.notation, piece.character).opener;
  const end = opener?.length ?? piece.notation.length;
  return {
    moves: routeMoves(piece.notation, piece.character).filter((m) => m.start < end),
    bound: Boolean(opener),
  };
}

/**
 * The route from the searched move onward, or null when the move is not used
 * before B!. A match past the first move becomes a new piece whose condition
 * says what came before it in the guide.
 */
export function startAtMove(piece: ComboPiece, query: string): ComboPiece | null {
  const { moves } = movesBeforeBound(piece);
  const index = moves.findIndex((m) => matchesMove(m.key, query));
  const match = moves[index];
  if (!match) return null;
  if (index === 0) return piece;
  const before = piece.notation.slice(0, match.start).replace(/[\s>]+$/, '');
  const condition = `In the guide this comes after "${before}": check that your hit leaves the opponent in a similar juggle.`;
  return {
    ...piece,
    id: `${piece.id}@${match.start}`,
    notation: piece.notation.slice(match.start),
    starter: match.raw,
    condition: piece.condition ? `${piece.condition} ${condition}` : condition,
  };
}

function tally(entries: ReadonlyArray<{ raw: string; key: string }>, min = 1): MoveCount[] {
  const counts = new Map<string, MoveCount>();
  for (const { raw, key } of entries) {
    const seen = counts.get(key);
    counts.set(key, seen ? { ...seen, count: seen.count + 1 } : { move: raw, key, count: 1 });
  }
  return [...counts.values()].filter((c) => c.count >= min).sort((a, b) => b.count - a.count);
}

/** What a character's routes have in common before the B!. */
export function characterPatterns(routes: readonly ComboPiece[]): CharacterPatterns {
  const all = routes.map(movesBeforeBound);
  const bound = all.filter((r) => r.bound).map((r) => r.moves);
  const join = (moves: RouteMove[], key: 'raw' | 'key') => moves.map((m) => m[key]).join(' > ');
  return {
    starters: tally(bound.flatMap((m) => m.slice(0, 1))),
    juggles: tally(
      bound
        .filter((m) => m.length > 1)
        .map((m) => ({
          raw: join(m.slice(1), 'raw'),
          key: join(m.slice(1), 'key'),
        })),
      2,
    ),
    bounds: tally(bound.flatMap((m) => m.slice(-1))),
    moves: tally(all.flatMap(({ moves }) => moves)),
  };
}
