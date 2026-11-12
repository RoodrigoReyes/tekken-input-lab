import { useId, type ReactNode } from 'react';
import { useSectionOpen } from '../../hooks/useSectionOpen';

export interface CollapsibleProps {
  title: ReactNode;
  /** Marker before the title (defaults to the panel's neutral square). */
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
 * The toggle sits in an h2 (accordion pattern); when title and aside do not fit on one line, the aside wraps below.
 */
export function Collapsible({
  title,
  icon,
  aside,
  summary,
  defaultOpen = false,
  storageKey,
  className = '',
  bodyClassName = 'flex flex-col gap-4',
  children,
}: CollapsibleProps) {
  const [open, setOpen] = useSectionOpen(storageKey, defaultOpen);
  const regionId = useId();
  return (
    <section className={`min-w-0 rounded-lg border border-line bg-surface ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 px-4 py-0.5">
        <h2 className="flex min-w-0 flex-[1_1_auto]">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={regionId}
            onClick={() => setOpen(!open)}
            className="flex min-h-10 w-full min-w-0 items-center gap-2 text-left pointer-coarse:min-h-11"
          >
            <span aria-hidden className={`label-sm text-fg-muted transition-transform ${open ? 'rotate-90' : ''}`}>
              ▶
            </span>
            <span className="label-md flex items-center gap-2 text-fg">
              {icon ?? <span aria-hidden className="size-2 shrink-0 rounded-xs bg-fg-muted" />}
              {title}
            </span>
            {!open && summary && (
              <span aria-hidden className="label-sm min-w-0 flex-1 truncate text-fg-muted normal-case">
                {summary}
              </span>
            )}
          </button>
        </h2>
        {aside && <div className="flex min-h-10 items-center pointer-coarse:min-h-11">{aside}</div>}
      </div>
      <div id={regionId} hidden={!open} className={`border-t border-line-strong p-4 ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
