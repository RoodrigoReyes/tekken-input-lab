/**
 * Text width measurement. Uses a canvas in the browser; falls back to a
 * deterministic estimate elsewhere (tests, SSR) so layout stays pure.
 */
import { FONT_SANS } from './theme';

export type MeasureFn = (text: string, fontSize: number, weight?: number) => number;

const cache = new Map<string, number>();
let ctx: CanvasRenderingContext2D | null | undefined;

function canvasContext(): CanvasRenderingContext2D | null {
  if (ctx !== undefined) return ctx;
  try {
    ctx = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
  } catch {
    ctx = null;
  }
  return ctx;
}

export const estimateText: MeasureFn = (text, fontSize, weight = 400) =>
  text.length * fontSize * (weight >= 600 ? 0.64 : 0.58);

export const measureText: MeasureFn = (text, fontSize, weight = 400) => {
  const key = `${weight}|${fontSize}|${text}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const c = canvasContext();
  let width: number;
  if (c) {
    c.font = `${weight} ${fontSize}px ${FONT_SANS}`;
    width = c.measureText(text).width;
  } else {
    width = estimateText(text, fontSize, weight);
  }
  cache.set(key, width);
  return width;
};
