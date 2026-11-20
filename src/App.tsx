import { lazy, Suspense, useMemo } from 'react';
import { AppShell } from './components/AppShell';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { DetailsView } from './features/details/DetailsView';
import { EditorView } from './features/editor/EditorView';
import { HomeView } from './features/home/HomeView';
import { ExportButtons } from './features/export/ExportButtons';
import { LibraryView } from './features/library/LibraryView';
import { SharedView } from './features/share/SharedView';
import { OverlayView } from './features/share/OverlayView';
import { ImportUrlView } from './features/import/ImportUrlView';
import { RepositoryProvider } from './hooks/useCombos';
import { useHashRoute } from './hooks/useHashRoute';
import { createDexieRepository } from './storage/comboRepository';

/** Loaded on demand: the generator bundles the TTT2 guide. */
const GeneratorView = lazy(() => import('./features/generator/GeneratorView').then((m) => ({ default: m.GeneratorView })));
const ExploreView = lazy(() => import('./features/explore/ExploreView').then((m) => ({ default: m.ExploreView })));

export function App() {
  const repository = useMemo(() => createDexieRepository(), []);
  const [route, navigate] = useHashRoute();

  if (route.name === 'overlay') return <OverlayView payload={route.payload} size={route.size} side={route.side} />;

  return (
    <RepositoryProvider repository={repository}>
      <ToastProvider>
        <AppShell route={route}>
          {route.name === 'home' && <HomeView />}
          {route.name === 'library' && <LibraryView />}
          {route.name === 'explore' && (
            <ErrorBoundary what="Explore">
              <Suspense fallback={<p className="label-sm text-fg-muted">Loading Explore…</p>}>
                <ExploreView />
              </Suspense>
            </ErrorBoundary>
          )}
          {route.name === 'new' && <EditorView key="new" id={null} navigate={navigate} />}
          {route.name === 'edit' && <EditorView key={`edit-${route.id}`} id={route.id} navigate={navigate} />}
          {route.name === 'details' && <DetailsView key={route.id} id={route.id} navigate={navigate} renderExtraActions={(props) => <ExportButtons {...props} />} />}
          {route.name === 'shared' && <SharedView key={route.payload} payload={route.payload} navigate={navigate} />}
          {route.name === 'import' && <ImportUrlView key={route.url} url={route.url} />}
          {route.name === 'generator' && (
            <ErrorBoundary what="the generator">
              <Suspense fallback={<p className="label-sm text-fg-muted">Loading the generator…</p>}>
                <GeneratorView navigate={navigate} />
              </Suspense>
            </ErrorBoundary>
          )}
        </AppShell>
      </ToastProvider>
    </RepositoryProvider>
  );
}
