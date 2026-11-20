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
  aliases?: readonly (string | { abbr: string; expandsTo: string })[];
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

const entries: readonly CharacterEntry[] = [
  // Mishima named moves
  { abbr: 'EWGF', label: 'Electric Wind God Fist', kind: 'named', characters: MISHIMA_WIND_GOD, games: ALL, expansion: 'f,n,d,df:2' },
  { abbr: 'EWGF', label: 'Electric Wind God Fist', kind: 'named', characters: ['Jin'], games: JIN_EWGF, expansion: 'f,n,d,df:2' },
  { abbr: 'PEWGF', label: 'Perfect Electric Wind God Fist', kind: 'named', characters: MISHIMA_WIND_GOD, games: ALL, expansion: 'f,n,d,df:2' },
  { abbr: 'PEWGF', label: 'Perfect Electric Wind God Fist', kind: 'named', characters: ['Jin'], games: JIN_EWGF, expansion: 'f,n,d,df:2' },
  { abbr: 'WGF', label: 'Wind God Fist', kind: 'named', characters: MISHIMA_WIND_GOD, games: ALL, expansion: 'f,n,d,df+2' },
  { abbr: 'WGF', label: 'Wind God Fist', kind: 'named', characters: ['Jin'], games: JIN_EWGF, expansion: 'f,n,d,df+2' },
  { abbr: 'EWHF', label: 'Electric Wind Hook Fist', kind: 'named', characters: ['Heihachi'], games: MODERN },
  { abbr: 'EWHF', label: 'Electric Wind Hook Fist', kind: 'named', characters: ['Jin'], games: TTT2 },
  { abbr: 'EWGF', label: 'Electric Wind God Fist', kind: 'named', characters: ['Angel'], games: TTT2, expansion: 'f,n,d,df:2' },
  { abbr: 'TGF', label: 'Thunder God Fist', kind: 'named', characters: ['Heihachi', 'Devil Jin'], games: TTT2 },
  { abbr: 'OTGF', label: 'Omen Thunder God Fist', kind: 'named', characters: ['Heihachi'], games: TTT2 },
  // Written "HS,4" in the guide; in TTT2 HS is never Heat Smash (Tekken 8 only).
  { abbr: 'HS', label: 'Hell Sweep', kind: 'named', characters: ['Devil Jin', 'Kazuya'], games: TTT2, expansion: 'f,n,d,df+4' },
  { abbr: 'Demoman', label: 'Demolition Man', kind: 'named', characters: ['Paul'], games: TTT2 },
  { abbr: 'Debugger', label: 'Debugger', kind: 'named', characters: ['Prototype Jack'], games: TTT2 },
  { abbr: 'AGF', label: 'AGF', kind: 'named', characters: ['Alex', 'Roger Jr.'], games: TTT2 },
  { abbr: 'WGF', label: 'Wind God Fist', kind: 'named', characters: ['Armor King'], games: TTT2 },
  // Inputs from the TTT2 move lists on ludo.guide (see docs/TTT2_ABBREVIATIONS.md).
  { abbr: 'DU', label: 'Dark Upper', kind: 'named', characters: ['Armor King'], games: TTT2, expansion: 'f,n,d,df+2' },
  { abbr: 'GS', label: 'Giant Swing', kind: 'named', characters: ['King'], games: TTT2, expansion: 'f,hcf+1' },
  // Ground throws on a downed opponent; the exact throw depends on how the opponent lies.
  { abbr: 'groundgrab', label: 'Ground throw', kind: 'named', characters: ['Armor King'], games: TTT2, expansion: 'db+1+3' },
  { abbr: 'groundgrab', label: 'Ground throw', kind: 'named', characters: ['King'], games: TTT2, expansion: 'db+2+4' },
  { abbr: 'groundgrab', label: 'Ground throw (Airlift)', kind: 'named', characters: ['Marduk'], games: TTT2, expansion: 'db+1+3' },
  { abbr: 'wallgrab', label: 'Wall throw (Angry Ape)', kind: 'named', characters: ['Marduk'], games: TTT2, expansion: '1+3' },
  { abbr: 'wallgrab', label: 'Wall throw', kind: 'named', characters: ['King'], games: TTT2 },

  // Stances
  { abbr: 'ZEN', label: 'Zenshin', kind: 'stance', characters: ['Jin'], games: MODERN },
  { abbr: 'AOP', label: 'Art of Phoenix', kind: 'stance', characters: ['Xiaoyu'], games: ALL },
  { abbr: 'HYP', label: 'Hypnotist', kind: 'stance', characters: ['Xiaoyu'], games: ALL },
  { abbr: 'RDS', label: 'Rain Dance', kind: 'stance', characters: ['Xiaoyu'], games: MODERN },
  { abbr: 'RDS', label: 'Rain Dance Stance', kind: 'stance', characters: ['Xiaoyu', 'Miharu'], games: TTT2 },
  { abbr: 'HMS', label: 'Hitman Stance', kind: 'stance', characters: ['Lee', 'Violet'], games: ALL },
  { abbr: 'LFF', label: 'Left Foot Forward', kind: 'stance', characters: ['Hwoarang'], games: ALL },
  { abbr: 'RFF', label: 'Right Foot Forward', kind: 'stance', characters: ['Hwoarang'], games: ALL },
  { abbr: 'LFS', aliases: ['LFL'], label: 'Left Flamingo', kind: 'stance', characters: ['Hwoarang'], games: ALL },
  { abbr: 'RFS', aliases: ['RFL'], label: 'Right Flamingo', kind: 'stance', characters: ['Hwoarang'], games: ALL },
  { abbr: 'DEN', aliases: ['DE'], label: 'Dynamic Entry', kind: 'stance', characters: ['Lars'], games: ALL },
  { abbr: 'SEN', aliases: ['SE'], label: 'Silent Entry', kind: 'stance', characters: ['Lars'], games: ALL },
  { abbr: 'LEN', label: 'Limited Entry', kind: 'stance', characters: ['Lars'], games: ALL },
  { abbr: 'SCR', label: 'Scarecrow', kind: 'stance', characters: ['Zafina'], games: ALL },
  { abbr: 'TRT', label: 'Tarantula', kind: 'stance', characters: ['Zafina'], games: ALL },
  { abbr: 'MNT', label: 'Mantis', kind: 'stance', characters: ['Zafina'], games: ALL },
  { abbr: 'KNK', label: 'Kinkei Dokuritsu', kind: 'stance', characters: ['Leo'], games: ALL },
  { abbr: 'HBS', label: 'Hunting Bear Stance', kind: 'stance', characters: ['Kuma', 'Panda'], games: ALL },
  { abbr: 'HSP', label: 'Handstand', kind: 'stance', characters: ['Eddy', 'Christie', 'Tiger'], games: ALL },
  { abbr: 'RLX', label: 'Relaxed / Negativa', kind: 'stance', characters: ['Eddy', 'Christie', 'Tiger'], games: ALL },
  { abbr: 'FLE', label: 'Flea', kind: 'stance', characters: ['Yoshimitsu'], games: ALL },
  { abbr: 'MED', label: 'Meditation', kind: 'stance', characters: ['Yoshimitsu'], games: ALL },
  { abbr: 'KIN', label: 'Kincho', kind: 'stance', characters: ['Yoshimitsu'], games: ALL },
  { abbr: 'NSS', label: 'No Sword Stance', kind: 'stance', characters: ['Yoshimitsu'], games: ALL },
  { abbr: 'IND', label: 'Indian Stance', kind: 'stance', characters: ['Yoshimitsu'], games: ALL },
  { abbr: 'FLK', label: 'Flicker', kind: 'stance', characters: ['Steve'], games: ALL },
  { abbr: 'PAB', aliases: ['PKB'], label: 'Peekaboo', kind: 'stance', characters: ['Steve'], games: ALL },
  { abbr: 'DCK', aliases: ['DUCK'], label: 'Duck', kind: 'stance', characters: ['Steve'], games: ALL },
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

  // Merlin's T6 glossary and existing TTT2 entries, using the sheet's names too.
  ...([
    ['FLA', 'Flamingo', ['Baek']],
    ['SAV', 'Savage Stance', ['Miguel']],
    ['DSS', 'Dragon Sign Stance', ['Law', 'Marshall Law']],
    ['SDW', 'Shadow Stance', ['Raven']],
    ['DCKc', 'Ducking Cancel', ['Steve']],
    ['ROC', 'Rocket Stance', ['Roger Jr.']],
    ['VTSc', 'Vale Tudo Stance Cancel', ['Marduk']],
    ['VTS', 'Vale Tudo Stance', ['Marduk']],
    ['TGR', 'Art of Tiger', ['Lei']],
    ['CJM', 'Chaos Judgment', ['Anna']],
    ['SIT', 'Sit Stance', ['Ganryu']],
    ['CDS', 'Crouching Demon Stance', ['Jin']],
    ['PAN', 'Art of Panther', ['Lei']],
    ['PHX', 'Phoenix Illusion Stance', ['Lei']],
    ['ALB', 'Albatross Spin', ['Steve']],
    ['SBT', 'Single Boot', ['Alisa']],
    ['FLY', 'Flight', ['Alisa']],
    ['DES', 'Destroy Form', ['Alisa']],
    ['CRA', 'Art of Crane', ['Lei']],
    ['LWV', 'Left Weave', ['Steve']],
    ['BOK', 'Bokuho', ['Leo']],
    ['DGF', 'Dragon Fly', ['Yoshimitsu', 'Yoshimitu']],
  ] as ReadonlyArray<[string, string, readonly string[]]>).map(([abbr, label, characters]) =>
    ({ abbr, label, kind: 'stance' as const, characters, games: ['t6'] as const })),
  { abbr: 'GS', label: 'Giant Swing', kind: 'named', characters: ['King'], games: ['t6'] },
  { abbr: 'GS', label: 'GS', kind: 'named', characters: ['Armor King', 'Armour King'], games: ['t6'] },
  { abbr: 'EWHF', label: 'Electric Wind Hook Fist', kind: 'named', characters: ['Jin'], games: ['t6'] },

  // TTT2 abbreviations, as written in the bundled "TTT2 BNB Combos" guide and
  // on ttt2combo.kagewebsite.com (its stance icons carry the full names).
  // Labels are given only where the meaning is certain; otherwise the
  // abbreviation itself is the label (never an invented meaning).
  ...ttt2Stances([
    ['IZU', 'Izumo', ['Jun', 'Unknown']],
    ['GEN', 'Genjutsu Stance', ['Jun', 'Unknown']],
    ['FLA', 'Flamingo', ['Baek']],
    ['DCKc', 'Duck cancel', ['Steve']],
    ['LWV', 'Left Weave', ['Steve']],
    ['ALB', 'Albatross Spin', ['Steve']],
    ['MS', 'Mist Step', ['Lee', 'Violet']],
    ['ROL', 'Prowling Grizzly Roll', ['Kuma', 'Panda']],
    ['BRG', 'Bridge', ['Jaycee', 'Michelle']],
    ['FWR', 'Forward Roll', ['Jaycee', 'Michelle']],
    ['ISW', 'ISW', ['Jaycee', 'Michelle']],
    ['CES', 'Clockwise Evasive Spin', ['Jaycee', 'Michelle']],
    ['FLY', 'Flight', ['Alisa', 'Angel', 'Jinpachi', 'True Ogre']],
    ['AP', 'Astral Projection', ['Jinpachi']],
    ['DES', 'Destructive Form', ['Alisa']],
    ['SBT', 'Single Boot', ['Alisa']],
    ['DBT', 'Dual Boot', ['Alisa']],
    ['BOK', 'Bokuho', ['Leo']],
    ['KNP', 'Kenpo Step', ['Feng']],
    ['STC', 'Shifting Clouds', ['Feng']],
    ['DSS', 'Dragon Sign Stance', ['Marshall Law']],
    ['DFS', 'Dragon Fake Step', ['Marshall Law']],
    ['CJM', 'Chaos Judgment', ['Anna']],
    ['CRA', 'Art of Crane', ['Lei']],
    ['TGR', 'Art of Tiger', ['Lei']],
    ['DGN', 'Art of Dragon', ['Lei']],
    ['SNA', 'Art of Snake', ['Lei']],
    ['PAN', 'Art of Panther', ['Lei']],
    ['PHX', 'Phoenix Illusion Stance', ['Lei']],
    ['DRU', 'Drunken Master Walk', ['Lei']],
    // Lei's ground positions; the site writes them without an icon or a name.
    ['KND', 'KND', ['Lei']],
    ['KNDs', 'KNDs', ['Lei']],
    ['PLDs', 'PLDs', ['Lei']],
    ['FCDs', 'FCDs', ['Lei']],
    ['SLDs', 'SLDs', ['Lei']],
    ['SAV', 'Savage Stance', ['Miguel']],
    ['VTS', 'Vale Tudo Stance', ['Marduk']],
    ['VTSc', 'Vale Tudo Stance cancel', ['Marduk']],
    ['CDS', 'Crouching Demon Stance', ['Jin']],
    ['MAD', 'Mad Pain', ['Dr. Bosconovitch']],
    ['PND', 'Panic Doctor', ['Dr. Bosconovitch']],
    ['PAN', 'PAN', ['Dr. Bosconovitch']],
    ['PAD', 'PAD', ['Dr. Bosconovitch']],
    // The guide also writes it out: f+3~d/f~u.
    ['CDc', 'Crouch Dash cancel', ['Dragunov']],
    // The guide writes SET where the site writes KDE (same strings: f+4~f > SET 1,2,4).
    ['SET', 'Setsunagake', ['Kunimitsu']],
    ['DUS', 'Duston', ['Kunimitsu']],
    // ff+3 is Musasabi Flip; "MUS 2" is its follow-up (Ankle Slashout).
    ['MUS', 'Musasabi Flip', ['Kunimitsu']],
    ['MTS', 'Muay Thai Stance', ['Bruce']],
    ['ROC', 'Rocket Stance', ['Alex', 'Roger Jr.']],
    ['AKS', 'Animal Kick Stance', ['Alex', 'Roger Jr.']],
    ['GS', 'GS', ['Armor King']],
    ['SDW', 'Shadow Stance', ['Raven']],
    ['HAZ', 'Haze Stance', ['Raven']],
    ['VAN', 'VAN', ['Raven']],
    ['BOOT', 'BOOT', ['True Ogre']],
    ['HHS', 'HHS', ['Ganryu']],
    ['SIT', 'Sit Stance', ['Ganryu']],
    ['SWY', 'Swaying', ['Paul']],
    ['LCT', 'Leg Cutter', ['Asuka']],
    ['BAL', 'Spinning Ball', ['Bob', 'Slim Bob']],
    ['DGF', 'Dragonfly Stance', ['Yoshimitsu']],
  ]),
];

