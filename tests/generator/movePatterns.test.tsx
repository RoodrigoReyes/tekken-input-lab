// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MovePatterns } from '../../src/features/generator/MovePatterns';
import type { CharacterPatterns } from '../../src/ttt2/movePatterns';

afterEach(cleanup);

const patterns: CharacterPatterns = {
  starters: [{ move: 'df+2', key: 'df2', count: 3 }],
  bounds: [{ move: 'b+4,3', key: 'b4,3', count: 5 }],
  juggles: [{ move: 'b+1 > WS+1,2 > b+4,3', key: 'j', count: 2 }],
  moves: [{ move: 'df+2', key: 'df2', count: 3 }],
};

describe('MovePatterns', () => {
  it('searches by picking a move option or a pattern chip, and toggles the chip off', () => {
    const onMove = vi.fn();
    const { rerender } = render(<MovePatterns character="Alisa" patterns={patterns} move="" onMove={onMove} />);
    const select = screen.getByLabelText('Move landed') as HTMLSelectElement;
    expect([...select.options].map((o) => o.value)).toEqual(['', 'df+2']);
    fireEvent.change(select, { target: { value: 'df+2' } });
    expect(onMove).toHaveBeenLastCalledWith('df+2');
    fireEvent.click(screen.getByRole('button', { name: 'b+4,3 ×5' }));
    expect(onMove).toHaveBeenLastCalledWith('b+4,3');
    rerender(<MovePatterns character="Alisa" patterns={patterns} move="d/f+2" onMove={onMove} />);
    const starter = screen.getByRole('button', { name: 'df+2 ×3' });
    expect(starter.getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(starter);
    expect(onMove).toHaveBeenLastCalledWith('');
    expect(screen.getByText('b+1 > WS 1,2 > b+4,3 ×2')).toBeTruthy();
  });
});
