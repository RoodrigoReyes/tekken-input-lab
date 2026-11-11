/**
 * Which side of the screen the player stands on. Notation is always written
 * for the 1P side (forward = right); on the 2P side the game mirrors the
 * forward/back arrows, so the display does the same.
 */
export type Side = 'left' | 'right';

export const SIDES: readonly Side[] = ['left', 'right'];

export function isSide(value: unknown): value is Side {
  return value === 'left' || value === 'right';
}
