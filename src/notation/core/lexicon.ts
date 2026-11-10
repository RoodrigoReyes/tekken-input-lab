/**
 * Layer 1 — core notation shared by every Tekken game.
 * Pure data: the tokenizer and parser consult these tables.
 */
import type { Direction, MotionId } from '../../types/notation';

/** Own-property lookup: plain-object tables must never resolve `constructor`, `__proto__`, … */
export function own<T>(table: Readonly<Record<string, T>>, key: string): T | undefined {
  return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined;
}

export const DIRECTIONS: readonly Direction[] = ['f', 'b', 'u', 'd', 'df', 'db', 'uf', 'ub', 'n'];

const DIRECTION_SET = new Set<string>(DIRECTIONS);

/** Lowercase = tap, UPPERCASE = held (Wavu convention). Mixed case is not a direction. */
export function lookupDirection(word: string): { value: Direction; held: boolean } | null {
  if (DIRECTION_SET.has(word)) return { value: word as Direction, held: false };
  const lower = word.toLowerCase();
  if (word === word.toUpperCase() && DIRECTION_SET.has(lower)) {
    return { value: lower as Direction, held: lower !== 'n' };
  }
  return null;
}

export const ARROW_DIRECTIONS: Readonly<Record<string, Direction>> = {
  '→': 'f',
  '←': 'b',
  '↑': 'u',
  '↓': 'd',
  '↗': 'uf',
  '↖': 'ub',
  '↘': 'df',
  '↙': 'db',
};

export const DIRECTION_ARROWS: Readonly<Record<Direction, string>> = {
  f: '→',
  b: '←',
  u: '↑',
  d: '↓',
  uf: '↗',
  ub: '↖',
  df: '↘',
  db: '↙',
  n: '★',
};

export interface MotionDef {
  id: MotionId;
  label: string;
  /** Directions drawn inside the compact motion icon. */
  sequence: readonly Direction[];
}

export const MOTIONS: Readonly<Record<MotionId, MotionDef>> = {
  qcf: { id: 'qcf', label: 'Quarter circle forward', sequence: ['d', 'df', 'f'] },
  qcb: { id: 'qcb', label: 'Quarter circle back', sequence: ['d', 'db', 'b'] },
  hcf: { id: 'hcf', label: 'Half circle forward', sequence: ['b', 'db', 'd', 'df', 'f'] },
  hcb: { id: 'hcb', label: 'Half circle back', sequence: ['f', 'df', 'd', 'db', 'b'] },
  cd: { id: 'cd', label: 'Crouch dash', sequence: ['f', 'n', 'd', 'df'] },
  ff: { id: 'ff', label: 'Forward dash input', sequence: ['f', 'f'] },
  bb: { id: 'bb', label: 'Backdash input', sequence: ['b', 'b'] },
  fff: { id: 'fff', label: 'Run input', sequence: ['f', 'f', 'f'] },
};

export function lookupMotion(word: string): MotionDef | null {
  return own<MotionDef>(MOTIONS, word.toLowerCase()) ?? null;
}

export interface WordDef {
  id: string;
  abbr: string;
  label: string;
}

/** Generic states that prefix the next input (WS 4, FC df+1, CH 1, H.2+3). */
export const STATES: Readonly<Record<string, WordDef>> = {
  ws: { id: 'whileStanding', abbr: 'WS', label: 'While standing' },
  iws: { id: 'instantWhileStanding', abbr: 'iWS', label: 'Instant while standing' },
  fc: { id: 'fullCrouch', abbr: 'FC', label: 'Full crouch' },
  bt: { id: 'backTurned', abbr: 'BT', label: 'Back turned' },
  wr: { id: 'whileRunning', abbr: 'WR', label: 'While running' },
  ch: { id: 'counterHit', abbr: 'CH', label: 'Counter hit' },
  lp: { id: 'lowParry', abbr: 'LP', label: 'Low parry' },
};

/** Heat state prefix (`H.`). Kept separate because it is a game mechanic (T8 only). */
export const HEAT_PREFIX: WordDef = { id: 'heat', abbr: 'H.', label: 'During Heat' };

/** Movement written as its own step (SSL 1 = sidestep left, then 1). */
export const MOVEMENTS: Readonly<Record<string, WordDef>> = {
  dash: { id: 'dash', abbr: 'dash', label: 'Dash' },
  micro: { id: 'microdash', abbr: 'micro', label: 'Microdash' },
  ss: { id: 'sidestep', abbr: 'SS', label: 'Sidestep' },
  ssl: { id: 'sidestepLeft', abbr: 'SSL', label: 'Sidestep left' },
  ssr: { id: 'sidestepRight', abbr: 'SSR', label: 'Sidestep right' },
  sw: { id: 'sidewalk', abbr: 'SW', label: 'Sidewalk' },
  swl: { id: 'sidewalkLeft', abbr: 'SWL', label: 'Sidewalk left' },
  swr: { id: 'sidewalkRight', abbr: 'SWR', label: 'Sidewalk right' },
  bd: { id: 'backdash', abbr: 'BD', label: 'Backdash' },
  bdc: { id: 'backdashCancel', abbr: 'BDC', label: 'Backdash cancel' },
  wd: { id: 'wavedash', abbr: 'WD', label: 'Wavedash' },
  cc: { id: 'crouchCancel', abbr: 'CC', label: 'Crouch cancel' },
  run: { id: 'run', abbr: 'run', label: 'Run' },
  jump: { id: 'jump', abbr: 'jump', label: 'Jump' },
};

export function lookupState(word: string): WordDef | null {
  return own(STATES, word.toLowerCase()) ?? null;
}

export function lookupMovement(word: string): WordDef | null {
  return own(MOVEMENTS, word.toLowerCase()) ?? null;
}

/** Attack buttons 1-4 plus TAG (5). Other digits are invalid in Tekken notation. */
export const TAG_BUTTON = 5;
export function isValidButton(n: number): boolean {
  return n >= 1 && n <= 5;
}
