// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MerlinView } from '../../src/features/explore/MerlinView';
import { RepositoryProvider } from '../../src/hooks/useCombos';
import type { ComboRepository } from '../../src/storage/comboRepository';

afterEach(cleanup);

it('assembles only selected pieces and saves the selected route with credit', async () => {
  const create = vi.fn().mockResolvedValue(undefined);
  render(<RepositoryProvider repository={{ create } as unknown as ComboRepository}><MerlinView /></RepositoryProvider>);
  fireEvent.change(await screen.findByLabelText('Character'), { target: { value: 'Kazuya' } });
  const section = screen.getByRole('heading', { name: 'Combo routes' }).parentElement!;
  // The first group's only launcher is picked by default, but nothing is savable until a route is chosen.
  expect((within(section).getByRole('button', { name: 'Save to library' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(within(section).getByLabelText('Launcher group'), { target: { value: '0' } });
  expect(within(within(section).getByRole('group', { name: 'Launcher' })).getAllByRole('radio').map((r) => (r as HTMLInputElement).checked)).toEqual([true]);
  const route = within(section).getByRole('radio', { name: /DEWGF - df\+3/ });
  fireEvent.click(route);
  expect((within(section).getByRole('button', { name: 'Save to library' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(within(section).getByRole('radio', { name: /CD4,1/ }));
  expect(within(section).getByText('Assembled combo')).toBeTruthy();
  fireEvent.click(within(section).getByRole('button', { name: 'Save to library' }));
  await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ game: 't6', character: 'Kazuya', notes: expect.stringContaining("From Merlin's Tekken 6 Combo Library (@Merlin_FGC):") })));
});

it('only offers marked routes for marked launchers', async () => {
  render(<RepositoryProvider repository={{ create: vi.fn() } as unknown as ComboRepository}><MerlinView /></RepositoryProvider>);
  fireEvent.change(await screen.findByLabelText('Character'), { target: { value: 'Baek' } });
  const section = screen.getByRole('heading', { name: 'Combo routes' }).parentElement!;
  const group = within(section).getByLabelText('Launcher group') as HTMLSelectElement;
  const option = [...group.options].find((o) => o.textContent?.includes('SS3+4 *'))!;
  fireEvent.change(group, { target: { value: option.value } });
  fireEvent.click(within(section).getByRole('radio', { name: /D\/f\+2/ }));
  expect(within(section).queryByRole('radio', { name: /FLA D\/b\+3,3/ })).toBeNull();
  fireEvent.click(within(section).getByRole('radio', { name: /SS3\+4/ }));
  expect(within(section).getByRole('radio', { name: /FLA D\/b\+3,3/ })).toBeTruthy();
});

it('saves only the selected guaranteed starter and follow-up', async () => {
  const create = vi.fn().mockResolvedValue(undefined);
  render(<RepositoryProvider repository={{ create } as unknown as ComboRepository}><MerlinView /></RepositoryProvider>);
  fireEvent.change(await screen.findByLabelText('Character'), { target: { value: 'Baek' } });
  const section = screen.getByRole('heading', { name: 'Guaranteed hits' }).parentElement!;
  const starterGroup = within(section).getAllByRole('group', { name: 'Starter' })[0]!;
  const card = starterGroup.parentElement!;
  const save = within(card).getByRole('button', { name: 'Save to library' }) as HTMLButtonElement;
  expect(save.disabled).toBe(true);
  fireEvent.click(within(starterGroup).getByRole('radio', { name: /CH f,F\+4/ }));
  expect(save.disabled).toBe(true);
  fireEvent.click(within(card).getByRole('radio', { name: /ff\+4/ }));
  fireEvent.click(save);
  await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ notation: 'CH f,F+4 > ff+4' })));
});
