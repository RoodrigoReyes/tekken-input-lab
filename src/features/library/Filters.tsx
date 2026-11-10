import { GAMES, getGame } from '../../notation/games';
import { DIFFICULTIES } from '../../types/combo';
import type { GameId } from '../../types/notation';
import { ComboBox, Select, TextInput } from '../../components/ui/Field';
import { EMPTY_FILTERS, type LibraryFilters } from './filters';

export interface FiltersProps {
  value: LibraryFilters;
  onChange: (f: LibraryFilters) => void;
  characters: readonly string[];
  partners: readonly string[];
  tags: readonly string[];
}

export function Filters({ value, onChange, characters, partners, tags }: FiltersProps) {
  const set = <K extends keyof LibraryFilters>(key: K, v: LibraryFilters[K]) => onChange({ ...value, [key]: v });
  const roster = value.game === 'all' ? characters : [...new Set([...characters, ...getGame(value.game).roster])].sort();
  const showPartner = value.game === 'all' || value.game === 'ttt2';
  const active = JSON.stringify(value) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <section className="space-y-3 rounded-xl border border-ink-700 bg-ink-900 p-3" aria-label="Filters">
      <TextInput
        type="search"
        placeholder="Search by name, notation or tag…"
        value={value.query}
        onChange={(e) => set('query', e.target.value)}
        aria-label="Search combos"
      />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <Select aria-label="Game" value={value.game} onChange={(e) => set('game', e.target.value as GameId | 'all')}>
          <option value="all">All games</option>
          {GAMES.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </Select>
        <ComboBox id="filter-character" aria-label="Character" placeholder="Any character" options={roster} value={value.character} onChange={(e) => set('character', e.target.value)} />
        {showPartner && (
          <ComboBox id="filter-partner" aria-label="Partner" placeholder="Any partner (TTT2)" options={partners} value={value.partner} onChange={(e) => set('partner', e.target.value)} />
        )}
        <Select aria-label="Difficulty" value={value.difficulty} onChange={(e) => set('difficulty', e.target.value as LibraryFilters['difficulty'])}>
          <option value="all">Any difficulty</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d[0]?.toUpperCase() + d.slice(1)}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm">
          <input type="checkbox" className="accent-red-500" checked={value.favoritesOnly} onChange={(e) => set('favoritesOnly', e.target.checked)} />
          Favorites only
        </label>
      </div>
      {(tags.length > 0 || active) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => {
            const on = value.tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={on}
                onClick={() => set('tags', on ? value.tags.filter((t) => t !== tag) : [...value.tags, tag])}
                className={`rounded-md px-2 py-0.5 text-xs ${on ? 'bg-arcade text-white' : 'bg-ink-800 text-ink-200 hover:bg-ink-700'}`}
              >
                #{tag}
              </button>
            );
          })}
          {active && (
            <button type="button" className="ml-auto text-xs text-ink-400 underline hover:text-white" onClick={() => onChange(EMPTY_FILTERS)}>
              Clear filters
            </button>
          )}
        </div>
      )}
    </section>
  );
}
