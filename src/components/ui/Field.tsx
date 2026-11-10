import { cloneElement, useId, type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const CONTROL =
  'w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:border-ink-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70';

/**
 * Label + control. Uses explicit htmlFor/id association (a wrapping <label>
 * would fold the control's current value into its accessible name).
 */
export function Field({
  label,
  hint,
  children,
  className = '',
}: {
  label: string;
  hint?: ReactNode;
  children: ReactElement<{ id?: string; 'aria-describedby'?: string }>;
  className?: string;
}) {
  const generated = useId();
  const id = children.props.id ?? generated;
  const hintId = `${id}-hint`;
  const control = cloneElement(children, { id, ...(hint ? { 'aria-describedby': hintId } : {}) });
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={id} className="block text-xs font-semibold tracking-wide text-ink-400 uppercase">
        {label}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="text-xs text-ink-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CONTROL} ${className}`} {...props} />;
}

export function TextArea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${CONTROL} ${className}`} {...props} />;
}

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${CONTROL} ${className}`} {...props} />;
}

/** Text input with suggestions (roster) that still accepts any value. */
export function ComboBox({ id, options, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string; options: readonly string[] }) {
  return (
    <>
      <TextInput id={id} list={`${id}-list`} autoComplete="off" {...props} />
      <datalist id={`${id}-list`}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </>
  );
}
