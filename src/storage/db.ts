import Dexie, { type Table } from 'dexie';
import type { Combo } from '../types/combo';

export const DB_NAME = 'tekken-input-lab';

/**
 * IndexedDB schema. Bump the Dexie version and add an upgrade() when the
 * stored shape changes. Booleans (favorite) cannot be IndexedDB keys, so
 * favorites are filtered in memory.
 */
export class InputLabDatabase extends Dexie {
  combos!: Table<Combo, string>;

  constructor(name: string = DB_NAME) {
    super(name);
    this.version(1).stores({
      combos: '&id, game, character, partner, difficulty, updatedAt, *tags',
    });
  }
}
