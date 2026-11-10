/**
 * Layer 3 — character-specific notation: named moves and stances.
 * Named moves stay as labeled moves (EWGF is never expanded unless the user
 * enables the expanded display mode, which uses `expansion`).
 *
 * Entries are intentionally conservative: only abbreviations we are confident
 * about are listed. Add more by extending CHARACTER_ENTRIES.
 */
import type { GameId } from '../../types/notation';

export type CharacterEntryKind = 'named' | 'stance';

export interface CharacterEntry {
  /** Canonical abbreviation as written in notation (matched case-insensitively). */
  abbr: string;
  label: string;
  kind: CharacterEntryKind;
  characters: readonly string[];
  games: readonly GameId[];
  /** Input notation shown in expanded mode (named moves only). */
  expansion?: string;
}

const ALL: readonly GameId[] = ['t6', 'ttt2', 't7', 't8'];
const MODERN: readonly GameId[] = ['t7', 't8'];
const TTT2: readonly GameId[] = ['ttt2'];
const JIN_EWGF: readonly GameId[] = ['ttt2', 't7', 't8'];

const MISHIMA_WIND_GOD = ['Kazuya', 'Heihachi', 'Devil Jin'] as const;

export const CHARACTER_ENTRIES: readonly CharacterEntry[] = [
  // --- Mishima named moves -------------------------------------------------
  { abbr: 'EWGF', label: 'Electric Wind God Fist', kind: 'named', characters: MISHIMA_WIND_GOD, games: ALL, expansion: 'f,n,d,df:2' },
  { abbr: 'EWGF', label: 'Electric Wind God Fist', kind: 'named', characters: ['Jin'], games: JIN_EWGF, expansion: 'f,n,d,df:2' },
  { abbr: 'PEWGF', label: 'Perfect Electric Wind God Fist', kind: 'named', characters: MISHIMA_WIND_GOD, games: ALL, expansion: 'f,n,d,df:2' },
  { abbr: 'PEWGF', label: 'Perfect Electric Wind God Fist', kind: 'named', characters: ['Jin'], games: JIN_EWGF, expansion: 'f,n,d,df:2' },
  { abbr: 'WGF', label: 'Wind God Fist', kind: 'named', characters: MISHIMA_WIND_GOD, games: ALL, expansion: 'f,n,d,df+2' },
  { abbr: 'WGF', label: 'Wind God Fist', kind: 'named', characters: ['Jin'], games: JIN_EWGF, expansion: 'f,n,d,df+2' },
  { abbr: 'EWHF', label: 'Electric Wind Hook Fist', kind: 'named', characters: ['Heihachi'], games: MODERN },
  { abbr: 'EWHF', label: 'Electric Wind Hook Fist', kind: 'named', characters: ['Jin'], games: TTT2 },
  { abbr: 'EWGF', label: 'Electric Wind God Fist', kind: 'named', characters: ['Angel'], games: TTT2, expansion: 'f,n,d,df:2' },
  { abbr: 'DEWGF', label: 'Double Electric Wind God Fist', kind: 'named', characters: ['Angel'], games: TTT2 },
  { abbr: 'TGF', label: 'TGF', kind: 'named', characters: ['Heihachi', 'Devil Jin'], games: TTT2 },
  { abbr: 'AGF', label: 'AGF', kind: 'named', characters: ['Alex', 'Roger Jr.'], games: TTT2 },

  // --- Stances ---------------------------------------------------------------
  { abbr: 'ZEN', label: 'Zenshin', kind: 'stance', characters: ['Jin'], games: MODERN },
  { abbr: 'AOP', label: 'Art of Phoenix', kind: 'stance', characters: ['Xiaoyu'], games: ALL },
  { abbr: 'HYP', label: 'Hypnotist', kind: 'stance', characters: ['Xiaoyu'], games: ALL },
  { abbr: 'RDS', label: 'Rain Dance', kind: 'stance', characters: ['Xiaoyu'], games: MODERN },
  { abbr: 'RDS', label: 'RDS stance', kind: 'stance', characters: ['Xiaoyu', 'Miharu'], games: TTT2 },
  { abbr: 'HMS', label: 'Hitman Stance', kind: 'stance', characters: ['Lee', 'Violet'], games: ALL },
  { abbr: 'LFF', label: 'Left Foot Forward', kind: 'stance', characters: ['Hwoarang'], games: ALL },
  { abbr: 'RFF', label: 'Right Foot Forward', kind: 'stance', characters: ['Hwoarang'], games: ALL },
  { abbr: 'LFS', label: 'Left Flamingo', kind: 'stance', characters: ['Hwoarang'], games: ALL },
  { abbr: 'RFS', label: 'Right Flamingo', kind: 'stance', characters: ['Hwoarang'], games: ALL },
  { abbr: 'DEN', label: 'Dynamic Entry', kind: 'stance', characters: ['Lars'], games: ['t6', 't7', 't8'] },
  { abbr: 'SEN', label: 'Silent Entry', kind: 'stance', characters: ['Lars'], games: ['t6', 't7', 't8'] },
  { abbr: 'LEN', label: 'Limited Entry', kind: 'stance', characters: ['Lars'], games: ['t6', 't7', 't8'] },
  { abbr: 'SCR', label: 'Scarecrow', kind: 'stance', characters: ['Zafina'], games: ALL },
  { abbr: 'TRT', label: 'Tarantula', kind: 'stance', characters: ['Zafina'], games: ALL },
  { abbr: 'MNT', label: 'Mantis', kind: 'stance', characters: ['Zafina'], games: ALL },
  { abbr: 'KNK', label: 'Kenpo stance', kind: 'stance', characters: ['Leo'], games: ALL },
  { abbr: 'HBS', label: 'Hunting Bear Stance', kind: 'stance', characters: ['Kuma', 'Panda'], games: ALL },
  { abbr: 'HSP', label: 'Handstand', kind: 'stance', characters: ['Eddy', 'Christie', 'Tiger'], games: ALL },
  { abbr: 'RLX', label: 'Relaxed / Negativa', kind: 'stance', characters: ['Eddy', 'Christie', 'Tiger'], games: ALL },
  { abbr: 'FLE', label: 'Flea', kind: 'stance', characters: ['Yoshimitsu'], games: ALL },
  { abbr: 'MED', label: 'Meditation', kind: 'stance', characters: ['Yoshimitsu'], games: ALL },
  { abbr: 'KIN', label: 'Kincho', kind: 'stance', characters: ['Yoshimitsu'], games: ALL },
  { abbr: 'NSS', label: 'No Sword Stance', kind: 'stance', characters: ['Yoshimitsu'], games: ALL },
  { abbr: 'IND', label: 'Indian Stance', kind: 'stance', characters: ['Yoshimitsu'], games: ALL },
  { abbr: 'FLK', label: 'Flicker', kind: 'stance', characters: ['Steve'], games: ALL },
  { abbr: 'PAB', label: 'Peekaboo', kind: 'stance', characters: ['Steve'], games: ALL },
  { abbr: 'DCK', label: 'Duck', kind: 'stance', characters: ['Steve'], games: ALL },
  { abbr: 'LNH', label: 'Lion Heart', kind: 'stance', characters: ['Steve'], games: MODERN },
  { abbr: 'HRM', label: 'Hermit', kind: 'stance', characters: ['Leroy'], games: MODERN },
  { abbr: 'DEW', label: 'Dew Glide', kind: 'stance', characters: ['Lili'], games: MODERN },
  { abbr: 'STB', label: 'Starburst', kind: 'stance', characters: ['Claudio'], games: MODERN },
  { abbr: 'SNE', label: 'Snake Eyes', kind: 'stance', characters: ['Bryan'], games: MODERN },
  { abbr: 'KNP', label: 'Kenpo', kind: 'stance', characters: ['Feng'], games: MODERN },
  { abbr: 'DES', label: 'Destructive Form', kind: 'stance', characters: ['Alisa'], games: MODERN },
  { abbr: 'IZU', label: 'Izumo', kind: 'stance', characters: ['Jun'], games: ['t8'] },
  { abbr: 'MIA', label: 'Miare', kind: 'stance', characters: ['Jun'], games: ['t8'] },
  { abbr: 'LIB', label: 'Libertador', kind: 'stance', characters: ['Azucena'], games: ['t8'] },

  // --- TTT2 abbreviations as written in the bundled "TTT2 BNB Combos" guide ----
  // Labels are given only where the meaning is certain; otherwise the
  // abbreviation itself is the label (never an invented meaning).
  ...ttt2Stances([
    ['IZU', 'Izumo', ['Jun', 'Unknown']],
    ['FLA', 'Flamingo', ['Baek']],
    ['DUCK', 'Duck', ['Steve']],
    ['DUCKc', 'Duck cancel', ['Steve']],
    ['SE', 'Silent Entry', ['Lars']],
    ['DE', 'Dynamic Entry', ['Lars']],
    ['FLY', 'Flight', ['Alisa', 'Angel', 'Jinpachi', 'True Ogre']],
    ['DES', 'Destructive Form', ['Alisa']],
    ['BOK', 'Bok stance', ['Leo']],
    ['DSS', 'Dragon Sign Stance', ['Marshall Law']],
    ['CJM', 'Chaos Judgment', ['Anna']],
    ['CRN', 'Crane', ['Lei']],
    ['TGR', 'Tiger', ['Lei']],
    ['PHX', 'Phoenix', ['Lei']],
    ['KND', 'KND', ['Lei']],
    ['SAV', 'SAV', ['Miguel']],
    ['VTS', 'VTS', ['Marduk']],
    ['VTSc', 'VTS cancel', ['Marduk']],
    ['CDS', 'CDS', ['Jin']],
    ['ISW', 'ISW', ['Jaycee', 'Michelle']],
    ['CES', 'CES', ['Jaycee', 'Michelle']],
    ['MAD', 'MAD', ['Dr. Bosconovitch']],
    ['PAN', 'PAN', ['Dr. Bosconovitch']],
    ['PND', 'PND', ['Dr. Bosconovitch']],
    ['PAD', 'PAD', ['Dr. Bosconovitch']],
    ['CDc', 'CDc', ['Dragunov']],
    ['SET', 'SET', ['Kunimitsu']],
    ['MTS', 'MTS', ['Bruce']],
    ['ROC', 'ROC', ['Alex', 'Roger Jr.']],
    ['GS', 'GS', ['Armor King', 'King']],
    ['DU', 'DU', ['Armor King']],
    ['SDW', 'SDW', ['Raven']],
    ['VAN', 'VAN', ['Raven']],
    ['BOOT', 'BOOT', ['True Ogre']],
    ['HHS', 'HHS', ['Ganryu']],
  ]),
];

