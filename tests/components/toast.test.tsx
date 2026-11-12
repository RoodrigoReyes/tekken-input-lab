// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast, type ToastTone } from '../../src/components/ui/Toast';

function Trigger({ message, tone }: { message: string; tone: ToastTone }) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast(message, tone)}>
      show
    </button>
  );
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('ToastProvider', () => {
  it('auto-dismisses success messages', () => {
    render(
      <ToastProvider>
        <Trigger message="Combo saved" tone="success" />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByText('Combo saved')).toBeTruthy();
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.queryByText('Combo saved')).toBeNull();
  });

  it('keeps errors on screen until the user dismisses them', () => {
    render(
      <ToastProvider>
        <Trigger message="Import failed: bad file" tone="error" />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('show'));
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByRole('alert').textContent).toContain('Import failed: bad file');
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByText('Import failed: bad file')).toBeNull();
  });

  it('keeps warnings (partial success) until dismissed, announced politely instead of as an alert', () => {
    render(
      <ToastProvider>
        <Trigger message="Import: 3 added, 1 invalid combo skipped" tone="warning" />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('show'));
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByRole('status').textContent).toContain('1 invalid combo skipped');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('does not stack a message that is already on screen, and shows at most three', () => {
    function Many() {
      const toast = useToast();
      return (
        <>
          <button type="button" onClick={() => toast('Could not update favorite', 'error')}>
            same
          </button>
          <button type="button" onClick={() => ['a', 'b', 'c', 'd'].forEach((m) => toast(`Error ${m}`, 'error'))}>
            four
          </button>
        </>
      );
    }
    render(
      <ToastProvider>
        <Many />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('same'));
    fireEvent.click(screen.getByText('same'));
    expect(screen.getAllByText('Could not update favorite')).toHaveLength(1);
    fireEvent.click(screen.getByText('four'));
    expect(screen.getAllByRole('alert').map((a) => a.textContent?.replace('×', ''))).toEqual(['Error b', 'Error c', 'Error d']);
  });
});
