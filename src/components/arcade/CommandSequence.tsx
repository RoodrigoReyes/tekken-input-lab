import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { layoutCombo, type SectionHeaderInfo } from '../../render/layout';
import { measureText } from '../../render/measure';
import type { ParseResult } from '../../types/notation';
import { ComboSvg } from './ComboSvg';

export interface CommandSequenceProps {
  result: ParseResult;
  /** Base size of a button cluster in px. */
  size?: number;
  expandNamed?: boolean;
  sectionHeaders?: readonly SectionHeaderInfo[];
  className?: string;
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

/** Live, responsive arcade rendering of a parsed combo. Wraps to the container width. */
export const CommandSequence = forwardRef<SVGSVGElement, CommandSequenceProps>(function CommandSequence(
  { result, size = 40, expandNamed = false, sectionHeaders, className },
  svgRef,
) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const layout = useMemo(
    () => layoutCombo(result, { width: width || 640, size, expandNamed, sectionHeaders, measure: measureText }),
    [result, width, size, expandNamed, sectionHeaders],
  );
  return (
    <div ref={ref} className={className} style={{ width: '100%', overflowX: 'auto' }}>
      <ComboSvg ref={svgRef} layout={layout} title={result.original} />
    </div>
  );
});
