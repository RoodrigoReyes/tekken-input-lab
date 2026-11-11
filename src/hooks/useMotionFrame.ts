import { createPreference } from './createPreference';

/** Whether motion inputs (qcf, cd, ff, …) are drawn inside a frame. Off by default: bare arrows. */
export const MOTION_FRAME_STORAGE_KEY = 'tekken-input-lab:motion-frame';

const preference = createPreference<boolean>({
  key: MOTION_FRAME_STORAGE_KEY,
  parse: (raw) => raw === 'on',
  serialize: (framed) => (framed ? 'on' : 'off'),
});

export const getMotionFrame = preference.get;
export const setMotionFrame = preference.set;

export function useMotionFrame(): [boolean, (framed: boolean) => void] {
  return preference.use();
}
