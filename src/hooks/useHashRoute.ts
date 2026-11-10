import { useCallback, useEffect, useState } from 'react';

export type Route =
  | { name: 'library' }
  | { name: 'new' }
  | { name: 'details'; id: string }
  | { name: 'edit'; id: string };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '');
  const edit = /^\/combo\/([^/]+)\/edit$/.exec(path);
  if (edit?.[1]) return { name: 'edit', id: decodeURIComponent(edit[1]) };
  const details = /^\/combo\/([^/]+)$/.exec(path);
  if (details?.[1]) return { name: 'details', id: decodeURIComponent(details[1]) };
  if (path === '/new') return { name: 'new' };
  return { name: 'library' };
}

export const paths = {
  library: () => '#/',
  new: () => '#/new',
  details: (id: string) => `#/combo/${encodeURIComponent(id)}`,
  edit: (id: string) => `#/combo/${encodeURIComponent(id)}/edit`,
};

/** Minimal hash router (no dependency). */
export function useHashRoute(): [Route, (hash: string) => void] {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const navigate = useCallback((hash: string) => {
    window.location.hash = hash;
  }, []);
  return [route, navigate];
}
