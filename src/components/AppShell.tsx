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

const NAV: ReadonlyArray<{ label: string; href: string; match: ReadonlyArray<Route['name']> }> = [
  { label: 'Library', href: paths.library(), match: ['library', 'details'] },
  { label: 'TTT2 Generator', href: paths.generator(), match: ['generator'] },
];

export interface AppShellProps {
  route: Route;
  children: ReactNode;
}

/** Sticky top bar (logo, wordmark, navigation, "+ New") and the full-width content area. */
export function AppShell({ route, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-neutral">
      <header className="sticky top-0 z-20 border-b border-line-strong bg-neutral">
        <div className="flex h-14 items-center justify-between gap-3 px-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-4 sm:gap-6">
            <a href={paths.library()} className="flex shrink-0 items-center gap-2.5" aria-label="TekkenInputLab — Combo Library">
              <LogoMark />
              <span className="font-condensed hidden text-[20px] font-extrabold tracking-[0.02em] text-fg uppercase min-[420px]:inline">TekkenInputLab</span>
            </a>
            <nav aria-label="Main" className="flex items-center gap-1">
              {NAV.map((item) => {
                const current = item.match.includes(route.name);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    aria-current={current ? 'page' : undefined}
                    className={`label-md rounded-[4px] px-2.5 py-1.5 whitespace-nowrap transition-colors ${current ? 'bg-muted text-fg' : 'text-fg-muted hover:text-fg'}`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
          {route.name !== 'new' && (
            <LinkButton href={paths.new()} variant="primary" aria-label="New combo">
              + New
            </LinkButton>
          )}
        </div>
      </header>
      <main className="w-full px-2 py-5 sm:px-4 sm:py-6">{children}</main>
    </div>
  );
}
