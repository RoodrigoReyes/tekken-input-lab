// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandSequence } from '../../src/components/arcade/CommandSequence';
import { directionAngle } from '../../src/components/arcade/DirectionIcon';
import { SideToggle } from '../../src/components/combos/SideToggle';
import { getPlayerSide, setPlayerSide, SIDE_STORAGE_KEY } from '../../src/hooks/usePlayerSide';
import { parseNotation } from '../../src/parser';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/** Rotation applied to the arrow of the first [data-direction] icon matching `dir`. */
function rotations(container: Element, dir: string): number[] {
  return [...container.querySelectorAll(`[data-direction="${dir}"] > g`)].map((g) => Number(/rotate\((-?[\d.]+)/.exec(g.getAttribute('transform') ?? '')?.[1]));
}

describe('directionAngle', () => {
  it('points forward to the right on the 1P side', () => {
    expect(directionAngle('f', 'left')).toBe(0);
    expect(directionAngle('df', 'left')).toBe(45);
    expect(directionAngle('ub', 'left')).toBe(225);
  });

  it('mirrors forward/back on the 2P side and keeps up/down', () => {
    expect(directionAngle('f', 'right')).toBe(180);
    expect(directionAngle('b', 'right')).toBe(0);
    expect(directionAngle('df', 'right')).toBe(135);
    expect(directionAngle('db', 'right')).toBe(45);
    expect(directionAngle('uf', 'right')).toBe(225);
    expect(directionAngle('ub', 'right')).toBe(315);
    expect(directionAngle('d', 'right')).toBe(90);
    expect(directionAngle('u', 'right')).toBe(270);
  });
});

describe('CommandSequence side', () => {
  const result = parseNotation('df+1, qcf+2, b+3', { game: 't8' });

  it('draws 1P arrows by default', () => {
    const { container } = render(<CommandSequence result={result} />);
    expect(container.querySelector('svg')?.getAttribute('data-side')).toBe('left');
    expect(rotations(container, 'df')).toEqual([45, 45]);
  });

  it('mirrors every arrow on the 2P side, motions included, without changing the notation', () => {
    const { container } = render(<CommandSequence result={result} side="right" />);
    expect(container.querySelector('svg')?.getAttribute('data-side')).toBe('right');
    // df+1 and the df inside qcf both point down-left now.
    expect(rotations(container, 'df')).toEqual([135, 135]);
    expect(rotations(container, 'f')).toEqual([180]);
    expect(rotations(container, 'b')).toEqual([0]);
    expect(rotations(container, 'd')).toEqual([90]);
    // Accessible names stay in notation terms.
    expect(container.querySelector('[data-direction="df"]')?.getAttribute('aria-label')).toBe('df');
  });
});

describe('player side preference', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => setPlayerSide('left'));
  });

  it('is remembered in localStorage', () => {
    act(() => setPlayerSide('right'));
    expect(getPlayerSide()).toBe('right');
    expect(localStorage.getItem(SIDE_STORAGE_KEY)).toBe('right');
  });

  it('keeps working when storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => act(() => setPlayerSide('right'))).not.toThrow();
    expect(getPlayerSide()).toBe('right');
  });

  it('reads a stored side on load and ignores invalid values', async () => {
    localStorage.setItem(SIDE_STORAGE_KEY, 'right');
    vi.resetModules();
    expect((await import('../../src/hooks/usePlayerSide')).getPlayerSide()).toBe('right');
    localStorage.setItem(SIDE_STORAGE_KEY, 'sideways');
    vi.resetModules();
    expect((await import('../../src/hooks/usePlayerSide')).getPlayerSide()).toBe('left');
  });

  it('follows a change made in another tab', () => {
    render(<SideToggle />);
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: SIDE_STORAGE_KEY, newValue: 'right' }));
    });
    expect(getPlayerSide()).toBe('right');
    expect(screen.getByRole('radio', { checked: true }).textContent).toMatch(/2P/);
  });

  it('SideToggle switches the shared side for every display', () => {
    render(
      <>
        <SideToggle />
        <SideToggle />
      </>,
    );
    const [first, second] = screen.getAllByRole('radiogroup', { name: 'Player side' });
    fireEvent.click(first!.querySelector('[role="radio"]:last-child')!);
    expect(getPlayerSide()).toBe('right');
    expect(second!.querySelector('[aria-checked="true"]')?.textContent).toMatch(/2P/);
  });
});
