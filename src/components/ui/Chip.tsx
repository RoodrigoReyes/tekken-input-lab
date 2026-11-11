import { useRef, type ButtonHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';

const BASE = 'label-sm inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 leading-none';

/** Static chip (tags, metadata). */
export function Chip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`${BASE} bg-line-strong text-fg ${className}`}>{children}</span>;
}

export interface ToggleChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  active: boolean;
}

/** Filter chip: orange with dark text when active. */
export function ToggleChip({ active, className = '', ...props }: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`${BASE} transition-colors ${active ? 'bg-primary text-on-primary' : 'bg-line-strong text-fg hover:bg-muted'} ${className}`}
      {...props}
    />
  );
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface SegmentedProps<T extends string> {
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}

const NEXT_KEYS: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/** Single-choice segmented control: radio group with roving tabindex and arrow-key selection. */
export function Segmented<T extends string>({ value, options, onChange, label, className = '' }: SegmentedProps<T>) {
  const group = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = NEXT_KEYS[e.key];
    if (!step || options.length === 0) return;
    e.preventDefault();
    const current = Math.max(0, options.findIndex((o) => o.value === value));
    const next = (current + step + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    group.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  };
  return (
    <div ref={group} role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className={`flex gap-1 rounded-[4px] border border-line bg-neutral p-1 ${className}`}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={`label-md flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[3px] px-3 whitespace-nowrap transition-colors ${on ? 'bg-primary text-on-primary' : 'text-fg-muted hover:text-fg'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
