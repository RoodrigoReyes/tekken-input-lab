import type { HTMLAttributes, ReactNode } from 'react';

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'aside' | 'article';
}

/** Surface card: 1px border, 4px radius, flat. */
export function Panel({ as: Tag = 'section', className = '', ...props }: PanelProps) {
  return <Tag className={`rounded-lg border border-line bg-surface ${className}`} {...props} />;
}

export interface PanelHeaderProps {
  title: ReactNode;
  icon?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

/** Panel title row: small orange marker, label-md title, optional right side. */
export function PanelHeader({ title, icon, aside, className = '' }: PanelHeaderProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-line-strong pb-3 ${className}`}>
      <h2 className="label-md flex items-center gap-2 text-fg">
        {icon ?? <span aria-hidden className="size-2 rounded-xs bg-fg-muted" />}
        {title}
      </h2>
      {aside}
    </div>
  );
}

/** Page title: headline-lg-mobile (26px) on phones, headline-lg (32px) from sm up. Long words wrap, never one letter per line. */
export function PageTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h1 className={`text-[26px] leading-[30px] font-bold tracking-[-0.2px] break-words uppercase sm:text-[32px] sm:leading-9 sm:tracking-[-0.3px] ${className}`}>{children}</h1>;
}

/** Rajdhani breadcrumb line above a page title. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="label-sm flex flex-wrap items-center gap-2 text-fg-muted uppercase">{children}</p>;
}
