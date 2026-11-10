import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ComboRepository } from '../storage/comboRepository';
import type { Combo } from '../types/combo';

const RepositoryContext = createContext<ComboRepository | null>(null);

export function RepositoryProvider({ repository, children }: { repository: ComboRepository; children: ReactNode }) {
  return <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>;
}

export function useRepository(): ComboRepository {
  const repo = useContext(RepositoryContext);
  if (!repo) throw new Error('useRepository must be used inside <RepositoryProvider>');
  return repo;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected error';
}

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Load data from the repository. A request counter discards out-of-order
 * responses (e.g. rapid toggles) and results that arrive after unmount or
 * after the key (id) changed.
 */
function useRepositoryQuery<T>(load: () => Promise<T>, initial: T, label: string): AsyncState<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  const reload = useCallback(async () => {
    const request = ++latest.current;
    try {
      const value = await load();
      if (request !== latest.current) return;
      setData(value);
      setError(null);
    } catch (e) {
      if (request !== latest.current) return;
      setError(`${label}: ${errorMessage(e)}`);
    } finally {
      if (request === latest.current) setLoading(false);
    }
  }, [load, label]);

  useEffect(() => {
    setLoading(true);
    void reload();
    return () => {
      latest.current++; // invalidate in-flight requests
    };
  }, [reload]);

  return { data, loading, error, reload };
}

/** All combos, newest first. */
export function useCombos(): AsyncState<Combo[]> {
  const repo = useRepository();
  const load = useCallback(() => repo.findAll(), [repo]);
  return useRepositoryQuery<Combo[]>(load, [], 'Could not load your combos');
}

/** One combo by id (null when missing or when id is null). Mount with key={id}. */
export function useCombo(id: string | null): AsyncState<Combo | null> {
  const repo = useRepository();
  const load = useCallback(() => (id === null ? Promise.resolve(null) : repo.findById(id)), [repo, id]);
  return useRepositoryQuery<Combo | null>(load, null, 'Could not load this combo');
}
