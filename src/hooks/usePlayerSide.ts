import { useSyncExternalStore } from 'react';
import { isSide, type Side } from '../render/side';

/** Display preference shared by every arcade display (editor, details, generator, library, export). */
export const SIDE_STORAGE_KEY = 'tekken-input-lab:player-side';

function readStored(): Side {
  try {
    const stored = globalThis.localStorage?.getItem(SIDE_STORAGE_KEY);
    return isSide(stored) ? stored : 'left';
  } catch {
    return 'left';
  }
}

let current: Side = readStored();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

/** Another tab changed the side: follow it so tabs never overwrite each other with stale values. */
function onStorage(event: StorageEvent): void {
  if (event.key !== SIDE_STORAGE_KEY) return;
  const next = isSide(event.newValue) ? event.newValue : 'left';
  if (next === current) return;
  current = next;
  notify();
}

export function getPlayerSide(): Side {
  return current;
}

export function setPlayerSide(side: Side): void {
  if (side === current) return;
  current = side;
  try {
    globalThis.localStorage?.setItem(SIDE_STORAGE_KEY, side);
  } catch {
    // Storage blocked (private mode, quota): keep the choice for this session only.
  }
  notify();
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) globalThis.addEventListener?.('storage', onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) globalThis.removeEventListener?.('storage', onStorage);
  };
}

export function usePlayerSide(): [Side, (side: Side) => void] {
  const side = useSyncExternalStore(subscribe, getPlayerSide, getPlayerSide);
  return [side, setPlayerSide];
}
