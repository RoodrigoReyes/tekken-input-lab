import { useMemo, useState } from 'react';
import { LinkButton } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { errorMessage, useCombos, useRepository } from '../../hooks/useCombos';
import { paths } from '../../hooks/useHashRoute';
import type { Combo } from '../../types/combo';
import { BackupActions } from './BackupActions';
import { ComboCard } from './ComboCard';
import { Filters } from './Filters';
import { collectCharacters, collectPartners, collectTags, EMPTY_FILTERS, filterCombos, type LibraryFilters } from './filters';

export function LibraryView() {
  const repo = useRepository();
  const toast = useToast();
  const { data: combos, loading, error, reload } = useCombos();
  const [filters, setFilters] = useState<LibraryFilters>(EMPTY_FILTERS);
  const visible = useMemo(() => filterCombos(combos, filters), [combos, filters]);

  const toggleFavorite = async (combo: Combo) => {
    try {
      await repo.setFavorite(combo.id, !combo.favorite);
      await reload();
    } catch (e) {
      toast(`Could not update favorite: ${errorMessage(e)}`, 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-extrabold">Combo Library</h1>
        <BackupActions onImported={reload} />
        <LinkButton href={paths.new()} variant="primary">
          + New combo
        </LinkButton>
      </div>
      <Filters
        value={filters}
        onChange={setFilters}
        characters={collectCharacters(combos)}
        partners={collectPartners(combos)}
        tags={collectTags(combos)}
      />
      {error && <p className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-200">{error}</p>}
      {loading ? (
        <p className="text-ink-400">Loading…</p>
      ) : combos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-700 p-10 text-center">
          <p className="text-lg font-semibold">No combos yet</p>
          <p className="mt-1 text-sm text-ink-400">Paste your first combo notation and see it as arcade commands.</p>
          <LinkButton href={paths.new()} variant="primary" className="mt-4">
            Create a combo
          </LinkButton>
        </div>
      ) : visible.length === 0 ? (
        <p className="text-ink-400">No combos match these filters.</p>
      ) : (
        <>
          <p className="text-xs text-ink-500">
            {visible.length} of {combos.length} combos
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {visible.map((c) => (
              <ComboCard key={c.id} combo={c} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
