import { cloneElement, useId, type ComponentProps, type InputHTMLAttributes, type ReactElement, type ReactNode, type SelectHTMLAttributes } from 'react';

/** Inputs: muted-surface fill, 1px control border (3:1), orange border on focus (no glow). */
export const CONTROL =
  'min-h-11 w-full rounded-lg border border-line-control bg-muted px-3 py-2.5 text-base text-fg placeholder:text-fg-muted focus:border-primary focus:outline-none focus-visible:outline-none disabled:opacity-50';

export interface FieldProps {
  label: string;
  hint?: ReactNode;
  /** Small text on the right of the label (e.g. "Optional", "TTT2 only"). */
  aside?: ReactNode;
  children: ReactElement<{ id?: string; 'aria-describedby'?: string }>;
  className?: string;
}

/**
 * Label + control. Uses explicit htmlFor/id association (a wrapping <label>
 * would fold the control's current value into its accessible name).
 */
export function Field({ label, hint, aside, children, className = '' }: FieldProps) {
  const generated = useId();
  const id = children.props.id ?? generated;
  const hintId = `${id}-hint`;
  const control = cloneElement(children, { id, ...(hint ? { 'aria-describedby': hintId } : {}) });
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="label-md text-fg-muted">
          {label}
        </label>
        {aside && <span className="label-sm text-fg-muted uppercase">{aside}</span>}
      </div>
      {control}
      {hint && (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${CONTROL} ${className}`} {...props} />;
}

export function TextArea({ className = '', ...props }: ComponentProps<'textarea'>) {
  return <textarea className={`${CONTROL} ${className}`} {...props} />;
}

const CHEVRON =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%238b93a0'%3E%3Cpath d='M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z'/%3E%3C/svg%3E\")] bg-[length:18px] bg-[right_10px_center] bg-no-repeat";

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${CONTROL} ${CHEVRON} cursor-pointer appearance-none pr-9 ${className}`} {...props} />;
}

export interface ComboBoxProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  options: readonly string[];
}

/** Text input with suggestions (roster) that still accepts any value. */
export function ComboBox({ id, options, ...props }: ComboBoxProps) {
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

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className={`flex min-h-8 cursor-pointer items-center gap-2 text-sm text-fg select-none pointer-coarse:min-h-11 ${className}`}>
      <input type="checkbox" className="size-4 accent-primary" {...props} />
      {label}
    </label>
  );
}
