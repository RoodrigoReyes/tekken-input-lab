import { forwardRef } from 'react';
import type { ParsedCombo } from '../../features/combo/parseCombo';
import { usePlayerSide } from '../../hooks/usePlayerSide';
import { CommandSequence } from '../arcade';
import { SideToggle } from './SideToggle';

export interface VisualOptions {
  size: number;
  expandNamed: boolean;
}

export const DEFAULT_VISUAL: VisualOptions = { size: 40, expandNamed: false };

export interface VisualControlsProps {
  value: VisualOptions;
  onChange: (v: VisualOptions) => void;
}

/** Player side, command size (20–72 px per cluster) and the "Expand named moves" toggle. */
export function VisualControls({ value, onChange }: VisualControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <SideToggle />
      <label className="label-md flex items-center gap-2 text-fg-muted">
        Size
        <input
          type="range"
          min={20}
          max={72}
          step={2}
          value={value.size}
          onChange={(e) => onChange({ ...value, size: Number(e.target.value) })}
          className="w-28 accent-primary"
          aria-label="Command size"
        />
        <span className="label-sm w-9 text-[11px] text-fg">{value.size}px</span>
      </label>
      <label className="label-md flex cursor-pointer items-center gap-2 text-fg-muted select-none">
        <input
          type="checkbox"
          checked={value.expandNamed}
          onChange={(e) => onChange({ ...value, expandNamed: e.target.checked })}
          className="size-4 accent-primary"
        />
        Expand named moves
      </label>
    </div>
  );
}

/** The arcade rendering of a parsed combo inside the arcade display container. */
export const ComboVisual = forwardRef<SVGSVGElement, { parsed: ParsedCombo; options: VisualOptions }>(function ComboVisual({ parsed, options }, ref) {
  const [side] = usePlayerSide();
  const empty = parsed.result.ast.sections.every((s) => s.stages.length === 0);
  return (
    <div className="rounded-[4px] border border-line bg-surface p-1">
      {empty ? (
        <p className="p-6 text-sm text-fg-muted">Type or paste notation to see the arcade commands.</p>
      ) : (
        <CommandSequence ref={ref} result={parsed.result} size={options.size} expandNamed={options.expandNamed} sectionHeaders={parsed.headers} side={side} />
      )}
    </div>
  );
});
