import { useMemo } from 'react';
import { CommandSequence } from '../../components/arcade';
import { DifficultyBadge, GameBadge } from '../../components/combos/GameBadge';
import { paths } from '../../hooks/useHashRoute';
import { useMotionFrame } from '../../hooks/useMotionFrame';
import { usePlayerSide } from '../../hooks/usePlayerSide';
import type { Combo } from '../../types/combo';
import { parseCombo } from '../combo/parseCombo';

export interface ComboCardProps {
  combo: Combo;
  onToggleFavorite: (combo: Combo) => void;
}

/** Library card: fully clickable (stretched link), favorite toggle above the link layer. */
export function ComboCard({ combo, onToggleFavorite }: ComboCardProps) {
  const parsed = useMemo(() => parseCombo(combo), [combo]);
  const [side] = usePlayerSide();
  const [motionFrame] = useMotionFrame();
  const warnings = parsed.result.diagnostics.filter((d) => d.severity === 'warning').length;
  const characters = [combo.character || 'No character', combo.partner].filter(Boolean).join(' + ');
  return (
    <article className="relative flex min-w-0 flex-col gap-3 rounded-[4px] border border-line bg-surface p-4 transition-colors hover:border-fg-muted/60 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary">
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="truncate text-lg leading-[22px] font-semibold">
            <a href={paths.details(combo.id)} className="after:absolute after:inset-0 focus-visible:outline-none">
              {combo.name}
            </a>
          </h3>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-muted">
            <GameBadge game={combo.game} />
            <span className="text-fg">{characters}</span>
            <DifficultyBadge difficulty={combo.difficulty} />
            {warnings > 0 && (
              <span className="label-sm rounded-[2px] border border-dashed border-warning px-1.5 py-0.5 text-[11px] text-warning" title={`${warnings} notation warning(s)`}>
                ⚠ {warnings}
              </span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {combo.damage !== undefined && <span className="font-mono text-sm font-medium text-primary">{combo.damage} dmg</span>}
          <button
            type="button"
            onClick={() => onToggleFavorite(combo)}
            aria-pressed={combo.favorite}
            aria-label="Favorite"
            className={`relative z-10 text-xl leading-none ${combo.favorite ? 'text-primary' : 'text-fg-muted hover:text-fg'}`}
          >
            {combo.favorite ? '★' : '☆'}
          </button>
        </div>
      </header>
      <div className="pointer-events-none overflow-hidden rounded-[4px] border border-line-strong bg-neutral p-1">
        <CommandSequence result={parsed.result} size={24} sectionHeaders={parsed.headers} side={side} motionFrame={motionFrame} />
      </div>
      <footer className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-line-strong pt-3">
        <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-fg-muted" title={combo.notation}>
          {combo.notation.replace(/\s*\n\s*/g, ' ')}
        </code>
        {combo.tags.map((t) => (
          <span key={t} className="label-sm rounded-full bg-line-strong px-2 py-1 text-[11px] leading-none text-fg">
            #{t}
          </span>
        ))}
      </footer>
    </article>
  );
}
