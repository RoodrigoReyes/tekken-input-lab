// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { verifiedEnders } from '../../src/features/generator/verifiedEnders';

describe('verified enders', () => {
  it('stores the character, form and notation in browser storage', () => {
    const entries = [{ character: 'Kazuya', form: 'Kazuya', notation: 'd/f+1,2' }];
    verifiedEnders.set(entries);
    expect(JSON.parse(localStorage.getItem('ttt2-verified-enders')!)).toEqual(entries);
    verifiedEnders.set([]);
  });
});
