import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDexieRepository, NotFoundError, ValidationError, type ComboRepository } from '../../src/storage/comboRepository';
import { InputLabDatabase } from '../../src/storage/db';
import type { ComboDraft } from '../../src/types/combo';

const draft = (overrides: Partial<ComboDraft> = {}): ComboDraft => ({
  game: 'ttt2',
  character: 'Kazuya',
  partner: 'Armor King',
  name: 'Wall carry',
  notation: 'EWGF, EWGF, df+1,2~5 ; 3+4,2 ; cd+3 W!',
  dialect: 'standard',
  sectionCharacters: [],
  tags: ['wall', 'bnb'],
  difficulty: 'intermediate',
  damage: 72,
  notes: '',
  favorite: false,
  ...overrides,
});

let db: InputLabDatabase;
let repo: ComboRepository;
let clock = 0;
let ids = 0;

beforeEach(async () => {
  db = new InputLabDatabase(`test-${Math.random()}`);
  clock = Date.UTC(2026, 0, 1);
  ids = 0;
  repo = createDexieRepository(db, { now: () => new Date((clock += 1000)), newId: () => `id-${++ids}` });
});

afterEach(async () => {
  await db.delete();
});

describe('ComboRepository (Dexie)', () => {
  it('creates combos with ids and timestamps', async () => {
    const c = await repo.create(draft());
    expect(c.id).toBe('id-1');
    expect(c.createdAt).toBe(c.updatedAt);
    expect(await repo.findById('id-1')).toEqual(c);
  });

  it('preserves the original notation byte-for-byte after saving and loading', async () => {
    const notation = '  qcf+1 >  uf+2,1 B!\n\tSSL 1~b~↗+4   ; Armor King:  d/f+1,2~5 (note) ';
    const c = await repo.create(draft({ notation }));
    const fresh = createDexieRepository(new InputLabDatabase(db.name));
    expect((await fresh.findById(c.id))?.notation).toBe(notation);
  });

  it('lists newest first', async () => {
    await repo.create(draft({ name: 'A' }));
    await repo.create(draft({ name: 'B' }));
    expect((await repo.findAll()).map((c) => c.name)).toEqual(['B', 'A']);
  });

  it('updates fields and bumps updatedAt only', async () => {
    const c = await repo.create(draft());
    const u = await repo.update(c.id, { name: 'Renamed', favorite: true });
    expect(u.name).toBe('Renamed');
    expect(u.favorite).toBe(true);
    expect(u.createdAt).toBe(c.createdAt);
    expect(u.updatedAt > c.updatedAt).toBe(true);
    expect(u.notation).toBe(c.notation);
  });

  it('duplicates as a new, non-favorite copy', async () => {
    const c = await repo.create(draft({ favorite: true }));
    const d = await repo.duplicate(c.id);
    expect(d.id).not.toBe(c.id);
    expect(d.name).toBe('Wall carry (copy)');
    expect(d.favorite).toBe(false);
    expect(d.notation).toBe(c.notation);
  });

  it('deletes', async () => {
    const c = await repo.create(draft());
    await repo.delete(c.id);
    expect(await repo.findById(c.id)).toBeNull();
  });

  it('rejects invalid drafts with a readable message', async () => {
    await expect(repo.create(draft({ name: '  ' }))).rejects.toBeInstanceOf(ValidationError);
    await expect(repo.create(draft({ notation: '   ' }))).rejects.toThrow(/Notation is required/);
    await expect(repo.create({ ...draft(), game: 't5' } as unknown as ComboDraft)).rejects.toBeInstanceOf(ValidationError);
  });

  it('drops the partner outside TTT2 and dedupes tags', async () => {
    const c = await repo.create(draft({ game: 't8', tags: ['a', 'a', 'b'] }));
    expect(c.partner).toBeUndefined();
    expect(c.tags).toEqual(['a', 'b']);
  });

  it('missing ids raise NotFoundError', async () => {
    await expect(repo.update('nope', { name: 'x' })).rejects.toBeInstanceOf(NotFoundError);
    await expect(repo.duplicate('nope')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('putMany upserts and clear empties', async () => {
    const c = await repo.create(draft());
    await repo.putMany([{ ...c, name: 'Imported' }, { ...c, id: 'other' }]);
    expect((await repo.findAll()).map((x) => x.name).sort()).toEqual(['Imported', 'Wall carry']);
    await repo.clear();
    expect(await repo.findAll()).toEqual([]);
  });
});
