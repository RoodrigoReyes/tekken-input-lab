import { useId, type ReactNode } from 'react';
import { useSectionOpen } from '../../hooks/useSectionOpen';

export interface CollapsibleProps {
  title: ReactNode;
  /** Marker before the title (defaults to the panel's orange square). */
  icon?: ReactNode;
  /** Right side of the header, outside the toggle (e.g. a counter or an action). */
  aside?: ReactNode;
  /** One-line recap shown next to the title while the section is closed. */
  summary?: ReactNode;
  defaultOpen?: boolean;
  /** Remember the open state in localStorage under this key. */
  storageKey?: string;
  className?: string;
  /** Classes of the content area. */
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * Panel with a header that folds its content. The content stays mounted while
 * closed (just hidden), so form fields inside keep their state.
 */
export function Collapsible({ title, icon, aside, summary, defaultOpen = false, storageKey, className = '', bodyClassName = 'flex flex-col gap-4', children }: CollapsibleProps) {
  const [open, setOpen] = useSectionOpen(storageKey, defaultOpen);
  const regionId = useId();
  return (
    <section className={`rounded-[4px] border border-line bg-surface ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span aria-hidden className={`label-sm text-[11px] text-fg-muted transition-transform ${open ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <span className="label-md flex shrink-0 items-center gap-2 text-fg">
            {icon ?? <span aria-hidden className="size-2 rounded-[1px] bg-primary" />}
            {title}
          </span>
          {!open && summary && <span className="label-sm min-w-0 truncate text-[11px] text-fg-muted normal-case">{summary}</span>}
        </button>
        {aside}
      </div>
      <div id={regionId} hidden={!open} className={`border-t border-line-strong p-4 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