function ttt2Stances(rows: ReadonlyArray<[string, string, readonly string[]]>): CharacterEntry[] {
  return rows.map(([abbr, label, characters]) => ({ abbr, label, kind: 'stance', characters, games: TTT2 }));
}

export interface CharacterLookup {
  entry: CharacterEntry;
  /** Every character in this game whose dictionary defines the abbreviation. */
  characters: string[];
  /** True when one of the context characters defines it. */
  inContext: boolean;
}

function sameName(a: string, b: string): boolean {
  return a.localeCompare(b, undefined, { sensitivity: 'base' }) === 0;
}

/**
 * Look up a character-specific word for a game. Context characters are
 * preferred; when no context character defines it, any character in the game
 * may still match (reported via `inContext: false`).
 */
export function lookupCharacterWord(
  game: GameId,
  word: string,
  context: readonly string[],
): CharacterLookup | null {
  const upper = word.toUpperCase();
  const matches = CHARACTER_ENTRIES.filter((e) => e.abbr.toUpperCase() === upper && e.games.includes(game));
  if (matches.length === 0) return null;
  const characters = [...new Set(matches.flatMap((e) => e.characters))];
  const contextual = matches.find((e) => e.characters.some((c) => context.some((x) => sameName(c, x))));
  const entry = contextual ?? matches[0];
  if (!entry) return null;
  return { entry, characters, inContext: contextual !== undefined };
}

/** All entries usable by a character in a game (for the notation reference panel). */
export function entriesForCharacter(game: GameId, character: string): CharacterEntry[] {
  const seen = new Set<string>();
  return CHARACTER_ENTRIES.filter((e) => {
    if (!e.games.includes(game) || !e.characters.some((c) => sameName(c, character))) return false;
    if (seen.has(e.abbr)) return false;
    seen.add(e.abbr);
    return true;
  });
}
