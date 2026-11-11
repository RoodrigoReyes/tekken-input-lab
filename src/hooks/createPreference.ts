import { useSyncExternalStore } from 'react';

export interface PreferenceConfig<T> {
  /** localStorage key. */
  key: string;
  /** Turns a stored string (or null) into a valid value; must fall back to the default on anything unexpected. */
  parse: (raw: string | null) => T;
  serialize: (value: T) => string;
}

export interface Preference<T> {
  get: () => T;
  set: (value: T) => void;
  use: () => [T, (value: T) => void];
}

/**
 * A display preference shared by every view: one in-memory value, persisted to
 * localStorage when possible, kept in sync across tabs, read through useSyncExternalStore.
 */
export function createPreference<T>({ key, parse, serialize }: PreferenceConfig<T>): Preference<T> {
  const readStored = (): T => {
    try {
      return parse(globalThis.localStorage?.getItem(key) ?? null);
    } catch {
      return parse(null);
    }
  };

  let current = readStored();
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  /** Another tab changed the value: follow it so tabs never overwrite each other with stale values. */
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    const next = parse(event.newValue);
    if (Object.is(next, current)) return;
    current = next;
    notify();
  };

  const get = () => current;

  const set = (value: T) => {
    if (Object.is(value, current)) return;
    current = value;
    try {
      globalThis.localStorage?.setItem(key, serialize(value));
    } catch {
      // Storage blocked (private mode, quota): keep the choice for this session only.
    }
    notify();
  };

  const subscribe = (listener: () => void) => {
    if (listeners.size === 0) globalThis.addEventListener?.('storage', onStorage);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) globalThis.removeEventListener?.('storage', onStorage);
    };
  };

  const use = (): [T, (value: T) => void] => [useSyncExternalStore(subscribe, get, get), set];

  return { get, set, use };
}
