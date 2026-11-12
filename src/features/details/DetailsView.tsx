import { useMemo, useState, type ReactNode } from 'react';
import { DiagnosticsList } from '../../components/combos/DiagnosticsList';
import { ArcadeDisplay, DEFAULT_VISUAL } from '../../components/combos/ComboVisual';
import { GameBadge } from '../../components/combos/GameBadge';
import { Chip } from '../../components/ui/Chip';
import { Collapsible } from '../../components/ui/Collapsible';
import { Eyebrow, PageTitle, Panel } from '../../components/ui/Panel';
import { Button, LinkButton } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Menu } from '../../components/ui/Menu';
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
  if (loading) return <p className="label-sm text-fg-muted">Loading…</p>;
  if (error || !combo) {
    return (
      <Panel className="flex flex-col items-center gap-3 px-6 py-[58px] text-center">
        <p className="text-2xl font-bold uppercase" role={error ? 'alert' : undefined}>
          {error ? 'Could not load this combo' : 'This combo no longer exists'}
        </p>
        <p className="max-w-md text-sm text-fg-muted">{error ? `${error}. Reload the page to try again.` : 'It may have been deleted, or the link is out of date.'}</p>
        <LinkButton href={paths.library()} variant="primary">
          Back to library
        </LinkButton>
      </Panel>
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
  const [visual, setVisual] = useState<VisualOptions>(DETAILS_VISUAL);
  const [confirming, setConfirming] = useState(false);
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
      await repo.setFavorite(combo.id, !combo.favorite);
      await reload();
    }, 'Could not update favorite');

  const characters = [combo.character || 'No character', combo.partner].filter(Boolean).join(' + ');
  const warnings = parsed.result.diagnostics.filter((d) => d.severity === 'warning').length;

  return (
    <article className="flex flex-col gap-4">
      <nav aria-label="Breadcrumb">
        <Eyebrow>
          <a href={paths.library()} className="inline-flex min-h-7 items-center hover:text-fg pointer-coarse:min-h-11">
            ← Library
          </a>
          <span aria-hidden>/</span>
          <span>{game.name}</span>
        </Eyebrow>
      </nav>

      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-start gap-3">
            <PageTitle className="min-w-0">{combo.name}</PageTitle>
            <button
              type="button"
              onClick={toggleFavorite}
              aria-pressed={combo.favorite}
              aria-label="Favorite"
              className={`flex size-11 shrink-0 items-center justify-center rounded-lg text-[28px] leading-none hover:bg-muted ${combo.favorite ? 'text-primary' : 'text-fg-muted hover:text-fg'}`}
            >
              {combo.favorite ? '★' : '☆'}
            </button>
          </div>
          <dl className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Game</dt>
              <dd>
                <GameBadge game={combo.game} />
              </dd>
            </div>
            <Meta label="Characters">{characters}</Meta>
            <Meta label="Difficulty">
              <span className="capitalize">{combo.difficulty}</span>
            </Meta>
            {combo.damage !== undefined && (
              <Meta label="Damage">
                <span className="font-label text-base font-semibold">{combo.damage}</span>
              </Meta>
            )}
            {combo.tags.length > 0 && (
              <Meta label="Tags">
                <span className="flex flex-wrap gap-1.5">
                  {combo.tags.map((t) => (
                    <Chip key={t}>#{t}</Chip>
                  ))}
                </span>
              </Meta>
            )}
          </dl>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center max-sm:[&_button]:w-full">
          <LinkButton href={paths.edit(combo.id)} variant="primary">
            Edit
          </LinkButton>
          <Button onClick={copy}>Copy notation</Button>
          {renderExtraActions && <Menu label="Export">{renderExtraActions({ combo, parsed, visual })}</Menu>}
          <Menu label="More">
            <Button variant="ghost" onClick={duplicate}>
              Duplicate
            </Button>
            <Button variant="ghost" className="text-danger! hover:bg-danger-surface!" onClick={() => setConfirming(true)}>
              Delete
            </Button>
          </Menu>
        </div>
      </header>

      <Panel aria-label="Commands" className="flex flex-col gap-3 p-4">
        <ArcadeDisplay title="Arcade display" parsed={parsed} visual={visual} onVisualChange={setVisual} />
        {parsed.result.diagnostics.length > 0 ? (
          <DiagnosticsList diagnostics={parsed.result.diagnostics} notation={combo.notation} />
        ) : (
          <p className="label-sm flex items-center gap-2 text-fg-muted uppercase">
            <span aria-hidden className="size-2 rounded-full bg-success" /> No notation warnings for {game.name}
          </p>
        )}
      </Panel>

      <Collapsible
        title={combo.notes ? 'Notation & notes' : 'Original notation'}
        defaultOpen
        storageKey="details-notation-notes"
        bodyClassName="grid items-start gap-3 lg:grid-cols-2"
        aside={<span className="label-sm text-fg-muted uppercase">Dialect: {getDialect(combo.dialect).name}</span>}
      >
        <pre className="overflow-x-auto font-mono text-sm leading-[22px] font-medium whitespace-pre-wrap text-fg">{combo.notation}</pre>
        {combo.notes && <Notes text={combo.notes} />}
      </Collapsible>
      <p className="label-sm px-1 text-fg-muted">
        Created {new Date(combo.createdAt).toLocaleString()} · Updated {new Date(combo.updatedAt).toLocaleString()}
        {warnings > 0 && <span className="text-warning"> · ⚠ {warnings} warning{warnings > 1 ? 's' : ''}</span>}
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

/** The details page favors the arcade display: commands start larger than in the editor. */
const DETAILS_VISUAL: VisualOptions = { ...DEFAULT_VISUAL, size: 48 };

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="label-md text-fg-muted">{label}</dt>
      <dd className="text-fg">{children}</dd>
    </div>
  );
}

/** Notes text; a generated combo's "To verify:" list is highlighted in the warning color. */
function Notes({ text }: { text: string }) {
  const [before, after] = splitVerify(text);
  return (
    <div className="space-y-3 text-sm whitespace-pre-wrap text-fg">
      {before && <p>{before}</p>}
      {after && (
        <div className="rounded-lg border border-warning/50 bg-warning/5 p-3 text-warning">
          <p className="label-md mb-1">To verify</p>
          <p>{after}</p>
        </div>
      )}
    </div>
  );
}

function splitVerify(text: string): [string, string] {
  const marker = text.indexOf('To verify:');
  if (marker < 0) return [text, ''];
  return [text.slice(0, marker).trim(), text.slice(marker + 'To verify:'.length).trim()];
}
