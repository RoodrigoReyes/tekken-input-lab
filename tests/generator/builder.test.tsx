// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComboBuilder } from '../../src/features/generator/ComboBuilder';
import { PhaseCard } from '../../src/features/generator/PhaseCard';
import { bestPick, collectPieces } from '../../src/ttt2/generator';
import { importGuide } from '../../src/ttt2/guideImporter';
import text from '../ttt2/fixtures/guide-excerpt.md?raw';

afterEach(cleanup);

const options = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
  { id: 'c', label: 'C' },
];

describe('PhaseCard', () => {
  it('labels the dropdown with the phase name and shows the position', () => {
    render(<PhaseCard step={2} title="TA filler" performer="Nina" options={options} value="b" onChange={() => {}} info={[]} />);
    expect((screen.getByLabelText('TA filler') as HTMLSelectElement).value).toBe('b');
    expect(screen.getByText('Nina · 2/3')).toBeTruthy();
  });

  it('steps through the options and wraps around', () => {
    const onChange = vi.fn();
    render(<PhaseCard step={3} title="Ender" performer="Kazuya" options={options} value="c" onChange={onChange} info={[]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Next ender' }));
    expect(onChange).toHaveBeenLastCalledWith('a');
    fireEvent.click(screen.getByRole('button', { name: 'Previous ender' }));
    expect(onChange).toHaveBeenLastCalledWith('b');
  });

  it('disables the steppers when there is a single option', () => {
    render(<PhaseCard step={1} title="Route" performer="Nina" options={[options[0]!]} value="a" onChange={() => {}} info={[]} />);
    expect((screen.getByRole('button', { name: 'Next route' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('shows the info lines, warnings marked', () => {
    render(<PhaseCard step={1} title="Route" performer="Nina" options={options} value="a" onChange={() => {}} info={[{ label: 'When', value: 'Normal hit' }, { label: 'Note', value: 'Delay it', tone: 'warning' }]} />);
    const about = screen.getByLabelText('About this route');
    expect(within(about).getByText('Normal hit')).toBeTruthy();
    expect(within(about).getByText('Delay it').className).toMatch(/text-warning/);
  });
});

describe('ComboBuilder', () => {
  const library = importGuide(text, 'excerpt');
  const pools = collectPieces(library, { point: 'Kazuya', partner: 'Nina', context: 'open', routeKinds: ['normal', 'counterHit', 'lowParry'], fillerBy: 'partner', enderBy: 'point' })!;
  const pick = bestPick(pools)!;

  it('renders the three phases with their performers', () => {
    render(<ComboBuilder pools={pools} pick={pick} onPick={() => {}} />);
    expect(screen.getByRole('region', { name: 'Phase 1: Route' })).toBeTruthy();
    expect(within(screen.getByRole('region', { name: 'Phase 2: TA filler' })).getByText(/^Nina · \d+\/\d+$/)).toBeTruthy();
    expect(within(screen.getByRole('region', { name: 'Phase 3: Ender' })).getByText(/^Kazuya · \d+\/\d+$/)).toBeTruthy();
  });

  it('groups routes by kind and reports the chosen piece', () => {
    const onPick = vi.fn();
    render(<ComboBuilder pools={pools} pick={pick} onPick={onPick} />);
    const route = screen.getByLabelText('Route') as HTMLSelectElement;
    expect(route.querySelector('optgroup')?.getAttribute('label')).toBe('Normal');
    const other = pools.fillers.find((f) => f.piece.id !== pick.fillerId)!;
    fireEvent.change(screen.getByLabelText('TA filler'), { target: { value: other.piece.id } });
    expect(onPick).toHaveBeenCalledWith({ fillerId: other.piece.id });
  });
});

it('lets the player mark a suggested ender as tested', () => {
  const library = importGuide(text, 'excerpt');
  const pools = collectPieces(library, { point: 'Kazuya', partner: 'Nina', context: 'open', routeKinds: ['normal'], fillerBy: 'partner', enderBy: 'point', verifiedEnders: [{ character: 'Kazuya', form: 'Kazuya', notation: 'd/f+1,2' }] })!;
  const ender = pools.enders.find((e) => e.piece.notation === 'd/f+1,2')!;
  const onVerify = vi.fn();
  render(<ComboBuilder pools={pools} pick={{ ...bestPick(pools)!, enderId: ender.piece.id }} onPick={() => {}} verified onVerify={onVerify} />);
  const checkbox = screen.getByRole('checkbox', { name: 'I tested this ender' }) as HTMLInputElement;
  expect(checkbox.checked).toBe(true);
  fireEvent.click(checkbox);
  expect(onVerify).toHaveBeenCalledWith(false);
});
