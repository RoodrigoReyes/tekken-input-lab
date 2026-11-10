import type { Diagnostic } from '../../types/notation';

/** Parser/validator messages. Warnings are amber, info is muted; text excerpts point at the source. */
export function DiagnosticsList({ diagnostics, notation }: { diagnostics: readonly Diagnostic[]; notation: string }) {
  if (diagnostics.length === 0) return null;
  return (
    <ul className="space-y-1" aria-label="Notation diagnostics">
      {diagnostics.map((d, i) => (
        <li key={`${d.code}-${i}`} className={`flex gap-2 text-sm ${d.severity === 'warning' ? 'text-amber-300' : 'text-ink-400'}`}>
          <span aria-hidden>{d.severity === 'warning' ? '⚠' : 'ℹ'}</span>
          <span>
            {d.span && d.span.end > d.span.start && (
              <code className="mr-1.5 rounded bg-ink-800 px-1 font-mono text-xs text-ink-100">{notation.slice(d.span.start, d.span.end)}</code>
            )}
            {d.message}
          </span>
        </li>
      ))}
    </ul>
  );
}
