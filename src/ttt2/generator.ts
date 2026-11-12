/**
 * TTT2 team-combo generator.
 *
 *   [point] route up to B!  →  TA!  →  TA filler  →  ender
 *
 * Hard rules (a candidate is discarded when one fails):
 *   R1 the route reaches a Bound (B!) — required before a Tag Assault
 *   R2 context: open-ground pieces with open routes, wall pieces with wall routes
 *   R3 forms: pieces/routes restricted to a form (Kazuya / Devil Kazuya) must match
 *   R4 the assembled combo passes the notation engine (one Bound per combo,
 *      mechanics valid in TTT2)
 *   R5 optional: only pieces whose notation parses without warnings
 *   R6 optional: "Additional" (conditional) pieces only when requested
 * Soft rules become flags the player should verify: guide conditions, notes,
 * notation warnings. Every result is a suggestion until tested in practice.
 */
import { parseNotation } from '../parser';
import { flattenNodes } from '../parser/validate';
import { analyzeRoute } from './routeAnalysis';
import type { CharacterKit, ComboPiece, GuideLibrary, PieceContext, RouteAnalysis, RouteKind } from './types';

export type Performer = 'point' | 'partner';

export interface GeneratorOptions {
  point: string;
  partner: string;
  /** Selected forms (e.g. "Devil Kazuya"); default = base form. */
  pointForm?: string;
  partnerForm?: string;
  context: PieceContext;
  routeKinds: readonly RouteKind[];
  /** Only routes with this exact starter (e.g. "EWGF"). */
  starter?: string;
  /** Who performs the TA filler and the ender after the Tag Assault. */
  fillerBy: Performer;
  enderBy: Performer;
  includeAdditional?: boolean;
  /**
   * Wall context: 'any' (default) also offers open-ground routes, flagged so the
   * player checks the route carries to the wall; 'wallOnly' uses wall routes only.
   */
  wallRoutes?: 'any' | 'wallOnly';
  onlyClean?: boolean;
  limit?: number;
}

export type FlagKind = 'condition' | 'note' | 'notation';

export interface Flag {
  kind: FlagKind;
  piece: 'route' | 'filler' | 'ender' | 'combo';
  text: string;
}

export interface GeneratedCombo {
  id: string;
  /** The full guide route (its `analysis.opener` is the part used before TA!). */
  route: ComboPiece;
  filler: ComboPiece;
  ender: ComboPiece;
  analysis: RouteAnalysis;
  /** Labeled notation ready for the editor (original piece text kept verbatim). */
  notation: string;
  flags: Flag[];
}

export interface GeneratorResult {
  combos: GeneratedCombo[];
  stats: { routes: number; fillers: number; enders: number; candidates: number; valid: number; rejected: Record<string, number> };
}

export const KIND_ORDER: Readonly<Record<RouteKind, number>> = { normal: 0, counterHit: 1, lowParry: 2, wall: 3 };

function findKit(library: GuideLibrary, character: string): CharacterKit | undefined {
  return library.kits.find((k) => k.character.localeCompare(character, undefined, { sensitivity: 'base' }) === 0);
}

function pieceWarnings(piece: ComboPiece, text: string = piece.notation): string[] {
  return parseNotation(text, { game: 'ttt2', characters: [piece.character] })
    .diagnostics.filter((d) => d.severity === 'warning')
    .map((d) => d.message);
}

/**
 * R4 at piece level (checked once per piece, not per combination): a filler or
 * ender must not add a second Bound, and no piece may use a mechanic TTT2 lacks.
 */
function fatalIssue(piece: ComboPiece, text: string, isRoute: boolean): string | null {
  const result = parseNotation(text, { game: 'ttt2', characters: [piece.character] });
  if (result.diagnostics.some((d) => d.code === 'mechanic-unavailable')) return 'R4 mechanic-unavailable';
  const bounds = flattenNodes(result.ast).filter((n) => n.type === 'event' && n.mechanic === 'bound').length;
  if (bounds > (isRoute ? 1 : 0)) return 'R4 extender-repeated';
  return null;
}

