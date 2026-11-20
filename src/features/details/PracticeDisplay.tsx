import { useEffect, useState } from 'react';
import { ArcadeDisplay, type VisualOptions } from '../../components/combos/ComboVisual';
import { Button } from '../../components/ui/Button';
import type { ParsedCombo } from '../combo/parseCombo';
import { navigateStage } from './practice';

export function PracticeDisplay({ parsed, visual, onVisualChange }: {
  parsed: ParsedCombo;
  visual: VisualOptions;
  onVisualChange: (visual: VisualOptions) => void;
}) {
  const count = parsed.result.ast.sections.reduce((total, section) => total + section.stages.length, 0);
  const [practicing, setPracticing] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!practicing || count < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const action = event.key === 'ArrowLeft' ? 'prev' : event.key === 'ArrowRight' ? 'next' : event.key === 'Home' ? 'reset' : null;
      if (!action) return;
      event.preventDefault();
      setStage((current) => navigateStage(current, count, action));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [practicing, count]);

  return (
    <>
      <ArcadeDisplay title="Arcade display" parsed={parsed} visual={visual} onVisualChange={onVisualChange} activeStage={practicing && count > 1 ? stage : undefined} />
      {count > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button aria-pressed={practicing} onClick={() => { setPracticing(!practicing); setStage(0); }}>Practice</Button>
          {practicing && (
            <>
              <Button aria-label="Previous stage" disabled={stage === 0} onClick={() => setStage((current) => navigateStage(current, count, 'prev'))}>Prev</Button>
              <span className="text-sm" role="status" aria-live="polite">{`Stage ${stage + 1} of ${count}`}</span>
              <Button aria-label="Next stage" disabled={stage >= count - 1} onClick={() => setStage((current) => navigateStage(current, count, 'next'))}>Next</Button>
            </>
          )}
        </div>
      )}
    </>
  );
}
