import { useCallback, useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'library' }
  | { name: 'explore' }
  | { name: 'new' }
  | { name: 'generator' }
  | { name: 'shared'; payload: string }
  | { name: 'overlay'; payload: string; size: number; side: '1p' | '2p' }
  | { name: 'import'; url: string }
  | { name: 'details'; id: string }
  | { name: 'edit'; id: string };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, '');
  const separator = path.indexOf('?');
  const pathname = separator < 0 ? path : path.slice(0, separator);
  const query = separator < 0 ? '' : path.slice(separator + 1);
  if (pathname === '/overlay') return { name: 'overlay', ...parseOverlayParams(query) };
  if (pathname === '/shared') return { name: 'shared', payload: new URLSearchParams(query).get('d') ?? '' };
  if (pathname === '/import') return { name: 'import', url: new URLSearchParams(query).get('url') ?? '' };
  const edit = /^\/combo\/([^/]+)\/edit$/.exec(path);
  if (edit?.[1]) return { name: 'edit', id: decodeURIComponent(edit[1]) };
  const details = /^\/combo\/([^/]+)$/.exec(path);
  if (details?.[1]) return { name: 'details', id: decodeURIComponent(details[1]) };
  if (path === '/new') return { name: 'new' };
  if (path === '/generator') return { name: 'generator' };
  if (path === '/library') return { name: 'library' };
  if (path === '/explore') return { name: 'explore' };
  return { name: 'home' };
}

export function parseOverlayParams(query: string): { payload: string; size: number; side: '1p' | '2p' } {
  const params = new URLSearchParams(query);
  const requestedSize = Number(params.get('size'));
  return {
    payload: params.get('d') ?? '',
    size: Number.isFinite(requestedSize) && params.has('size') ? Math.max(20, Math.min(72, requestedSize)) : 48,
    side: params.get('side') === '2p' ? '2p' : '1p',
  };
}

export const paths = {
  home: () => '#/',
  library: () => '#/library',
  explore: () => '#/explore',
  new: () => '#/new',
  generator: () => '#/generator',
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
