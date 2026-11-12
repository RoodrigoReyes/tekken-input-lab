import { useState, useSyncExternalStore } from 'react';
import { createPreference, type Preference } from './createPreference';

/** localStorage prefix for remembered open/closed sections. */
export const SECTION_STORAGE_PREFIX = 'tekken-input-lab:section:';

const preferences = new Map<string, Preference<boolean>>();

/** One shared preference per section key (created on first use, with that caller's default). */
function sectionPreference(key: string, defaultOpen: boolean): Preference<boolean> {
  const existing = preferences.get(key);
  if (existing) return existing;
  const created = createPreference<boolean>({
    key: `${SECTION_STORAGE_PREFIX}${key}`,
    parse: (raw) => (raw === 'open' ? true : raw === 'closed' ? false : defaultOpen),
    serialize: (open) => (open ? 'open' : 'closed'),
  });
  preferences.set(key, created);
  return created;
}

const NO_SUBSCRIPTION = () => () => {};

/**
 * Open state of a collapsible section. With a storage key the choice is remembered
 * (and shared by every section using that key); without one it lives in the component.
 */
export function useSectionOpen(storageKey: string | undefined, defaultOpen: boolean): [boolean, (open: boolean) => void] {
  const preference = storageKey ? sectionPreference(storageKey, defaultOpen) : undefined;
  const [local, setLocal] = useState(defaultOpen);
  const snapshot = preference ? preference.get : () => local;
  const open = useSyncExternalStore(preference ? preference.subscribe : NO_SUBSCRIPTION, snapshot, snapshot);
  return [open, preference ? preference.set : setLocal];
}
