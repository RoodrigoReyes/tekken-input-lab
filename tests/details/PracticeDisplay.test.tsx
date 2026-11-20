// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PracticeDisplay } from '../../src/features/details/PracticeDisplay';
import { parseNotation } from '../../src/parser';

vi.mock('../../src/components/combos/ComboVisual', () => ({
  ArcadeDisplay: ({ activeStage }: { activeStage?: number }) => <div><input aria-label="Display input" /><span data-testid="active">{activeStage ?? 'off'}</span></div>,
}));
afterEach(cleanup);

function show(notation: string) {
  const parsed = { result: parseNotation(notation, { game: 't8' }), assignments: [], headers: undefined };
  return render(<PracticeDisplay parsed={parsed} visual={{ size: 40, expandNamed: false }} onVisualChange={() => {}} />);
}

it('navigates stages with buttons and keyboard, except in inputs', () => {
  show('1 > 2 > 3');
  fireEvent.click(screen.getByRole('button', { name: 'Practice' }));
  expect(screen.getByRole('status').textContent).toBe('Stage 1 of 3');
  fireEvent.click(screen.getByRole('button', { name: 'Next stage' }));
  expect(screen.getByTestId('active').textContent).toBe('1');
  fireEvent.keyDown(screen.getByLabelText('Display input'), { key: 'ArrowRight' });
  expect(screen.getByRole('status').textContent).toBe('Stage 2 of 3');
  fireEvent.keyDown(window, { key: 'ArrowRight' });
  expect(screen.getByRole('status').textContent).toBe('Stage 3 of 3');
  fireEvent.keyDown(window, { key: 'Home' });
  expect(screen.getByRole('status').textContent).toBe('Stage 1 of 3');
  fireEvent.click(screen.getByRole('button', { name: 'Practice' }));
  expect(screen.getByTestId('active').textContent).toBe('off');
});

it('hides practice for one stage', () => {
  show('1,2');
  expect(screen.queryByRole('button', { name: 'Practice' })).toBeNull();
});
