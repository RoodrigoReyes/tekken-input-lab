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
    <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-ink-700 bg-ink-900 px-2 py-1.5 focus-within:border-ink-400 focus-within:ring-2 focus-within:ring-red-400/70">
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-ink-800 px-2 py-0.5 text-xs text-ink-100">
          {tag}
          <button type="button" aria-label={`Remove tag ${tag}`} className="text-ink-400 hover:text-white" onClick={() => onChange(value.filter((t) => t !== tag))}>
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
        placeholder={value.length ? '' : 'Add tags…'}
        className="min-w-24 flex-1 bg-transparent py-0.5 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none"
      />
      <datalist id={`${id}-list`}>
        {suggestions.filter((s) => !value.includes(s)).map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
