import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md';

/** Frame Zero buttons: hover changes the fill tone only, no motion. */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'border border-line bg-muted text-fg hover:bg-line-strong',
  ghost: 'text-fg-muted hover:bg-muted hover:text-fg',
  danger: 'border border-danger bg-danger-surface text-danger hover:bg-[#4a1c17]',
  link: 'px-0! text-fg-muted underline underline-offset-4 hover:text-fg',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-[30px] px-2.5',
  md: 'h-10 px-4',
};

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', extra = ''): string {
  return `label-md inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[4px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${extra}`;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = 'secondary', size = 'md', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A link styled as a button (navigation must stay a link). */
export function LinkButton({ variant = 'secondary', size = 'md', className = '', ...props }: LinkButtonProps) {
  return <a className={buttonClass(variant, size, className)} {...props} />;
}
