import { useState, type KeyboardEvent } from 'react';

export interface TagInputProps {
  value: readonly string[];
  onChange: (tags: string[]) => void;
  suggestions?: readonly string[];
  id: string;
}

/** Tags as removable chips; Enter or comma adds the typed tag. */
export function TagInput({ value, onChange, suggestions = [], id }: TagInputProps) {
  const [draft, setDraft] = useState('');
  const add = (raw: string) => {
    const tag = raw.trim().replace(/,$/, '').slice(0, 40);
    if (tag && !value.some((t) => t.toLowerCase() === tag.toLowerCase())) onChange([...value, tag]);
    setDraft('');
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(draft);
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-line-control bg-muted px-2 py-1.5 focus-within:border-primary">
      {value.map((tag) => (
        <span key={tag} className="label-sm inline-flex items-center gap-1 rounded-full bg-line-strong py-0.5 pr-0.5 pl-2.5 text-fg">
          #{tag}
          <button type="button" aria-label={`Remove tag ${tag}`} className="flex size-6 items-center justify-center rounded-full text-fg-muted hover:bg-muted hover:text-fg pointer-coarse:size-11" onClick={() => onChange(value.filter((t) => t !== tag))}>
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        list={`${id}-list`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={() => draft && add(draft)}
        placeholder={value.length ? '+ Add tag…' : 'Add tags…'}
        className="min-w-24 flex-1 bg-transparent py-0.5 text-sm text-fg placeholder:text-fg-muted focus:outline-none focus-visible:outline-none"
      />
      <datalist id={`${id}-list`}>
        {suggestions.filter((s) => !value.includes(s)).map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
