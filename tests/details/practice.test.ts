import { describe, expect, it } from 'vitest';
import { navigateStage } from '../../src/features/details/practice';

describe('navigateStage', () => {
  it('moves between stages without crossing either boundary', () => {
    expect(navigateStage(0, 3, 'prev')).toBe(0);
    expect(navigateStage(0, 3, 'next')).toBe(1);
    expect(navigateStage(2, 3, 'next')).toBe(2);
    expect(navigateStage(2, 3, 'prev')).toBe(1);
  });

  it('resets to the first stage', () => {
    expect(navigateStage(2, 3, 'reset')).toBe(0);
  });

  it('stays at the first stage for a single-stage combo', () => {
    expect(navigateStage(0, 1, 'prev')).toBe(0);
    expect(navigateStage(0, 1, 'next')).toBe(0);
    expect(navigateStage(0, 1, 'reset')).toBe(0);
  });
});
