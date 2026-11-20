import { useMemo, type ReactNode } from 'react';
import { CommandSequence } from '../../components/arcade';
import { PageTitle, Panel } from '../../components/ui/Panel';
import { useCombos } from '../../hooks/useCombos';
import { useMotionFrame } from '../../hooks/useMotionFrame';
import { paths } from '../../hooks/useHashRoute';
import { usePlayerSide } from '../../hooks/usePlayerSide';
import { GAMES } from '../../notation/games';
import { parseNotation } from '../../parser';
import { ComboCard } from '../library/ComboCard';
import { LibraryError } from '../library/LibraryError';
import { useToggleFavorite } from '../library/useToggleFavorite';
import { recentCombos } from './recent';

const RECENT = 4;
const SAMPLE = 'qcf+1 > uf+2,1 B! > SSL 1~b~uf+4';
const PHASES = ['Route up to B!', 'TA filler', 'Ender'] as const;

/** Landing page: the two ways to make a combo, then the latest saved ones. */
export function HomeView() {
  const { data: combos, loading, error, reload } = useCombos();
  const toggleFavorite = useToggleFavorite(reload);
  const recent = useMemo(() => recentCombos(combos, RECENT), [combos]);
  const sample = useMemo(() => parseNotation(SAMPLE, { game: 't6' }), []);
  const [side] = usePlayerSide();
  const [motionFrame] = useMotionFrame();

  return (
    <div className="flex flex-col gap-6">
      <PageTitle>Turn notation into arcade commands</PageTitle>

      <nav aria-label="Get started" className="grid gap-4 md:grid-cols-2">
        <EntryCard href={paths.new()} title="Create a combo" cta="Open the editor" description="Type or paste a combo from any Tekken and see it as arcade commands while you write.">
          <ul aria-label="Supported games" className="flex flex-wrap gap-1.5">
            {GAMES.map((g) => (
              <li key={g.id} title={g.name} className="label-sm rounded-sm border border-line bg-line-strong px-1.5 py-0.5 text-fg">
                {g.shortName}
              </li>
            ))}
          </ul>
          <div aria-hidden className="overflow-hidden">
            <CommandSequence result={sample} size={26} side={side} motionFrame={motionFrame} />
          </div>
        </EntryCard>
        <EntryCard href={paths.generator()} title="TTT2 combo generator" cta="Build a team combo" description="Pick a team and build a Tekken Tag Tournament 2 combo from the bundled guide, one phase at a time.">
          <ol aria-label="Phases" className="grid gap-2 sm:grid-cols-3">
            {PHASES.map((phase, i) => (
              <li key={phase} className="flex items-center gap-2 rounded-lg border border-line-strong bg-neutral px-2.5 py-2 text-sm text-fg">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-line-control bg-muted text-sm font-bold text-fg">{i + 1}</span>
                {phase}
              </li>
            ))}
          </ol>
        </EntryCard>
        <EntryCard href={paths.explore()} title="Explore community combos" cta="Browse combos" description="Find community combos and save your favorites to your library.">
          <p className="text-sm text-fg-muted">Browse combos by character, game, and more.</p>
        </EntryCard>
      </nav>

      <section aria-label="Recent combos" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="label-md flex items-center gap-2 text-fg">
            <span aria-hidden className="size-2 rounded-xs bg-fg-muted" /> Recent combos
          </h2>
          {combos.length > 0 && (
            <a href={paths.library()} className="label-md inline-flex min-h-11 items-center text-fg-muted underline underline-offset-4 hover:text-fg">
              {`View library (${combos.length}) →`}
            </a>
          )}
        </div>
        {error ? (
          <LibraryError message={error} />
        ) : loading ? (
          <p className="label-sm text-fg-muted">Loading…</p>
        ) : recent.length === 0 ? (
          <Panel className="px-4 py-6 text-sm text-fg-muted">No combos yet. The combos you save appear here and in the library.</Panel>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            {recent.map((c) => (
              <ComboCard key={c.id} combo={c} onToggleFavorite={toggleFavorite} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface EntryCardProps {
  href: string;
  title: string;
  description: string;
  cta: string;
  children: ReactNode;
}

/** A large, fully clickable entry point; the arrow after the CTA marks the whole card as a link. */
function EntryCard({ href, title, description, cta, children }: EntryCardProps) {
  return (
    <a
      href={href}
      className="group flex min-w-0 flex-col gap-4 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-5"
    >
      <div className="space-y-1.5">
        <h2 className="text-2xl leading-none font-bold text-fg uppercase">{title}</h2>
        <p className="text-sm text-fg-muted">{description}</p>
      </div>
      {children}
      <span className="label-md mt-auto flex items-center gap-2 text-primary">
        {cta} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </a>
  );
}
