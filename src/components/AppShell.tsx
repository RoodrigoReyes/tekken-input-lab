import type { ReactNode } from 'react';
import { ArcadeButtons } from './arcade/ArcadeButtons';
import { LinkButton } from './ui/Button';
import { paths, type Route } from '../hooks/useHashRoute';

/** Logo: the tilted arcade button cluster with all four buttons lit. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <ArcadeButtons active={[1, 2, 3, 4]} size={size} />
    </svg>
  );
}

interface NavItem {
  label: string;
  /** Shorter label for the phone nav row; the full label stays the accessible name. */
  short?: string;
  href: string;
  match: ReadonlyArray<Route['name']>;
}

const NAV: readonly NavItem[] = [
  { label: 'Home', href: paths.home(), match: ['home'] },
  { label: 'Library', href: paths.library(), match: ['library', 'details'] },
  { label: 'TTT2 Generator', short: 'Generator', href: paths.generator(), match: ['generator'] },
];

export interface AppShellProps {
  route: Route;
  children: ReactNode;
}

/**
 * Sticky top bar and the full-width content area. Phones get two rows: logo and "+ New" on top,
 * then the navigation as three full-width 44px tabs; from sm up everything sits on one row.
 */
export function AppShell({ route, children }: AppShellProps) {
  const showNew = route.name !== 'new' && route.name !== 'home';
  return (
    <div className="min-h-screen bg-neutral">
      <header className="sticky top-0 z-20 border-b border-line-strong bg-neutral">
        <div className="flex flex-wrap items-center justify-between gap-x-3 px-2 sm:h-14 sm:flex-nowrap sm:gap-6 sm:px-4">
          <a href={paths.home()} className="flex h-14 min-w-11 shrink-0 items-center justify-center gap-2.5" aria-label="TekkenInputLab home">
            <LogoMark />
            <span className="hidden text-[20px] font-bold tracking-[0.02em] text-fg uppercase min-[360px]:inline">TekkenInputLab</span>
          </a>
          {/* The single "create" entry point (home has its own large card for it). Before the nav in the DOM so phones tab in visual order. */}
          {showNew && (
            <LinkButton href={paths.new()} variant="primary" aria-label="New combo" className="sm:order-last">
              + New
            </LinkButton>
          )}
          <nav aria-label="Main" className="order-last -mx-2 grid w-[calc(100%+1rem)] grid-cols-3 border-t border-line-strong sm:order-none sm:mx-0 sm:flex sm:w-auto sm:flex-1 sm:gap-1 sm:border-0">
            {NAV.map((item) => {
              const current = item.match.includes(route.name);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={current ? 'page' : undefined}
                  aria-label={item.short ? item.label : undefined}
                  className={`label-md flex h-11 items-center justify-center px-3 whitespace-nowrap transition-colors sm:rounded-lg ${
                    current ? 'bg-muted text-fg' : 'text-fg-muted hover:bg-muted/60 hover:text-fg'
                  }`}
                >
                  {item.short ? (
                    <>
                      <span className="sm:hidden">{item.short}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </a>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="w-full px-2 py-5 sm:px-4 sm:py-6">{children}</main>
    </div>
  );
}
