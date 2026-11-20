import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { layoutCombo, type SectionHeaderInfo } from '../../render/layout';
import { clearMeasureCache, measureText } from '../../render/measure';
import type { Side } from '../../render/side';
import type { ParseResult } from '../../types/notation';
import { ComboSvg } from './ComboSvg';

export interface CommandSequenceProps {
  result: ParseResult;
  /** Base size of a button cluster in px. */
  size?: number;
  expandNamed?: boolean;
  sectionHeaders?: readonly SectionHeaderInfo[];
  className?: string;
  /** Player side: 2P mirrors forward/back arrows. */
  side?: Side;
  /** Draw motion inputs (qcf, cd, ff, …) inside a frame. */
  motionFrame?: boolean;
  activeStage?: number;
}

function useElementWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w !== undefined) setWidth(Math.floor(w));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

/** Re-render once web fonts are ready so tiles are sized for Chakra Petch, not the fallback. */
function useFontsReady(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let active = true;
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    fonts?.ready
      .then(() => {
        if (!active) return;
        clearMeasureCache();
        setTick((t) => t + 1);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  return tick;
}

const NONE: ReadonlySet<number> = new Set();

/** Live, responsive arcade rendering of a parsed combo. Wraps to the container width. */
export const CommandSequence = forwardRef<SVGSVGElement, CommandSequenceProps>(function CommandSequence(
  { result, size = 40, expandNamed = false, sectionHeaders, className, side = 'left', motionFrame = false, activeStage },
  svgRef,
) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const fontsTick = useFontsReady();
  // Keys are span offsets, so they only mean something for the text they were clicked on.
  const [opened, setOpened] = useState<{ source: string; keys: ReadonlySet<number> }>({ source: result.original, keys: NONE });
  const expandedNamed = opened.source === result.original ? opened.keys : NONE;
  const toggleNamed = useCallback(
    (key: number) =>
      setOpened((prev) => {
        const keys = new Set(prev.source === result.original ? prev.keys : NONE);
        if (keys.has(key)) keys.delete(key);
        else keys.add(key);
        return { source: result.original, keys };
      }),
    [result.original],
  );
  const layout = useMemo(
    () => layoutCombo(result, { width: width || 640, size, expandNamed, expandedNamed, sectionHeaders, motionFrame, measure: measureText }),
    [result, width, size, expandNamed, expandedNamed, sectionHeaders, motionFrame, fontsTick], // eslint-disable-line react-hooks/exhaustive-deps
  );
  return (
    <div ref={ref} className={className} style={{ width: '100%', overflowX: 'auto' }}>
      <ComboSvg ref={svgRef} layout={layout} title={result.original} side={side} onToggleNamed={expandNamed ? undefined : toggleNamed} activeStage={activeStage} />
    </div>
  );
});
