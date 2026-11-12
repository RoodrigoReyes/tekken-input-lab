import { useMemo, useState } from 'react';
import { ComboVisual, DEFAULT_VISUAL, VisualControls, type VisualOptions } from '../../components/combos/ComboVisual';
import { Button } from '../../components/ui/Button';
import { Panel, PanelHeader } from '../../components/ui/Panel';
import type { GeneratedCombo } from '../../ttt2/generator';
import { parseCombo } from '../combo/parseCombo';

export interface ComboResultProps {
  combo: GeneratedCombo;
  point: string;
  partner: string;
  onUse: (combo: GeneratedCombo) => void;
  onCopy: (notation: string) => void;
}

/** The built combo: full-width arcade display with its controls, raw notation and the hand-off to the editor. */
export function ComboResult({ combo, point, partner, onUse, onCopy }: ComboResultProps) {
  const parsed = useMemo(
    () => parseCombo({ game: 'ttt2', dialect: 'standard', notation: combo.notation, character: point, partner, sectionCharacters: [] }),
    [combo.notation, point, partner],
  );
  const [visual, setVisual] = useState<VisualOptions>(DEFAULT_VISUAL);
  const toVerify = combo.flags.length;
  return (
    <Panel aria-label="Built combo" className="flex flex-col gap-3 p-3 sm:p-4">
      <PanelHeader title="Your combo" aside={<VisualControls value={visual} onChange={setVisual} />} />
      <ComboVisual parsed={parsed} options={visual} />
      <div className="flex items-start justify-between gap-3 rounded-[4px] border border-line-strong bg-muted/50 px-3 py-2">
        <pre aria-label="Combo notation" className="min-w-0 overflow-x-auto font-mono text-[13px] leading-5 font-medium whitespace-pre-wrap text-fg">
          {combo.notation}
        </pre>
        <button type="button" className="label-sm shrink-0 text-[11px] text-fg-muted uppercase hover:text-fg" onClick={() => onCopy(combo.notation)}>
          Copy
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {toVerify > 0 ? (
          <p className="label-sm flex items-center gap-2 text-[11px] text-warning uppercase">
            <span aria-hidden>⚠</span> {toVerify} thing{toVerify > 1 ? 's' : ''} to verify · see the phases above
          </p>
        ) : (
          <p className="label-sm flex items-center gap-2 text-[11px] text-fg-muted uppercase">
            <span aria-hidden className="size-2 rounded-full bg-success" /> Nothing flagged by the guide
          </p>
        )}
        <Button variant="primary" onClick={() => onUse(combo)}>
          Use this combo
        </Button>
      </div>
    </Panel>
  );
}
