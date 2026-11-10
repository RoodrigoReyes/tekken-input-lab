/**
 * Community notation dialects. Ambiguous symbols are resolved here, never globally:
 *  - `;`   section separator (most guides) vs Tag Assault (ttt2combo.kagewebsite.com)
 *  - `WB!` Wall Break (Wavu Wiki) vs Wall Bound/Bounce (some community guides)
 *  - `W!`  Wall Splat — Wavu also uses it for Wall Bounce, so the caption says so.
 */
import type { GameId } from '../types/notation';
import { own } from './core/lexicon';
import type { MechanicId } from './mechanics';

export type DialectId = 'standard' | 'kage-ttt2' | 'wall-bounce';

export interface Dialect {
  id: DialectId;
  name: string;
  description: string;
  games: readonly GameId[];
  semicolon: 'section' | 'tagAssault';
  /** Event abbreviations (lowercase, without `!`) → mechanic. */
  events: Readonly<Record<string, MechanicId>>;
}

const BASE_EVENTS: Readonly<Record<string, MechanicId>> = {
  b: 'bound',
  s: 'screw',
  t: 'tornado',
  w: 'wallSplat',
  wb: 'wallBreak',
  f: 'floorBreak',
  fb: 'floorBreak',
  bb: 'balconyBreak',
  wbl: 'wallBlast',
  fbl: 'floorBlast',
  wbo: 'wallBound',
  ta: 'tagAssault',
};

/** Canonical spelling of each event abbreviation (keys are lowercase, without `!`). */
export const EVENT_SPELLING: Readonly<Record<string, string>> = {
  b: 'B!', s: 'S!', t: 'T!', w: 'W!', wb: 'WB!', f: 'F!', fb: 'FB!', bb: 'BB!',
  wbl: 'WBl!', fbl: 'FBl!', wbo: 'WBo!', ta: 'TA!',
};

export const DIALECTS: Readonly<Record<DialectId, Dialect>> = {
  standard: {
    id: 'standard',
    name: 'Standard (Wavu Wiki)',
    description: "`WB!` = Wall Break, `W!` = Wall Splat/Bounce, `;` separates character sections.",
    games: ['t6', 't7', 't8', 'ttt2'],
    semicolon: 'section',
    events: BASE_EVENTS,
  },
  'kage-ttt2': {
    id: 'kage-ttt2',
    name: 'TTT2 Combo (kagewebsite)',
    description: '`;` = Tag Assault (as on ttt2combo.kagewebsite.com). Otherwise standard.',
    games: ['ttt2'],
    semicolon: 'tagAssault',
    events: BASE_EVENTS,
  },
  'wall-bounce': {
    id: 'wall-bounce',
    name: 'Community (WB! = Wall Bound)',
    description: '`WB!` = Wall Bound/Bounce, as used by some community guides. Otherwise standard.',
    games: ['t6', 't7', 't8', 'ttt2'],
    semicolon: 'section',
    events: { ...BASE_EVENTS, wb: 'wallBound' },
  },
};

export function findDialect(id: string): Dialect | undefined {
  return own<Dialect>(DIALECTS, id);
}

export function getDialect(id: string | undefined): Dialect {
  return (id ? findDialect(id) : undefined) ?? DIALECTS.standard;
}

export function lookupEvent(dialect: Dialect, abbr: string): MechanicId | undefined {
  return own(dialect.events, abbr.toLowerCase());
}

export function dialectsForGame(game: GameId): Dialect[] {
  return Object.values(DIALECTS).filter((d) => d.games.includes(game));
}