function formMatches(piece: ComboPiece, form: string | undefined, character: string): boolean {
  const selected = form ?? character;
  if (piece.forms) return piece.forms.includes(selected);
  return (piece.form ?? character) === selected;
}

/** Flags for a piece; `text` is the part actually used (a route's opener). */
function pieceFlags(piece: ComboPiece, which: Flag['piece'], text: string = piece.notation): Flag[] {
  return [
    ...(piece.condition ? [{ kind: 'condition' as const, piece: which, text: piece.condition }] : []),
    ...piece.notes.map((text) => ({ kind: 'note' as const, piece: which, text })),
    ...pieceWarnings(piece, text).map((message) => ({ kind: 'notation' as const, piece: which, text: message })),
  ];
}

/** Merge consecutive segments of the same character into one labeled section. */
function assemble(segments: ReadonlyArray<{ who: string; text: string }>): string {
  const merged: Array<{ who: string; text: string }> = [];
  for (const s of segments) {
    const last = merged[merged.length - 1];
    if (last && last.who === s.who) merged[merged.length - 1] = { who: s.who, text: `${last.text} > ${s.text}` };
    else merged.push({ ...s });
  }
  return merged.map((s) => `${s.who}:\n${s.text}`).join('\n');
}

export interface PoolPiece {
  piece: ComboPiece;
  /** Things to verify for this piece alone. */
  flags: Flag[];
}

export interface PoolRoute extends PoolPiece {
  analysis: RouteAnalysis;
}

/** Every piece usable for a team and set of options, per phase, in guide order. */
export interface PiecePools {
  /** Roster names: who performs the route (point), the filler and the ender. */
  point: string;
  fillerCharacter: string;
  enderCharacter: string;
  routes: PoolRoute[];
  fillers: PoolPiece[];
  enders: PoolPiece[];
  rejected: Record<string, number>;
}

export interface ComboPick {
  routeId: string;
  fillerId: string;
  enderId: string;
}

const CARRY_FLAG: Flag = { kind: 'condition', piece: 'route', text: 'Open-ground route: check that it carries the opponent to the wall before the TA.' };

/** Applies the hard rules (R1–R6) once per piece; any route × filler × ender left is a valid combo. */
export function collectPieces(library: GuideLibrary, options: GeneratorOptions): PiecePools | null {
  const pointKit = findKit(library, options.point);
  const partnerKit = findKit(library, options.partner);
  if (!pointKit || !partnerKit) return null;
  const rejected: Record<string, number> = {};
  const reject = (rule: string) => {
    rejected[rule] = (rejected[rule] ?? 0) + 1;
  };

  const who = (p: Performer) => (p === 'point' ? { kit: pointKit, form: options.pointForm } : { kit: partnerKit, form: options.partnerForm });
  const usable = (p: ComboPiece) => (options.includeAdditional || !p.additional) && (!options.onlyClean || pieceWarnings(p).length === 0);

  const routes = pointKit.pieces
    .filter((p) => p.role === 'route' && p.routeKind && options.routeKinds.includes(p.routeKind))
    .filter((p) => (options.context === 'open' ? p.context === 'open' : p.context === 'wall' || options.wallRoutes !== 'wallOnly'))
    .filter((p) => !options.starter || p.starter === options.starter)
    .filter((p) => formMatches(p, options.pointForm, pointKit.character))
    .map((p) => ({ piece: p, analysis: analyzeRoute(p.notation, p.character) }))
    .filter(({ analysis }) => {
      if (!analysis.opener) reject('R1 route has no B!');
      return Boolean(analysis.opener);
    })
    .filter(({ piece, analysis }) => (options.includeAdditional || !piece.additional) && (!options.onlyClean || pieceWarnings(piece, analysis.opener).length === 0))
    .filter(({ piece, analysis }) => {
      const issue = fatalIssue(piece, analysis.opener as string, true);
      if (issue) reject(issue);
      return !issue;
    })
    .map(({ piece, analysis }) => ({
      piece,
      analysis,
      flags: [...(options.context === 'wall' && piece.context === 'open' ? [CARRY_FLAG] : []), ...pieceFlags(piece, 'route', analysis.opener)],
    }));

  const listFor = (role: 'taFiller' | 'ender', performer: Performer, which: Flag['piece']): PoolPiece[] => {
    const { kit, form } = who(performer);
    return kit.pieces
      .filter((p) => p.role === role && p.context === options.context && formMatches(p, form, kit.character) && usable(p))
      .filter((p) => {
        const issue = fatalIssue(p, p.notation, false);
        if (issue) reject(issue);
        return !issue;
      })
      .map((piece) => ({ piece, flags: pieceFlags(piece, which) }));
  };

  return {
    point: pointKit.character,
    fillerCharacter: who(options.fillerBy).kit.character,
    enderCharacter: who(options.enderBy).kit.character,
    routes,
    fillers: listFor('taFiller', options.fillerBy, 'filler'),
    enders: listFor('ender', options.enderBy, 'ender'),
    rejected,
  };
}