const expandingAliases: Readonly<Record<string, readonly { abbr: string; expandsTo: string }[]>> = {
  EWGF: [{ abbr: 'DEWGF', expandsTo: 'EWGF > EWGF' }],
};

const conceptAliases: Readonly<Record<string, readonly string[]>> = {
  ROL: ['ROLL'], BRG: ['Bridge'], CRA: ['CRN'], SET: ['KDE'], DCKc: ['DUCKc'],
};

export const CHARACTER_ENTRIES: readonly CharacterEntry[] = entries.reduce<CharacterEntry[]>((merged, entry) => {
  const aliases = [...(entry.aliases ?? conceptAliases[entry.abbr] ?? []), ...(expandingAliases[entry.abbr] ?? [])];
  const existing = merged.findIndex((other) => other.abbr === entry.abbr && other.kind === entry.kind
    && other.expansion === entry.expansion && other.characters.length === entry.characters.length
    && other.characters.every((character) => entry.characters.includes(character)));
  if (existing < 0) merged.push({ ...entry, ...(aliases ? { aliases } : {}) });
  else {
    const previous = merged[existing]!;
    merged[existing] = { ...previous, games: [...new Set([...previous.games, ...entry.games])] };
  }
  return merged;
}, []);

function ttt2Stances(rows: ReadonlyArray<[string, string, readonly string[]]>): CharacterEntry[] {
  return rows.map(([abbr, label, characters]) => ({ abbr, label, kind: 'stance', characters, games: TTT2 }));
}

export interface CharacterLookup {
  entry: CharacterEntry;
  stages?: string;
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
  entries: readonly CharacterEntry[] = CHARACTER_ENTRIES,
): CharacterLookup | null {
  const upper = word.toUpperCase();
  const matches = entries.filter((e) => (e.abbr.toUpperCase() === upper || e.aliases?.some((alias) => (typeof alias === 'string' ? alias : alias.abbr).toUpperCase() === upper)) && e.games.includes(game));
  if (matches.length === 0) return null;
  const characters = [...new Set(matches.flatMap((e) => e.characters))];
  const contextual = matches.find((e) => e.characters.some((c) => context.some((x) => sameName(c, x))));
  const entry = contextual ?? matches[0];
  if (!entry) return null;
  const alias = entry.aliases?.find((a) => typeof a !== 'string' && a.abbr.toUpperCase() === upper);
  return { entry, characters, inContext: contextual !== undefined, ...(alias && typeof alias !== 'string' ? { stages: alias.expandsTo } : {}) };
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
