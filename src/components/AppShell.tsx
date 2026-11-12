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
 * Top bar with the logo; the navigation sits beside it from sm up and becomes a bottom tab bar on phones
 * (thumb reach, frees the top). The editor hides the tab bar on phones: its save bar takes that place.
 */
export function AppShell({ route, children }: AppShellProps) {
  const showNew = route.name !== 'new' && route.name !== 'home';
  const editing = route.name === 'new' || route.name === 'edit';
  return (
    <div className="min-h-screen bg-neutral">
      <header className="sticky top-0 z-20 border-b border-line-strong bg-neutral">
        <div className="flex h-14 items-center gap-6 px-2 sm:px-4">
          <a href={paths.home()} className="flex h-14 min-w-11 shrink-0 items-center gap-2.5" aria-label="Tekken Input Lab home">
            <LogoMark />
            <span className="text-[20px] font-bold tracking-[0.02em] text-fg uppercase">Tekken Input Lab</span>
          </a>
          <nav
            aria-label="Main"
            className={`fixed inset-x-0 bottom-0 z-20 grid auto-cols-fr grid-flow-col border-t border-line-strong bg-neutral pb-[env(safe-area-inset-bottom)] sm:static sm:flex sm:flex-1 sm:items-center sm:gap-1 sm:border-0 sm:pb-0 ${editing ? 'max-sm:hidden' : ''}`}
          >
            {NAV.map((item) => {
              const current = item.match.includes(route.name);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={current ? 'page' : undefined}
                  aria-label={item.short ? item.label : undefined}
                  className={`label-md flex h-14 items-center justify-center px-3 whitespace-nowrap transition-colors sm:h-11 sm:rounded-lg ${
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
            {/* The single "create" entry point (home has its own large card for it). */}
            {showNew && (
              <LinkButton href={paths.new()} variant="primary" aria-label="New combo" className="m-1.5 h-auto! whitespace-nowrap sm:m-0 sm:ml-auto sm:h-11!">
                + New
              </LinkButton>
            )}
          </nav>
        </div>
      </header>
      <main className="w-full px-2 pt-5 pb-24 sm:px-4 sm:py-6">{children}</main>
    </div>
  );
}
