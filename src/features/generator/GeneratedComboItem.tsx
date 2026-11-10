import { useMemo } from 'react';
import { CommandSequence } from '../../components/arcade';
import { Button } from '../../components/ui/Button';
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
}

/** One generated combo: arcade preview, the guide pieces it uses, and what to verify. */
export function GeneratedComboItem({ combo, rank, point, partner, onUse }: GeneratedComboItemProps) {
  const parsed = useMemo(
    () => parseCombo({ game: 'ttt2', dialect: 'standard', notation: combo.notation, character: point, partner, sectionCharacters: [] }),
    [combo.notation, point, partner],
  );
  const kind = combo.route.routeKind ?? 'normal';
  return (
    <li className="space-y-2 rounded-xl border border-ink-700 bg-ink-850 p-3" aria-label={`Generated combo ${rank}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
        <span className="font-bold text-ink-100">#{rank}</span>
        <span>
          {ROUTE_LABEL[kind]}: <code className="text-ink-200">{combo.route.starter ?? '—'}</code>
        </span>
        <span>· {combo.analysis.preTaHits} hits before TA (est.)</span>
        {combo.analysis.boundMove && (
          <span>
            · Bound: <code className="text-ink-200">{combo.analysis.boundMove}</code>
          </span>
        )}
        <Button size="sm" variant="primary" className="ml-auto" onClick={() => onUse(combo)}>
          Use this combo
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg bg-ink-900 p-1">
        <CommandSequence result={parsed.result} size={26} sectionHeaders={parsed.headers} />
      </div>
      <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap text-ink-400">{combo.notation}</pre>
      {combo.flags.length > 0 && (
        <ul className="space-y-0.5 text-xs text-amber-300" aria-label="To verify">
          {combo.flags.map((f, i) => (
            <li key={i}>
              ⚠ {KIND_LABEL[f.kind]} ({f.piece}): {f.text}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
