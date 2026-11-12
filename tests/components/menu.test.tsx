// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Menu } from '../../src/components/ui/Menu';

afterEach(cleanup);

describe('Menu', () => {
  it('opens on click, runs an item and closes', () => {
    const onDuplicate = vi.fn();
    render(
      <Menu label="More">
        <button type="button" onClick={onDuplicate}>
          Duplicate
        </button>
      </Menu>,
    );
    const trigger = screen.getByRole('button', { name: 'More' });
    expect(screen.queryByRole('button', { name: 'Duplicate' })).toBeNull();
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }));
    expect(onDuplicate).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Duplicate' })).toBeNull();
  });

  it('closes on Escape (focus back on the trigger) and on a click outside', () => {
    render(
      <>
        <Menu label="Export">
          <button type="button">PNG</button>
        </Menu>
        <p>outside</p>
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('button', { name: 'PNG' })).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    fireEvent.pointerDown(screen.getByText('outside'));
    expect(screen.queryByRole('button', { name: 'PNG' })).toBeNull();
  });
});
