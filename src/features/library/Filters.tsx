import { useEffect, useId, useState } from 'react';
import { liveQuery } from 'dexie';
import { Button } from '../../components/ui/Button';
import { GAMES, getGame } from '../../notation/games';
import { DIFFICULTIES } from '../../types/combo';
import type { GameId } from '../../types/notation';
import type { Combo } from '../../types/combo';
import { useRepository } from '../../hooks/useCombos';
import { ToggleChip } from '../../components/ui/Chip';
import { ComboBox, CONTROL, Select } from '../../components/ui/Field';
import { Panel } from '../../components/ui/Panel';
import { collectLaunchers, EMPTY_FILTERS, type LibraryFilters } from './filters';

export interface FiltersProps {
  value: LibraryFilters;
  onChange: (f: LibraryFilters) => void;
  characters: readonly string[];
  partners: readonly string[];
  tags: readonly string[];
  /** "12 of 40 combos", shown when the library is not empty. */
  count?: { visible: number; total: number };
}

export function hasActiveFilters(value: LibraryFilters): boolean {
  return JSON.stringify(value) !== JSON.stringify(EMPTY_FILTERS);
}

const SearchIcon = () => (
  <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 fill-fg-muted">
    <path d="M8.5 3a5.5 5.5 0 0 1 4.38 8.83l3.65 3.64a.75.75 0 1 1-1.06 1.06l-3.64-3.65A5.5 5.5 0 1 1 8.5 3zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
  </svg>
);

export function Filters({ value, onChange, characters, partners, tags, count }: FiltersProps) {
  const repository = useRepository();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [launchersError, setLaunchersError] = useState(false);
  useEffect(() => {
    const subscription = liveQuery(() => repository.findAll()).subscribe({
      next: (results) => { setCombos(results); setLaunchersError(false); },
      error: () => setLaunchersError(true),
    });
    return () => subscription.unsubscribe();
  }, [repository]);
  const set = <K extends keyof LibraryFilters>(key: K, v: LibraryFilters[K]) => onChange({ ...value, [key]: v });
  const roster = value.game === 'all' ? characters : [...new Set([...characters, ...getGame(value.game).roster])].sort();
  const showPartner = value.game === 'all' || value.game === 'ttt2';
  const active = hasActiveFilters(value);
  const [more, setMore] = useState(false);
  const panelId = useId();
  const games: ReadonlyArray<[GameId | 'all', string]> = [['all', 'All'], ...GAMES.map((g): [GameId, string] => [g.id, g.shortName])];

  // Filters folded behind the "Filters" button; the count on it says how many are on.
  const folded = [value.favoritesOnly, value.character, value.partner, value.difficulty !== 'all', value.launcher, value.position !== 'all', ...value.tags].filter(Boolean).length;
  const launchers = collectLaunchers(combos, value);

  return (
    <Panel aria-label="Filters" className="flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <SearchIcon />
          <input
            type="search"
            className={`${CONTROL} pl-10`}
            placeholder="Search by name, notation (e.g. EWGF, B!) or tag…"
            value={value.query}
            onChange={(e) => set('query', e.target.value)}
            aria-label="Search combos"
          />
        </div>
        <Button aria-expanded={more} aria-controls={panelId} onClick={() => setMore(!more)} className="h-auto! min-h-11">
          Filters{folded > 0 && ` · ${folded}`}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div role="group" aria-label="Game" className="flex gap-1 overflow-x-auto">
          {games.map(([id, label]) => (
            <ToggleChip key={id} active={value.game === id} onClick={() => set('game', id)} title={id === 'all' ? 'All games' : getGame(id).name}>
              {label}
            </ToggleChip>
          ))}
        </div>
        {active && (
          <button type="button" className="label-md inline-flex min-h-7 items-center text-fg-muted underline underline-offset-4 hover:text-fg pointer-coarse:min-h-11" onClick={() => onChange(EMPTY_FILTERS)}>
            Clear filters
          </button>
        )}
        {count && (
          <p className="label-sm ml-auto text-fg-muted" role="status">
            {`${count.visible} of ${count.total} combos`}
          </p>
        )}
      </div>

      <div id={panelId} hidden={!more} className="flex flex-col gap-3 border-t border-line-strong pt-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <ComboBox id="filter-character" aria-label="Character" placeholder="Any character" options={roster} value={value.character} onChange={(e) => set('character', e.target.value)} />
          {showPartner && (
            <ComboBox id="filter-partner" aria-label="Partner" placeholder="Any partner (TTT2)" options={partners} value={value.partner} onChange={(e) => set('partner', e.target.value)} />
          )}
          <Select aria-label="Difficulty" value={value.difficulty} onChange={(e) => set('difficulty', e.target.value as LibraryFilters['difficulty'])}>
            <option value="all">Any difficulty</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {(d === 'beginner' ? 'Beginner' : d === 'intermediate' ? 'Intermediate' : 'Advanced')}
              </option>
            ))}
          </Select>
          <Select aria-label="Launcher" value={value.launcher} onChange={(e) => set('launcher', e.target.value)} disabled={launchersError}>
            <option value="">{launchersError ? 'Launchers unavailable' : 'Any launcher'}</option>
            {value.launcher && !launchers.includes(value.launcher) && <option value={value.launcher} disabled>{value.launcher}</option>}
            {launchers.map((launcher) => <option key={launcher} value={launcher}>{launcher}</option>)}
          </Select>
          <Select aria-label="Position" value={value.position} onChange={(e) => set('position', e.target.value as LibraryFilters['position'])}>
            <option value="all">Any position</option>
            <option value="open">Open</option>
            <option value="wall">Wall</option>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <ToggleChip active={value.favoritesOnly} onClick={() => set('favoritesOnly', !value.favoritesOnly)}>
            ★ Favorites only
          </ToggleChip>
          {tags.map((tag) => {
            const on = value.tags.includes(tag);
            return (
              <ToggleChip key={tag} active={on} onClick={() => set('tags', on ? value.tags.filter((t) => t !== tag) : [...value.tags, tag])}>
                #{tag}
              </ToggleChip>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
