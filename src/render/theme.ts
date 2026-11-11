/**
 * Visual constants for the arcade renderer. Everything is applied as SVG
 * attributes (not CSS classes) so exported SVG/PNG files look identical.
 */
export const FONT_SANS = 'Archivo, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
export const FONT_MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
/** Arcade labels use Archivo SemiCondensed so long captions fit compact tiles. */
export const FONT_STRETCH = '87.5%';

export const COLORS = {
  background: '#0e1013',
  panel: '#161a23',
  panelStroke: '#2a303d',
  text: '#e9e7e2',
  muted: '#8b93a0',
  dark: '#08090b',
  /** Unpressed button (dark, as in the in-game command list). */
  buttonInactive: '#3d4a4c',
  /** Every button sits inside one merged black silhouette. */
  buttonOutline: '#000000',
  /** Arrows are white with a dark outline; held directions get a yellow outline. */
  arrow: '#f4f2ef',
  arrowOutline: '#15191d',
  arrowHeld: '#ffd166',
  /** Neutral (n): solid white star, no outline. */
  neutralStar: '#ffffff',
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
  stage: '#e9e7e2',
  bracket: '#64748b',
} as const;

/**
 * Pressed-button colors by position, matching the in-game command list:
 * 1 (top-left) pink, 2 (top-right) teal, 3 (bottom-left) lavender blue, 4 (bottom-right) coral red.
 * Flat fills; the outline is the shared black silhouette (COLORS.buttonOutline).
 */
export const BUTTON_COLORS: Readonly<Record<1 | 2 | 3 | 4, { fill: string }>> = {
  1: { fill: '#de7fb7' },
  2: { fill: '#29b1a9' },
  3: { fill: '#7996ca' },
  4: { fill: '#f14b46' },
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
  rageDrive: '#dc2626',
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
