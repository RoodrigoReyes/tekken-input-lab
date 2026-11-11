import { useMemo, useState } from 'react';
import { LogoMark } from '../../components/AppShell';
import { Button, LinkButton } from '../../components/ui/Button';
import { Eyebrow, PageTitle, Panel } from '../../components/ui/Panel';
import { useToast } from '../../components/ui/Toast';
import { errorMessage, useCombos, useRepository } from '../../hooks/useCombos';
import { paths } from '../../hooks/useHashRoute';
import type { Combo } from '../../types/combo';
import { BackupActions } from './BackupActions';
import { ComboCard } from './ComboCard';
import { Filters } from './Filters';
import { collectCharacters, collectPartners, collectTags, EMPTY_FILTERS, filterCombos, type LibraryFilters } from './filters';

function EmptyState({ title, body, action }: { title: string; body?: string; action: React.ReactNode }) {
  return (
    <Panel className="flex flex-col items-center gap-3 px-6 py-[58px] text-center">
      <LogoMark size={44} />
      <p className="font-condensed text-2xl font-bold uppercase">{title}</p>
      {body && <p className="max-w-md text-sm text-fg-muted">{body}</p>}
      <div className="mt-2">{action}</div>
    </Panel>
  );
}

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
    <div className="flex flex-col gap-4">
      <Panel as="div" className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="hidden size-14 shrink-0 items-center justify-center rounded-[4px] border border-line bg-neutral sm:flex">
            <LogoMark size={34} />
          </span>
          <div className="min-w-0 space-y-1">
            <Eyebrow>
              <span className="text-primary">Local library</span>
              <span aria-hidden>/</span>
              <span>Stored in this browser</span>
            </Eyebrow>
            <PageTitle>Combo Library</PageTitle>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <BackupActions onImported={reload} />
          <LinkButton href={paths.new()} variant="primary">
            + New combo
          </LinkButton>
        </div>
      </Panel>

      <Filters
        value={filters}
        onChange={setFilters}
        characters={collectCharacters(combos)}
        partners={collectPartners(combos)}
        tags={collectTags(combos)}
        count={!loading && combos.length > 0 ? { visible: visible.length, total: combos.length } : undefined}
      />

      {error && (
        <p role="alert" className="rounded-[4px] border border-danger bg-danger-surface p-3 text-sm text-fg">
          {error}
        </p>
      )}
      {loading ? (
        <p className="label-sm text-fg-muted">Loading…</p>
      ) : combos.length === 0 ? (
        <EmptyState
          title="No combos yet"
          body="Paste your first combo notation and see it as arcade commands."
          action={
            <LinkButton href={paths.new()} variant="primary">
              Create a combo
            </LinkButton>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No combos match these filters."
          action={
            <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visible.map((c) => (
            <ComboCard key={c.id} combo={c} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
