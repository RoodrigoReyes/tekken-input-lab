import { forwardRef } from 'react';
import type { ParsedCombo } from '../../features/combo/parseCombo';
import { CommandSequence } from '../arcade';

export interface VisualOptions {
  size: number;
  expandNamed: boolean;
}

export const DEFAULT_VISUAL: VisualOptions = { size: 40, expandNamed: false };

export function VisualControls({ value, onChange }: { value: VisualOptions; onChange: (v: VisualOptions) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-ink-400">
      <label className="flex items-center gap-2">
        Size
        <input
          type="range"
          min={20}
          max={72}
          step={2}
          value={value.size}
          onChange={(e) => onChange({ ...value, size: Number(e.target.value) })}
          className="accent-red-500"
          aria-label="Command size"
        />
      </label>
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={value.expandNamed}
          onChange={(e) => onChange({ ...value, expandNamed: e.target.checked })}
          className="accent-red-500"
        />
        Expand named moves
      </label>
    </div>
  );
}

/** The arcade rendering of a parsed combo inside a dark panel. */
export const ComboVisual = forwardRef<SVGSVGElement, { parsed: ParsedCombo; options: VisualOptions }>(function ComboVisual({ parsed, options }, ref) {
  const empty = parsed.result.ast.sections.every((s) => s.stages.length === 0);
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900 p-2">
      {empty ? (
        <p className="p-4 text-sm text-ink-500">Type notation to see the arcade commands.</p>
      ) : (
        <CommandSequence ref={ref} result={parsed.result} size={options.size} expandNamed={options.expandNamed} sectionHeaders={parsed.headers} />
      )}
    </div>
  );
});
