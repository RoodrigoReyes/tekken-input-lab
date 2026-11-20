/**
 * The per-character TTT2 move catalog parsed from the Fandom movelists
 * (src/data/ttt2/movelists.json). Loaded lazily so it stays off the main bundle.
 * Used only to suggest extra enders for the starting character (see candidateEnders).
 */
import type { MovelistMove } from './candidateEnders';

type Catalog = Record<string, MovelistMove[]>;

let cached: Promise<Catalog> | null = null;

export function loadMovelists(): Promise<Catalog> {
  cached ??= import('../data/ttt2/movelists.json')
    .then((m) => m.default as Catalog)
    .catch((error: unknown) => {
      cached = null; // allow a retry
      throw error;
    });
  return cached;
}

/**
 * Roster names whose wiki move-list key shares no word with them (real names,
 * variants, or the in-game alias). Shared movesets reuse another character's list.
 */
const ALIASES: Readonly<Record<string, string>> = {
  'Ancient Ogre': 'Ogre',
  Bob: 'Robert Richards',
  'Slim Bob': 'Robert Richards',
  'Dr. Bosconovitch': 'Doctor Bosconovitch',
  Lili: 'Emilie de Rochefort',
  'P. Jack': 'Prototype Jack',
  Panda: 'Kuma II', // Panda mirrors Kuma's moveset in TTT2
};

/**
 * The move list for a roster name. Guide/roster names are short ("Kazuya",
 * "Marduk", "Lili"); the catalog keys are full wiki names ("Kazuya Mishima",
 * "Craig Marduk", "Emilie de Rochefort"). Match by alias, then exact, then the
 * roster name as the first or last whole word of the key.
 */
export function movesFor(catalog: Catalog, character: string): MovelistMove[] {
  const name = ALIASES[character] ?? character;
  if (catalog[name]) return catalog[name];
  const lower = name.toLowerCase();
  const key = Object.keys(catalog).find((k) => {
    const kl = k.toLowerCase();
    return kl === lower || kl.startsWith(`${lower} `) || kl.endsWith(` ${lower}`);
  });
  return key ? catalog[key] ?? [] : [];
}
