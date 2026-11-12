import { describe, expect, it } from 'vitest';
import { swapTeam } from '../../src/features/generator/teamSwap';

const base = {
  point: 'Kazuya',
  mate: 'Nina',
  pointForm: 'Devil Kazuya',
  partnerForm: '',
  starter: 'EWGF',
  fillerBy: 'partner' as const,
  enderBy: 'point' as const,
  context: 'wall' as const,
};

describe('swapTeam', () => {
  it('swaps point and teammate together with their forms', () => {
    const swapped = swapTeam(base);
    expect(swapped).toMatchObject({ point: 'Nina', mate: 'Kazuya', pointForm: '', partnerForm: 'Devil Kazuya' });
  });

  it('resets the starter (starters belong to the point character) and keeps every other option', () => {
    const swapped = swapTeam(base);
    expect(swapped.starter).toBe('');
    expect(swapped).toMatchObject({ fillerBy: 'partner', enderBy: 'point', context: 'wall' });
  });

  it('does not mutate the input and swapping twice restores the team', () => {
    const copy = { ...base };
    const twice = swapTeam(swapTeam(base));
    expect(base).toEqual(copy);
    expect(twice).toEqual({ ...base, starter: '' });
  });
});
