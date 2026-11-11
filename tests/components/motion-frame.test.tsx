// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandSequence } from '../../src/components/arcade/CommandSequence';
import { MotionFrameToggle } from '../../src/components/combos/MotionFrameToggle';
import { getMotionFrame, MOTION_FRAME_STORAGE_KEY, setMotionFrame } from '../../src/hooks/useMotionFrame';
import { parseNotation } from '../../src/parser';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const result = parseNotation('cd+4,1, ff+3', { game: 'ttt2' });

function frames(container: Element): number {
  return [...container.querySelectorAll('[aria-label="cd"], [aria-label="ff"]')].filter((icon) => icon.querySelector('rect')).length;
}

describe('motion frame rendering', () => {
  it('draws motions as bare arrows by default', () => {
    const { container } = render(<CommandSequence result={result} />);
    expect(container.querySelectorAll('[aria-label="cd"], [aria-label="ff"]')).toHaveLength(2);
    expect(frames(container)).toBe(0);
  });

  it('wraps every motion in a frame when requested', () => {
    const { container } = render(<CommandSequence result={result} motionFrame />);
    expect(frames(container)).toBe(2);
  });
});

describe('unframed motion arrow size', () => {
  const scaleOf = (el: Element | null | undefined) => Number(/scale\(([\d.]+)\)/.exec(el?.querySelector('g')?.getAttribute('transform') ?? '')?.[1]);

  it('draws motion arrows at the size of a plain direction input', () => {
    const { container } = render(<CommandSequence result={parseNotation('f+1, ff+3', { game: 'ttt2' })} size={40} />);
    const plain = container.querySelector('[data-node="input"] > [data-direction="f"]');
    const inMotion = container.querySelectorAll('[aria-label="ff"] [data-direction="f"]');
    expect(inMotion).toHaveLength(2);
    expect(scaleOf(inMotion[0])).toBeCloseTo(scaleOf(plain));
  });

  it('keeps small arrows inside the frame', () => {
    const { container } = render(<CommandSequence result={parseNotation('f+1, ff+3', { game: 'ttt2' })} size={40} motionFrame />);
    const plain = container.querySelector('[data-node="input"] > [data-direction="f"]');
    const inMotion = container.querySelector('[aria-label="ff"] [data-direction="f"]');
    expect(scaleOf(inMotion)).toBeLessThan(scaleOf(plain));
  });
});

describe('motion frame preference', () => {
  beforeEach(() => {
    localStorage.clear();
    act(() => setMotionFrame(false));
  });

  it('is off by default and remembered in localStorage', () => {
    expect(getMotionFrame()).toBe(false);
    act(() => setMotionFrame(true));
    expect(getMotionFrame()).toBe(true);
    expect(localStorage.getItem(MOTION_FRAME_STORAGE_KEY)).toBe('on');
  });

  it('keeps working when storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => act(() => setMotionFrame(true))).not.toThrow();
    expect(getMotionFrame()).toBe(true);
  });

  it('reads the stored value on load and ignores invalid values', async () => {
    localStorage.setItem(MOTION_FRAME_STORAGE_KEY, 'on');
    vi.resetModules();
    expect((await import('../../src/hooks/useMotionFrame')).getMotionFrame()).toBe(true);
    localStorage.setItem(MOTION_FRAME_STORAGE_KEY, 'maybe');
    vi.resetModules();
    expect((await import('../../src/hooks/useMotionFrame')).getMotionFrame()).toBe(false);
  });

  it('follows a change made in another tab', () => {
    render(<MotionFrameToggle />);
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: MOTION_FRAME_STORAGE_KEY, newValue: 'on' }));
    });
    expect(getMotionFrame()).toBe(true);
    expect(screen.getByRole('button', { name: 'Frame motions' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('MotionFrameToggle switches the shared preference for every display', () => {
    render(
      <>
        <MotionFrameToggle />
        <MotionFrameToggle />
      </>,
    );
    const [first, second] = screen.getAllByRole('button', { name: 'Frame motions' });
    expect(first?.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(first!);
    expect(getMotionFrame()).toBe(true);
    expect(second?.getAttribute('aria-pressed')).toBe('true');
  });
});
