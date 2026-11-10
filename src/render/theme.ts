/**
 * Visual constants for the arcade renderer. Everything is applied as SVG
 * attributes (not CSS classes) so exported SVG/PNG files look identical.
 */
export const FONT_SANS = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
export const FONT_MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export const COLORS = {
  background: '#0b0d12',
  panel: '#161a23',
  panelStroke: '#2a303d',
  text: '#e6e8ee',
  muted: '#8a93a6',
  dark: '#0b0d12',
  /** Unpressed button (dark, as in the in-game command list). */
  buttonInactive: '#3d4a4c',
  buttonInactiveStroke: '#1b2224',
  /** Arrows are white with a dark outline; held directions get a yellow outline. */
  arrow: '#f4f2ef',
  arrowOutline: '#15191d',
  arrowHeld: '#ffd166',
  /** Stage separator (>) — green triangle as in the in-game command list. */
  stageMarker: '#16d61f',
  named: '#7c5cff',
  movement: '#0284c7',
  stance: '#475569',
  tag: '#22c55e',
  warning: '#f5a524',
  unknown: '#ef4444',
  note: '#94a3b8',
  relation: '#9aa3b5',
  stage: '#e6e8ee',
  bracket: '#64748b',
} as const;

/**
 * Pressed-button colors by position, matching the in-game command list:
 * 1 (top-left) pink, 2 (top-right) teal, 3 (bottom-left) light blue, 4 (bottom-right) magenta.
 */
export const BUTTON_COLORS: Readonly<Record<1 | 2 | 3 | 4, { fill: string; stroke: string }>> = {
  1: { fill: '#ec9ac4', stroke: '#7a3a5c' },
  2: { fill: '#1fc4a6', stroke: '#0c5e50' },
  3: { fill: '#64b4e4', stroke: '#235a7a' },
  4: { fill: '#d93a78', stroke: '#6e1638' },
};

/** Event colors by mechanic id. */
export const EVENT_COLORS: Readonly<Record<string, string>> = {
  bound: '#f97316',
  screw: '#06b6d4',
  tornado: '#14b8a6',
  wallSplat: '#eab308',
  wallBreak: '#a855f7',
  floorBreak: '#b45309',
  balconyBreak: '#db2777',
  wallBlast: '#e11d48',
  floorBlast: '#be123c',
  wallBound: '#ca8a04',
  tagAssault: '#16a34a',
};

export const MECHANIC_COLORS: Readonly<Record<string, string>> = {
  rageArt: '#dc2626',
  rageDrive: '#b91c1c',
  heatBurst: '#ea580c',
  heatSmash: '#ea580c',
  heatDash: '#ea580c',
  heatEngager: '#ea580c',
};

/** Readable text color for a given fill. */
export function textOn(fill: string): string {
  const hex = fill.replace('#', '');
  if (hex.length !== 6) return COLORS.text;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? COLORS.dark : '#ffffff';
}
