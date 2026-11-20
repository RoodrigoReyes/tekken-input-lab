import { describe, expect, it } from 'vitest';
import { decodeShareLink, encodeShareLink } from '../../src/features/share/shareLink';
import type { ComboDraft } from '../../src/types/combo';

const draft: ComboDraft = {
  game: 'ttt2', character: '仁', partner: 'Asuka', name: 'コンボ 🥊', notation: 'f+2,1', dialect: 'standard',
  sectionCharacters: ['仁', null, 'Asuka'], tags: ['練習'], difficulty: 'intermediate', damage: 64, notes: 'private', favorite: true,
};

describe('share links', () => {
  it('round trips unicode and section characters while omitting private fields', () => {
    const link = encodeShareLink(draft);
    expect(link).toMatch(/^#\/shared\?d=[A-Za-z0-9_-]+$/);
    expect(decodeShareLink(link.split('=')[1]!)).toEqual({ ok: true, draft: { ...draft, notes: '', favorite: false } });
  });

  it.each(['', '!', 'a', '_w', 'bm90IGpzb24', 'e30'])('rejects invalid payload %s', (payload) => {
    expect(decodeShareLink(payload).ok).toBe(false);
  });
});
