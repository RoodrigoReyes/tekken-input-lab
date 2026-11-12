// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Collapsible } from '../../src/components/ui/Collapsible';
import { SECTION_STORAGE_PREFIX } from '../../src/hooks/useSectionOpen';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => localStorage.clear());

describe('Collapsible', () => {
  it('is closed by default and keeps its content mounted but hidden', () => {
    render(
      <Collapsible title="Advanced">
        <input aria-label="inner" defaultValue="kept" />
      </Collapsible>,
    );
    const toggle = screen.getByRole('button', { name: /advanced/i });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByLabelText('inner', { selector: 'input' }).closest('[hidden]')).not.toBeNull();
  });

  it('opens and closes on click', () => {
    render(
      <Collapsible title="Advanced">
        <p>Body</p>
      </Collapsible>,
    );
    const toggle = screen.getByRole('button', { name: /advanced/i });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Body').closest('[hidden]')).toBeNull();
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('respects defaultOpen and shows the summary only while closed', () => {
    render(
      <Collapsible title="Team" summary="Kazuya → Nina" defaultOpen>
        <p>Body</p>
      </Collapsible>,
    );
    expect(screen.queryByText('Kazuya → Nina')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /team/i }));
    expect(screen.getByText('Kazuya → Nina')).toBeTruthy();
  });

  it('links the toggle to its region', () => {
    render(
      <Collapsible title="Notes" defaultOpen>
        <p>Body</p>
      </Collapsible>,
    );
    const toggle = screen.getByRole('button', { name: /notes/i });
    const region = document.getElementById(toggle.getAttribute('aria-controls') ?? '');
    expect(region?.textContent).toBe('Body');
  });

  it('remembers the open state under its storage key', () => {
    const { unmount } = render(
      <Collapsible title="Tags" storageKey="test-tags">
        <p>Body</p>
      </Collapsible>,
    );
    fireEvent.click(screen.getByRole('button', { name: /tags/i }));
    expect(localStorage.getItem(`${SECTION_STORAGE_PREFIX}test-tags`)).toBe('open');
    unmount();
    render(
      <Collapsible title="Tags" storageKey="test-tags">
        <p>Body</p>
      </Collapsible>,
    );
    expect(screen.getByRole('button', { name: /tags/i }).getAttribute('aria-expanded')).toBe('true');
  });

  it('still toggles when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    render(
      <Collapsible title="Blocked" storageKey="test-blocked">
        <p>Body</p>
      </Collapsible>,
    );
    const toggle = screen.getByRole('button', { name: /blocked/i });
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });
});
