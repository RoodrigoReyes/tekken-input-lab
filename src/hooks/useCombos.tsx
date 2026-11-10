import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
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

/** All combos, newest first. */
export function useCombos(): AsyncState<Combo[]> {
  const repo = useRepository();
  const [data, setData] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      setData(await repo.findAll());
      setError(null);
    } catch (e) {
      setError(`Could not load your combos: ${errorMessage(e)}`);
    } finally {
      setLoading(false);
    }
  }, [repo]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}

/** One combo by id (null when missing). */
export function useCombo(id: string | null): AsyncState<Combo | null> {
  const repo = useRepository();
  const [data, setData] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    if (id === null) {
      setLoading(false);
      return;
    }
    try {
      setData(await repo.findById(id));
      setError(null);
    } catch (e) {
      setError(`Could not load this combo: ${errorMessage(e)}`);
    } finally {
      setLoading(false);
    }
  }, [repo, id]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, loading, error, reload };
}
