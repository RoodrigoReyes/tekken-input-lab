import { describe, expect, it } from 'vitest';
import { readBackup } from '../../src/storage/backup';
import { comboDraftSchema } from '../../src/storage/schema';
import { decodeShareLink, encodeShareLink } from '../../src/features/share/shareLink';

const draft = {
  game: 't8' as const, character: 'Jin', name: 'Combo', notation: 'f+2',
  dialect: 'standard', sectionCharacters: [], tags: [], difficulty: 'beginner' as const,
  notes: '', favorite: false,
};

describe('optional combo metadata', () => {
  it('accepts valid metadata and includes it in share links', () => {
    const value = { ...draft, hits: 0, position: 'wall' as const, videoUrl: 'https://example.com/video' };
    expect(comboDraftSchema.safeParse(value).success).toBe(true);
    expect(comboDraftSchema.safeParse({ ...value, hits: 999, position: 'open' }).success).toBe(true);
    expect(decodeShareLink(encodeShareLink(value).split('=')[1]!)).toEqual({ ok: true, draft: value });
  });

  it.each([
    { hits: -1 }, { hits: 1000 }, { hits: 1.5 }, { position: 'floor' },
    { videoUrl: 'http://example.com' }, { videoUrl: 'not a URL' },
    { videoUrl: `https://example.com/${'a'.repeat(500)}` },
  ])('rejects invalid metadata %o', (metadata) => {
    expect(comboDraftSchema.safeParse({ ...draft, ...metadata }).success).toBe(false);
  });

  it('reads a v1 backup created before metadata existed', () => {
    const combo = { ...draft, id: 'old', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
    const result = readBackup({ app: 'tekken-input-lab', schemaVersion: 1, exportedAt: combo.createdAt, combos: [combo] });
    expect(result).toEqual({ combos: [combo], skipped: [] });
  });
});
