import { useMemo } from 'react';
import { LinkButton } from './components/ui/Button';
import { ToastProvider } from './components/ui/Toast';
import { DetailsView } from './features/details/DetailsView';
import { EditorView } from './features/editor/EditorView';
import { ExportButtons } from './features/export/ExportButtons';
import { LibraryView } from './features/library/LibraryView';
import { RepositoryProvider } from './hooks/useCombos';
import { paths, useHashRoute } from './hooks/useHashRoute';
import { createDexieRepository } from './storage/comboRepository';

function Logo() {
  return (
    <a href={paths.library()} className="flex items-center gap-2 font-extrabold tracking-tight">
      <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
        <circle cx="10" cy="10" r="6" fill="#ec9ac4" />
        <circle cx="22" cy="10" r="6" fill="#1fc4a6" />
        <circle cx="10" cy="22" r="6" fill="#64b4e4" />
        <circle cx="22" cy="22" r="6" fill="#d93a78" />
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
            <div className="flex items-center justify-between px-3 py-3 sm:px-4">
              <Logo />
              {route.name !== 'new' && (
                <LinkButton href={paths.new()} size="sm" variant="primary">
                  + New
                </LinkButton>
              )}
            </div>
          </header>
          <main className="w-full px-2 py-4 sm:px-4">
            {route.name === 'library' && <LibraryView />}
            {route.name === 'new' && <EditorView key="new" id={null} navigate={navigate} />}
            {route.name === 'edit' && <EditorView key={`edit-${route.id}`} id={route.id} navigate={navigate} />}
            {route.name === 'details' && <DetailsView key={route.id} id={route.id} navigate={navigate} renderExtraActions={(props) => <ExportButtons {...props} />} />}
          </main>
        </div>
      </ToastProvider>
    </RepositoryProvider>
  );
}
