import { isSide, type Side } from '../render/side';
import { createPreference } from './createPreference';

/** Display preference shared by every arcade display (editor, details, generator, library, export). */
export const SIDE_STORAGE_KEY = 'tekken-input-lab:player-side';

const preference = createPreference<Side>({
  key: SIDE_STORAGE_KEY,
  parse: (raw) => (isSide(raw) ? raw : 'left'),
  serialize: (side) => side,
});

export const getPlayerSide = preference.get;
export const setPlayerSide = preference.set;

export function usePlayerSide(): [Side, (side: Side) => void] {
  return preference.use();
}
