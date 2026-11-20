import type { ParsedCombo } from '../../features/combo/parseCombo';
import { useMotionFrame } from '../../hooks/useMotionFrame';
import { usePlayerSide } from '../../hooks/usePlayerSide';
import { CommandSequence } from '../arcade';
import { PanelHeader } from '../ui/Panel';
import { MotionFrameToggle } from './MotionFrameToggle';
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

/** Player side, motion frame, command size (20 to 72 px per cluster) and the "Expand named moves" toggle, in one row. */
export function VisualControls({ value, onChange }: VisualControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <SideToggle />
      <MotionFrameToggle />
      <label className="label-md flex min-h-11 items-center gap-2 text-fg-muted sm:min-h-9 pointer-coarse:min-h-11">
        Size
        <input
          type="range"
          min={20}
          max={72}
          step={2}
          value={value.size}
          onChange={(e) => onChange({ ...value, size: Number(e.target.value) })}
          className="h-11 w-24 accent-primary sm:h-9 pointer-coarse:h-11"
          aria-label="Command size"
        />
        <span className="label-sm w-10 text-fg">{value.size}px</span>
      </label>
      <label className="label-md flex min-h-11 cursor-pointer items-center gap-2 text-fg-muted select-none sm:min-h-9 pointer-coarse:min-h-11">
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

/** The arcade rendering of a parsed combo. */
export function ComboVisual({ parsed, options, activeStage }: { parsed: ParsedCombo; options: VisualOptions; activeStage?: number }) {
  const [side] = usePlayerSide();
  const [motionFrame] = useMotionFrame();
  const empty = parsed.result.ast.sections.every((s) => s.stages.length === 0);
  return empty ? (
    <p className="py-6 text-sm text-fg-muted">Type or paste notation to see the arcade commands.</p>
  ) : (
    <CommandSequence result={parsed.result} size={options.size} expandNamed={options.expandNamed} sectionHeaders={parsed.headers} side={side} motionFrame={motionFrame} activeStage={activeStage} />
  );
}

export interface ArcadeDisplayProps {
  title: string;
  parsed: ParsedCombo;
  visual: VisualOptions;
  onVisualChange: (v: VisualOptions) => void;
  activeStage?: number;
}

/**
 * Panel header, display and its controls. From sm up the controls sit in the header; on phones
 * they go below the display, folded, so the commands come first.
 */
export function ArcadeDisplay({ title, parsed, visual, onVisualChange, activeStage }: ArcadeDisplayProps) {
  return (
    <>
      <PanelHeader
        title={title}
        aside={
          <div className="hidden sm:block">
            <VisualControls value={visual} onChange={onVisualChange} />
          </div>
        }
      />
      <ComboVisual parsed={parsed} options={visual} activeStage={activeStage} />
      <details className="border-t border-line-strong pt-1 sm:hidden">
        <summary className="label-md flex min-h-11 items-center gap-2 text-fg-muted">Display options</summary>
        <VisualControls value={visual} onChange={onVisualChange} />
      </details>
    </>
  );
}
