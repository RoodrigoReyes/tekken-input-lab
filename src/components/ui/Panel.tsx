import type { HTMLAttributes, ReactNode } from 'react';

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'aside' | 'article';
}

/** Surface card: 1px border, 4px radius, flat. */
export function Panel({ as: Tag = 'section', className = '', ...props }: PanelProps) {
  return <Tag className={`rounded-[4px] border border-line bg-surface ${className}`} {...props} />;
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
        {icon ?? <span aria-hidden className="size-2 rounded-[1px] bg-primary" />}
        {title}
      </h2>
      {aside}
    </div>
  );
}

/** Large Archivo Condensed page title (headline-lg). */
export function PageTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h1 className={`font-condensed text-[32px] leading-9 font-extrabold tracking-[-0.3px] break-words uppercase ${className}`}>{children}</h1>;
}

/** Mono breadcrumb / eyebrow line above a page title. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="label-sm flex flex-wrap items-center gap-2 text-[11px] text-fg-muted uppercase">{children}</p>;
}
