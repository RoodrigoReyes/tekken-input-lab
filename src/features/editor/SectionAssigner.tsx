import { Select } from '../../components/ui/Field';
import type { ParsedCombo } from '../combo/parseCombo';

const SOURCE_TEXT: Record<string, string> = {
  label: 'from label',
  primary: 'starts the combo',
  tag: 'after TAG',
  tagAssault: 'after Tag Assault',
  manual: 'manual',
  unassigned: 'needs assignment',
};

export interface SectionAssignerProps {
  parsed: ParsedCombo;
  characters: readonly string[];
  manual: ReadonlyArray<string | null>;
  onChange: (manual: Array<string | null>) => void;
}

/** Per-section character assignment for TTT2 combos. */
export function SectionAssigner({ parsed, characters, manual, onChange }: SectionAssignerProps) {
  const { sections } = parsed.result.ast;
  const set = (index: number, value: string) => {
    const next = Array.from({ length: sections.length }, (_, i) => manual[i] ?? null);
    next[index] = value || null;
    onChange(next);
  };
  return (
    <fieldset className="space-y-2 rounded-xl border border-ink-700 p-3">
      <legend className="px-1 text-xs font-semibold tracking-wide text-ink-400 uppercase">Character sections</legend>
      {sections.map((section, i) => {
        const auto = parsed.assignments[i];
        const text = parsed.result.original.slice(section.span.start, section.span.end).trim();
        return (
          <div key={i} className="grid items-center gap-2 sm:grid-cols-[7rem_1fr_14rem]">
            <span className="text-sm font-semibold">
              Section {i + 1}
              {section.boundary === 'tagAssault' && <span className="ml-1 text-xs text-emerald-400">TA</span>}
            </span>
            <code className="truncate font-mono text-xs text-ink-400" title={text}>
              {text || '—'}
            </code>
            <Select aria-label={`Character for section ${i + 1}`} value={manual[i] ?? ''} onChange={(e) => set(i, e.target.value)}>
              <option value="">
                Auto: {auto?.character ?? 'unassigned'} ({SOURCE_TEXT[auto?.source ?? 'unassigned']})
              </option>
              {characters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
        );
      })}
    </fieldset>
  );
}
