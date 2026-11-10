import { useMemo } from 'react';
import { CommandSequence } from '../../components/arcade';
import { DifficultyBadge, GameBadge } from '../../components/combos/GameBadge';
import { paths } from '../../hooks/useHashRoute';
import type { Combo } from '../../types/combo';
import { parseCombo } from '../combo/parseCombo';

export interface ComboCardProps {
  combo: Combo;
  onToggleFavorite: (combo: Combo) => void;
}

export function ComboCard({ combo, onToggleFavorite }: ComboCardProps) {
  const parsed = useMemo(() => parseCombo(combo), [combo]);
  const warnings = parsed.result.diagnostics.filter((d) => d.severity === 'warning').length;
  return (
    <article className="group relative flex flex-col gap-2 rounded-xl border border-ink-700 bg-ink-850 p-3 transition-colors hover:border-ink-500 focus-within:ring-2 focus-within:ring-red-400">
      <header className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold">
            <a href={paths.details(combo.id)} className="after:absolute after:inset-0 focus-visible:outline-none">
              {combo.name}
            </a>
          </h3>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-400">
            <GameBadge game={combo.game} />
            <span>{[combo.character || 'No character', combo.partner].filter(Boolean).join(' + ')}</span>
            <DifficultyBadge difficulty={combo.difficulty} />
            {combo.damage !== undefined && <span>{combo.damage} dmg</span>}
            {warnings > 0 && <span className="text-amber-300">⚠ {warnings}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(combo)}
          aria-pressed={combo.favorite}
          aria-label="Favorite"
          className={`relative z-10 text-xl leading-none ${combo.favorite ? 'text-amber-400' : 'text-ink-500 hover:text-ink-200'}`}
        >
          {combo.favorite ? '★' : '☆'}
        </button>
      </header>
      <div className="pointer-events-none overflow-hidden rounded-lg bg-ink-900 p-1">
        <CommandSequence result={parsed.result} size={24} sectionHeaders={parsed.headers} />
      </div>
      {combo.tags.length > 0 && (
        <p className="flex flex-wrap gap-1">
          {combo.tags.map((t) => (
            <span key={t} className="rounded bg-ink-800 px-1.5 py-0.5 text-[11px] text-ink-200">
              #{t}
            </span>
          ))}
        </p>
      )}
    </article>
  );
}
