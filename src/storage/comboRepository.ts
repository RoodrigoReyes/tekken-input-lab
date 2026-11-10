/**
 * Repository pattern over combo persistence. The UI depends on the
 * ComboRepository interface only, so a cloud-synced implementation can be
 * added later without touching features.
 */
import type { Combo, ComboDraft } from '../types/combo';
import { InputLabDatabase } from './db';
import { comboDraftSchema, describeIssues } from './schema';

export interface ComboRepository {
  findAll(): Promise<Combo[]>;
  findById(id: string): Promise<Combo | null>;
  create(draft: ComboDraft): Promise<Combo>;
  update(id: string, changes: Partial<ComboDraft>): Promise<Combo>;
  /** Toggle favorite without touching updatedAt or revalidating the record. */
  setFavorite(id: string, favorite: boolean): Promise<void>;
  delete(id: string): Promise<void>;
  duplicate(id: string): Promise<Combo>;
  /** Insert or overwrite combos (by id). Used by JSON import. */
  putMany(combos: readonly Combo[]): Promise<void>;
  clear(): Promise<void>;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(id: string) {
    super(`Combo ${id} not found`);
    this.name = 'NotFoundError';
  }
}

const MAX_NAME = 120;
const COPY_SUFFIX = ' (copy)';

/** Normalization shared by create/update and JSON import. */
export function normalizeCombo<T extends Pick<ComboDraft, 'game' | 'partner' | 'tags'>>(value: T): T {
  const { partner, ...rest } = value;
  const keepPartner = value.game === 'ttt2' && partner;
  return { ...(rest as T), tags: [...new Set(value.tags)], ...(keepPartner ? { partner } : {}) };
}

function validateDraft(draft: unknown): ComboDraft {
  const parsed = comboDraftSchema.safeParse(draft);
  if (!parsed.success) throw new ValidationError(describeIssues(parsed.error));
  const value = parsed.data;
  // Keep the notation byte-for-byte (zod's trim must not touch it).
  const notation = (draft as { notation: string }).notation;
  const { damage, ...rest } = value;
  return normalizeCombo({ ...rest, notation, ...(damage !== undefined ? { damage } : {}) });
}

export interface RepositoryDeps {
  now?: () => Date;
  newId?: () => string;
}

export function createDexieRepository(db: InputLabDatabase = new InputLabDatabase(), deps: RepositoryDeps = {}): ComboRepository {
  const now = () => (deps.now ?? (() => new Date()))().toISOString();
  const newId = deps.newId ?? (() => crypto.randomUUID());

  async function getOrThrow(id: string): Promise<Combo> {
    const found = await db.combos.get(id);
    if (!found) throw new NotFoundError(id);
    return found;
  }

  return {
    async findAll() {
      const all = await db.combos.orderBy('updatedAt').reverse().toArray();
      return all;
    },
    async findById(id) {
      return (await db.combos.get(id)) ?? null;
    },
    async create(draft) {
      const valid = validateDraft(draft);
      const stamp = now();
      const combo: Combo = { ...valid, id: newId(), createdAt: stamp, updatedAt: stamp };
      await db.combos.add(combo);
      return combo;
    },
    async update(id, changes) {
      const current = await getOrThrow(id);
      const { id: _id, createdAt, updatedAt: _u, ...editable } = current;
      void _id;
      void _u;
      const valid = validateDraft({ ...editable, ...changes });
      const next: Combo = { ...valid, id, createdAt, updatedAt: now() };
      await db.combos.put(next);
      return next;
    },
    async setFavorite(id, favorite) {
      const changed = await db.combos.update(id, { favorite });
      if (changed === 0 && !(await db.combos.get(id))) throw new NotFoundError(id);
    },
    async delete(id) {
      await db.combos.delete(id);
    },
    async duplicate(id) {
      const current = await getOrThrow(id);
      const { id: _id, createdAt: _c, updatedAt: _u, ...draft } = current;
      void _id;
      void _c;
      void _u;
      const base = current.name.slice(0, MAX_NAME - COPY_SUFFIX.length);
      return this.create({ ...draft, name: `${base}${COPY_SUFFIX}`, favorite: false });
    },
    async putMany(combos) {
      await db.combos.bulkPut([...combos]);
    },
    async clear() {
      await db.combos.clear();
    },
  };
}
