import { useMemo } from 'react';
import { CommandSequence } from '../../components/arcade';
import { Button } from '../../components/ui/Button';
import { usePlayerSide } from '../../hooks/usePlayerSide';
import type { GeneratedCombo } from '../../ttt2/generator';
import { parseCombo } from '../combo/parseCombo';

const KIND_LABEL: Record<string, string> = { condition: 'Condition', note: 'Note', notation: 'Notation' };
const ROUTE_LABEL: Record<string, string> = { normal: 'Starter', counterHit: 'Counter hit', lowParry: 'Low parry', wall: 'Wall' };

export interface GeneratedComboItemProps {
  combo: GeneratedCombo;
  rank: number;
  point: string;
  partner: string;
  onUse: (combo: GeneratedCombo) => void;
  onCopy: (notation: string) => void;
}

/** One generated combo: meta row, arcade display split by character, raw notation, and what to verify. */
export function GeneratedComboItem({ combo, rank, point, partner, onUse, onCopy }: GeneratedComboItemProps) {
  const parsed = useMemo(
    () => parseCombo({ game: 'ttt2', dialect: 'standard', notation: combo.notation, character: point, partner, sectionCharacters: [] }),
    [combo.notation, point, partner],
  );
  const [side] = usePlayerSide();
  const kind = combo.route.routeKind ?? 'normal';
  return (
    <li className="flex flex-col gap-3 rounded-[4px] border border-line bg-surface p-3 sm:p-4" aria-label={`Generated combo ${rank}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line-strong pb-3">
        <span className="font-condensed text-2xl leading-none font-extrabold text-primary">#{rank}</span>
        <span className="label-md text-fg">
          {ROUTE_LABEL[kind]}: <code className="font-mono normal-case">{combo.route.starter ?? '—'}</code>
        </span>
        <span className="label-sm text-[11px] text-fg-muted">· {combo.analysis.preTaHits} hits before TA (est.)</span>
        {combo.analysis.boundMove && (
          <span className="label-sm text-[11px] text-fg-muted">
            · Bound: <code className="text-fg">{combo.analysis.boundMove}</code>
          </span>
        )}
        <Button variant="primary" size="sm" className="ml-auto" onClick={() => onUse(combo)}>
          Use this combo
        </Button>
      </div>
      <div className="overflow-hidden rounded-[4px] border border-line-strong bg-neutral p-1">
        <CommandSequence result={parsed.result} size={26} sectionHeaders={parsed.headers} side={side} />
      </div>
      <div className="flex items-start justify-between gap-3 rounded-[4px] border border-line-strong bg-muted/50 px-3 py-2">
        <pre className="min-w-0 overflow-x-auto font-mono text-[13px] leading-5 font-medium whitespace-pre-wrap text-fg">{combo.notation}</pre>
        <button type="button" className="label-sm shrink-0 text-[11px] text-fg-muted uppercase hover:text-fg" onClick={() => onCopy(combo.notation)}>
          Copy
        </button>
      </div>
      {combo.flags.length > 0 ? (
        <div className="rounded-[4px] border border-warning/50 bg-warning/5 p-3">
          <p className="label-md mb-1.5 text-warning">To verify</p>
          <ul className="space-y-1 text-sm text-warning" aria-label="To verify">
            {combo.flags.map((f, i) => (
              <li key={i}>
                ⚠ {KIND_LABEL[f.kind]} ({f.piece}): <span className="text-fg">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="label-sm flex items-center gap-2 text-[11px] text-fg-muted uppercase">
          <span aria-hidden className="size-2 rounded-full bg-success" /> Nothing flagged by the guide
        </p>
      )}
    </li>
  );
}
