import type { Diagnostic } from '../../types/notation';

/** Parser/validator messages: ⚠ warning (amber) or ℹ info (muted), a code chip with the offending notation, then the message. */
export function DiagnosticsList({ diagnostics, notation }: { diagnostics: readonly Diagnostic[]; notation: string }) {
  if (diagnostics.length === 0) return null;
  return (
    <ul className="space-y-2" aria-label="Notation diagnostics">
      {diagnostics.map((d, i) => {
        const warning = d.severity === 'warning';
        return (
          <li
            key={`${d.code}-${i}`}
            className={`flex gap-2.5 rounded-[4px] border px-3 py-2 text-sm ${warning ? 'border-warning/40 bg-warning/5 text-warning' : 'border-line-strong text-fg-muted'}`}
          >
            <span aria-hidden className="leading-5">
              {warning ? '⚠' : 'ℹ'}
            </span>
            <span className="leading-5">
              {d.span && d.span.end > d.span.start && (
                <code className="mr-2 rounded-[2px] border border-line bg-line-strong px-1.5 py-0.5 font-mono text-xs text-fg">
                  {notation.slice(d.span.start, d.span.end)}
                </code>
              )}
              {d.message}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
