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
  buttonActive: '#e0262b',
  buttonActiveStroke: '#ff7a7a',
  buttonInactive: '#cfd3dc',
  buttonInactiveStroke: '#8f96a3',
  arrow: '#f2f4f8',
  arrowHeld: '#ffd166',
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
