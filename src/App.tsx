import { useMemo } from 'react';
import { LinkButton } from './components/ui/Button';
import { ToastProvider } from './components/ui/Toast';
import { DetailsView } from './features/details/DetailsView';
import { EditorView } from './features/editor/EditorView';
import { LibraryView } from './features/library/LibraryView';
import { RepositoryProvider } from './hooks/useCombos';
import { paths, useHashRoute } from './hooks/useHashRoute';
import { createDexieRepository } from './storage/comboRepository';

function Logo() {
  return (
    <a href={paths.library()} className="flex items-center gap-2 font-extrabold tracking-tight">
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
        <circle cx="10" cy="10" r="6" fill="#e0262b" />
        <circle cx="22" cy="10" r="6" fill="#cfd3dc" />
        <circle cx="10" cy="22" r="6" fill="#cfd3dc" />
        <circle cx="22" cy="22" r="6" fill="#e0262b" />
      </svg>
      TekkenInputLab
    </a>
  );
}

export function App() {
  const repository = useMemo(() => createDexieRepository(), []);
  const [route, navigate] = useHashRoute();

  return (
    <RepositoryProvider repository={repository}>
      <ToastProvider>
        <div className="min-h-screen">
          <header className="sticky top-0 z-20 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
              <Logo />
              {route.name !== 'new' && (
                <LinkButton href={paths.new()} size="sm" variant="primary">
                  + New
                </LinkButton>
              )}
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-6">
            {route.name === 'library' && <LibraryView />}
            {route.name === 'new' && <EditorView id={null} navigate={navigate} />}
            {route.name === 'edit' && <EditorView id={route.id} navigate={navigate} />}
            {route.name === 'details' && <DetailsView id={route.id} navigate={navigate} />}
          </main>
        </div>
      </ToastProvider>
    </RepositoryProvider>
  );
}
