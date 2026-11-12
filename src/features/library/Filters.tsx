import { GAMES, getGame } from '../../notation/games';
import { DIFFICULTIES } from '../../types/combo';
import type { GameId } from '../../types/notation';
import { ToggleChip } from '../../components/ui/Chip';
import { ComboBox, CONTROL, Select } from '../../components/ui/Field';
import { Panel } from '../../components/ui/Panel';
import { EMPTY_FILTERS, type LibraryFilters } from './filters';

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
  const set = <K extends keyof LibraryFilters>(key: K, v: LibraryFilters[K]) => onChange({ ...value, [key]: v });
  const roster = value.game === 'all' ? characters : [...new Set([...characters, ...getGame(value.game).roster])].sort();
  const showPartner = value.game === 'all' || value.game === 'ttt2';
  const active = hasActiveFilters(value);
  const games: ReadonlyArray<[GameId | 'all', string]> = [['all', 'All'], ...GAMES.map((g): [GameId, string] => [g.id, g.shortName])];

  return (
    <Panel aria-label="Filters" className="flex flex-col gap-4 p-4">
      <div className="relative">
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

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Game" className="flex flex-wrap gap-1">
          {games.map(([id, label]) => (
            <ToggleChip key={id} active={value.game === id} onClick={() => set('game', id)} title={id === 'all' ? 'All games' : getGame(id).name}>
              {label}
            </ToggleChip>
          ))}
        </div>
        <ToggleChip active={value.favoritesOnly} onClick={() => set('favoritesOnly', !value.favoritesOnly)}>
          ★ Favorites only
        </ToggleChip>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ComboBox id="filter-character" aria-label="Character" placeholder="Any character" options={roster} value={value.character} onChange={(e) => set('character', e.target.value)} />
        {showPartner ? (
          <ComboBox id="filter-partner" aria-label="Partner" placeholder="Any partner (TTT2)" options={partners} value={value.partner} onChange={(e) => set('partner', e.target.value)} />
        ) : (
          <div className="hidden sm:block" />
        )}
        <Select aria-label="Difficulty" value={value.difficulty} onChange={(e) => set('difficulty', e.target.value as LibraryFilters['difficulty'])}>
          <option value="all">Any difficulty</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d[0]?.toUpperCase() + d.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      {(tags.length > 0 || active || count) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => {
            const on = value.tags.includes(tag);
            return (
              <ToggleChip key={tag} active={on} onClick={() => set('tags', on ? value.tags.filter((t) => t !== tag) : [...value.tags, tag])}>
                #{tag}
              </ToggleChip>
            );
          })}
          {active && (
            <button type="button" className="label-md ml-1 inline-flex min-h-7 items-center text-fg-muted underline underline-offset-4 hover:text-fg pointer-coarse:min-h-11" onClick={() => onChange(EMPTY_FILTERS)}>
              Clear filters
            </button>
          )}
          {count && (
            <p className="label-sm ml-auto text-fg-muted" role="status">
              {count.visible} of {count.total} combos
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}
