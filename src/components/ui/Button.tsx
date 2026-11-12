import type { AnchorHTMLAttributes, ComponentProps } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md';

/** Frame Zero buttons: hover changes the fill tone only, no motion. */
const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary/85',
  secondary: 'border border-line-control bg-muted text-fg hover:bg-line-strong active:bg-neutral',
  ghost: 'text-fg-muted hover:bg-muted hover:text-fg active:bg-line-strong',
  danger: 'border border-danger bg-danger-surface text-danger hover:bg-[#4a1c17] active:bg-[#2c0f0b]',
  link: 'rounded-none! px-0! text-fg-muted underline underline-offset-4 hover:text-fg active:text-fg',
};

/** md is 44px, the minimum touch target; sm stays compact for pointers but grows to 44px on touch screens. */
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-[30px] px-2.5 pointer-coarse:h-11',
  md: 'h-11 px-4',
};

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md', extra = ''): string {
  return `label-md inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${SIZES[size]} ${VARIANTS[variant]} ${extra}`;
}

export interface ButtonProps extends ComponentProps<'button'> {
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
