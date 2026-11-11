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
    <fieldset className="space-y-3 rounded-[4px] border border-line bg-surface p-4">
      <legend className="label-md px-1 text-fg-muted">Character sections</legend>
      {sections.map((section, i) => {
        const auto = parsed.assignments[i];
        const text = parsed.result.original.slice(section.span.start, section.span.end).trim();
        return (
          <div key={i} className="grid items-center gap-2 sm:grid-cols-[7rem_1fr_14rem]">
            <span className="label-md text-fg">
              Section {i + 1}
              {section.boundary === 'tagAssault' && <span className="ml-1.5 rounded-[2px] bg-[#16a34a] px-1 py-px text-[10px] text-on-primary">TA</span>}
            </span>
            <code className="truncate font-mono text-[13px] text-fg-muted" title={text}>
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
