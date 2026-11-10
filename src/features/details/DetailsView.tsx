import { useMemo, useRef, useState, type ReactNode } from 'react';
import { DiagnosticsList } from '../../components/combos/DiagnosticsList';
import { ComboVisual, DEFAULT_VISUAL, VisualControls } from '../../components/combos/ComboVisual';
import { DifficultyBadge, GameBadge } from '../../components/combos/GameBadge';
import { Button, LinkButton } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../components/ui/Toast';
import { errorMessage, useCombo, useRepository } from '../../hooks/useCombos';
import { paths } from '../../hooks/useHashRoute';
import { getDialect } from '../../notation/dialects';
import { getGame } from '../../notation/games';
import type { Combo } from '../../types/combo';
import { parseCombo, type ParsedCombo } from '../combo/parseCombo';
import type { VisualOptions } from '../../components/combos/ComboVisual';

export interface DetailsExtraProps {
  combo: Combo;
  parsed: ParsedCombo;
  visual: VisualOptions;
}

export function DetailsView({
  id,
  navigate,
  renderExtraActions,
}: {
  id: string;
  navigate: (hash: string) => void;
  /** Extra actions (export) injected by the app shell. */
  renderExtraActions?: (props: DetailsExtraProps) => ReactNode;
}) {
  const { data: combo, loading, error, reload } = useCombo(id);
  if (loading) return <p className="text-ink-400">Loading…</p>;
  if (error) return <p className="text-red-300">{error}</p>;
  if (!combo) {
    return (
      <div className="space-y-3">
        <p className="text-ink-400">This combo no longer exists.</p>
        <LinkButton href={paths.library()}>Back to library</LinkButton>
      </div>
    );
  }
  return <Details combo={combo} navigate={navigate} reload={reload} renderExtraActions={renderExtraActions} />;
}

function Details({
  combo,
  navigate,
  reload,
  renderExtraActions,
}: {
  combo: Combo;
  navigate: (hash: string) => void;
  reload: () => Promise<void>;
  renderExtraActions?: (props: DetailsExtraProps) => ReactNode;
}) {
  const repo = useRepository();
  const toast = useToast();
  const [visual, setVisual] = useState(DEFAULT_VISUAL);
  const [confirming, setConfirming] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const parsed = useMemo(() => parseCombo(combo), [combo]);
  const game = getGame(combo.game);

  const run = async (action: () => Promise<void>, failure: string) => {
    try {
      await action();
    } catch (e) {
      toast(`${failure}: ${errorMessage(e)}`, 'error');
    }
  };

  const copy = () =>
    run(async () => {
      await navigator.clipboard.writeText(combo.notation);
      toast('Notation copied', 'success');
    }, 'Could not copy');

  const duplicate = () =>
    run(async () => {
      const copyOf = await repo.duplicate(combo.id);
      toast('Combo duplicated', 'success');
      navigate(paths.details(copyOf.id));
    }, 'Could not duplicate');

  const remove = () =>
    run(async () => {
      await repo.delete(combo.id);
      setConfirming(false);
      toast('Combo deleted', 'success');
      navigate(paths.library());
    }, 'Could not delete');

  const toggleFavorite = () =>
    run(async () => {
      await repo.update(combo.id, { favorite: !combo.favorite });
      await reload();
    }, 'Could not update favorite');

  return (
    <article className="space-y-5">
      <header className="space-y-2">
        <a href={paths.library()} className="text-sm text-ink-400 hover:text-white">
          ← Library
        </a>
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold break-words">{combo.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-400">
              <GameBadge game={combo.game} />
              <span>{game.name}</span>
              <span className="text-ink-100">{[combo.character || 'No character', combo.partner].filter(Boolean).join(' + ')}</span>
              <DifficultyBadge difficulty={combo.difficulty} />
              {combo.damage !== undefined && <span>{combo.damage} damage</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleFavorite}
            aria-pressed={combo.favorite}
            aria-label={combo.favorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`text-2xl ${combo.favorite ? 'text-amber-400' : 'text-ink-500 hover:text-ink-200'}`}
          >
            {combo.favorite ? '★' : '☆'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={paths.edit(combo.id)} size="sm">
            Edit
          </LinkButton>
          <Button size="sm" onClick={duplicate}>
            Duplicate
          </Button>
          <Button size="sm" onClick={copy}>
            Copy notation
          </Button>
          {renderExtraActions?.({ combo, parsed, visual })}
          <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
            Delete
          </Button>
        </div>
      </header>

      <section className="space-y-2" aria-label="Commands">
        <div className="flex justify-end">
          <VisualControls value={visual} onChange={setVisual} />
        </div>
        <ComboVisual ref={svgRef} parsed={parsed} options={visual} />
        <DiagnosticsList diagnostics={parsed.result.diagnostics} notation={combo.notation} />
      </section>

      <section className="space-y-1">
        <h2 className="text-xs font-bold tracking-wide text-ink-400 uppercase">Original notation</h2>
        <pre className="overflow-x-auto rounded-lg border border-ink-700 bg-ink-900 p-3 font-mono text-sm whitespace-pre-wrap">{combo.notation}</pre>
        <p className="text-xs text-ink-500">Dialect: {getDialect(combo.dialect).name}</p>
      </section>

      {combo.tags.length > 0 && (
        <p className="flex flex-wrap gap-1.5">
          {combo.tags.map((t) => (
            <span key={t} className="rounded-md bg-ink-800 px-2 py-0.5 text-xs">
              #{t}
            </span>
          ))}
        </p>
      )}

      {combo.notes && (
        <section className="space-y-1">
          <h2 className="text-xs font-bold tracking-wide text-ink-400 uppercase">Notes</h2>
          <p className="text-sm whitespace-pre-wrap text-ink-200">{combo.notes}</p>
        </section>
      )}

      <p className="text-xs text-ink-500">
        Created {new Date(combo.createdAt).toLocaleString()} · Updated {new Date(combo.updatedAt).toLocaleString()}
      </p>

      <ConfirmDialog
        open={confirming}
        title="Delete combo?"
        message={`"${combo.name}" will be permanently removed from this browser.`}
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </article>
  );
}
