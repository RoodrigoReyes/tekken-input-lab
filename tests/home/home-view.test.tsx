// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HomeView } from '../../src/features/home/HomeView';
import { RepositoryProvider } from '../../src/hooks/useCombos';
import type { ComboRepository } from '../../src/storage/comboRepository';

afterEach(cleanup);

function repository(findAll: ComboRepository['findAll']): ComboRepository {
  const unused = vi.fn(() => Promise.reject(new Error('not used')));
  return { findAll, findById: unused, create: unused, update: unused, setFavorite: unused, delete: unused, duplicate: unused, putMany: unused, clear: unused };
}

describe('HomeView', () => {
  it('shows an error instead of "No combos yet" when the library cannot be read', async () => {
    render(
      <RepositoryProvider repository={repository(() => Promise.reject(new Error('IndexedDB is blocked')))}>
        <HomeView />
      </RepositoryProvider>,
    );
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toMatch(/IndexedDB is blocked/);
    expect(screen.queryByText(/No combos yet/)).toBeNull();
  });

  it('shows the empty state when the library is really empty', async () => {
    render(
      <RepositoryProvider repository={repository(() => Promise.resolve([]))}>
        <HomeView />
      </RepositoryProvider>,
    );
    expect(await screen.findByText(/No combos yet/)).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
