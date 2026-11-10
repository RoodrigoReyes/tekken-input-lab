import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-arcade text-white hover:bg-red-500 focus-visible:outline-red-300',
  secondary: 'bg-ink-800 text-ink-100 hover:bg-ink-700 border border-ink-700',
  ghost: 'text-ink-200 hover:bg-ink-800',
  danger: 'bg-red-900/60 text-red-100 hover:bg-red-800 border border-red-800',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
}

function buttonClass(variant: Variant, size: 'sm' | 'md', extra: string): string {
  const sizing = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm';
  return `inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${sizing} ${VARIANTS[variant]} ${extra}`;
}

export function Button({ variant = 'secondary', size = 'md', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: 'sm' | 'md';
}

/** A link styled as a button (navigation must stay a link). */
export function LinkButton({ variant = 'secondary', size = 'md', className = '', ...props }: LinkButtonProps) {
  return <a className={buttonClass(variant, size, className)} {...props} />;
}