function compose(pools: PiecePools, route: PoolRoute, filler: PoolPiece, ender: PoolPiece): GeneratedCombo {
  return {
    id: `${route.piece.id}+${filler.piece.id}+${ender.piece.id}`,
    route: route.piece,
    filler: filler.piece,
    ender: ender.piece,
    analysis: route.analysis,
    notation: assemble([
      { who: pools.point, text: `${route.analysis.opener} > TA!` },
      { who: pools.fillerCharacter, text: filler.piece.notation },
      { who: pools.enderCharacter, text: ender.piece.notation },
    ]),
    flags: [...route.flags, ...filler.flags, ...ender.flags],
  };
}

/** The combo made of the chosen pieces, or null when one of them is not in the pools. */
export function assembleCombo(pools: PiecePools, pick: ComboPick): GeneratedCombo | null {
  const route = pools.routes.find((r) => r.piece.id === pick.routeId);
  const filler = pools.fillers.find((f) => f.piece.id === pick.fillerId);
  const ender = pools.enders.find((e) => e.piece.id === pick.enderId);
  return route && filler && ender ? compose(pools, route, filler, ender) : null;
}

function fewestFlags<T extends PoolPiece>(list: readonly T[], tieBreak: (a: T, b: T) => number = () => 0): T | undefined {
  return [...list].sort((a, b) => a.flags.length - b.flags.length || tieBreak(a, b))[0];
}

/** Default pick: per phase, the piece with the fewest things to verify (plain starters before CH/LP/wall). */
export function bestPick(pools: PiecePools): ComboPick | null {
  const route = fewestFlags(pools.routes, (a, b) => KIND_ORDER[a.piece.routeKind ?? 'normal'] - KIND_ORDER[b.piece.routeKind ?? 'normal']);
  const filler = fewestFlags(pools.fillers);
  const ender = fewestFlags(pools.enders);
  return route && filler && ender ? { routeId: route.piece.id, fillerId: filler.piece.id, enderId: ender.piece.id } : null;
}

export function generateCombos(library: GuideLibrary, options: GeneratorOptions): GeneratorResult {
  const pools = collectPieces(library, options);
  if (!pools) return { combos: [], stats: { routes: 0, fillers: 0, enders: 0, candidates: 0, valid: 0, rejected: {} } };
  const { routes, fillers, enders } = pools;
  const combos = routes.flatMap((route) => fillers.flatMap((filler) => enders.map((ender) => compose(pools, route, filler, ender))));

  // Fewest things to verify first, then plain starters before CH/LP/wall.
  const ranked = [...combos].sort(
    (a, b) =>
      a.flags.length - b.flags.length ||
      KIND_ORDER[a.route.routeKind ?? 'normal'] - KIND_ORDER[b.route.routeKind ?? 'normal'] ||
      a.id.localeCompare(b.id),
  );
  return {
    combos: options.limit ? ranked.slice(0, options.limit) : ranked,
    stats: { routes: routes.length, fillers: fillers.length, enders: enders.length, candidates: combos.length, valid: combos.length, rejected: pools.rejected },
  };
}
