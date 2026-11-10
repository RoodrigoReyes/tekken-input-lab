import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { BackupError, createBackup, importBackup, parseBackupText, readBackup, serializeBackup } from '../../src/storage/backup';
import { createDexieRepository } from '../../src/storage/comboRepository';
import { InputLabDatabase } from '../../src/storage/db';
import type { Combo } from '../../src/types/combo';

const combo: Combo = {
  id: 'abc',
  game: 'ttt2',
  character: 'Kazuya',
  partner: 'Armor King',
  name: 'Tag wall',
  notation: '  EWGF, EWGF, df+1,2~5 ;\n Armor King:  3+4,2 ; cd+3 W!  ',
  dialect: 'kage-ttt2',
  sectionCharacters: [null, 'Armor King'],
  tags: ['wall'],
  difficulty: 'advanced',
  damage: 81,
  notes: 'note',
  favorite: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('JSON backup', () => {
  it('round-trips combos and keeps the notation byte-for-byte', () => {
    const text = serializeBackup(createBackup([combo], new Date('2026-03-01T00:00:00Z')));
    const result = parseBackupText(text);
    expect(result.skipped).toEqual([]);
    expect(result.combos).toEqual([combo]);
    expect(result.combos[0]?.notation).toBe(combo.notation);
  });

  it('writes a versioned envelope', () => {
    const b = createBackup([combo], new Date('2026-03-01T00:00:00Z'));
    expect(b).toMatchObject({ app: 'tekken-input-lab', schemaVersion: 1, exportedAt: '2026-03-01T00:00:00.000Z' });
  });

  it('skips invalid combos and reports why', () => {
    const data = { ...createBackup([combo]), combos: [combo, { ...combo, id: 'x', game: 't5' }, 42] };
    const r = readBackup(data);
    expect(r.combos.map((c) => c.id)).toEqual(['abc']);
    expect(r.skipped.map((s) => s.index)).toEqual([1, 2]);
  });

  it('refuses non-JSON, foreign files and newer schema versions', () => {
    expect(() => parseBackupText('{nope')).toThrow(BackupError);
    expect(() => readBackup({ hello: 1 })).toThrow(/not a TekkenInputLab backup/);
    expect(() => readBackup({ ...createBackup([]), app: 'other' })).toThrow(/Invalid backup/);
    expect(() => readBackup({ ...createBackup([]), schemaVersion: 99 })).toThrow(/newer version/);
    expect(() => readBackup(null)).toThrow(BackupError);
  });

  it('merges without losing newer local edits', async () => {
    const db = new InputLabDatabase(`backup-${Math.random()}`);
    const repo = createDexieRepository(db);
    const newerLocal = { ...combo, id: 'local-newer', name: 'Edited locally', updatedAt: '2026-05-01T00:00:00.000Z' };
    const olderLocal = { ...combo, id: 'local-older', name: 'Old local', updatedAt: '2025-01-01T00:00:00.000Z' };
    await repo.putMany([newerLocal, olderLocal]);
    const incoming = [
      { ...newerLocal, name: 'Stale backup copy', updatedAt: '2026-02-01T00:00:00.000Z' },
      { ...olderLocal, name: 'Fresh backup copy', updatedAt: '2026-02-01T00:00:00.000Z' },
      { ...combo, id: 'brand-new' },
    ];
    const summary = await importBackup(repo, readBackup(createBackup(incoming)));
    expect(summary).toEqual({ added: 1, updated: 1, keptLocal: 1 });
    expect((await repo.findById('local-newer'))?.name).toBe('Edited locally');
    expect((await repo.findById('local-older'))?.name).toBe('Fresh backup copy');
    expect((await repo.findById('brand-new'))?.notation).toBe(combo.notation);
    await db.delete();
  });

  it('normalizes imported combos like the editor does', () => {
    const r = readBackup(createBackup([{ ...combo, game: 't8', tags: ['a', 'a'] }]));
    expect(r.combos[0]?.partner).toBeUndefined();
    expect(r.combos[0]?.tags).toEqual(['a']);
  });

  it('caps the number of combos per file', () => {
    const many = Array.from({ length: 5001 }, (_, i) => ({ ...combo, id: `c${i}` }));
    expect(() => readBackup(createBackup(many))).toThrow(/limit is 5000/);
  });
});
