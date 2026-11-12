/**
 * Visual constants for the arcade renderer. Everything is applied as SVG
 * attributes (not CSS classes) so exported SVG/PNG files look identical.
 */
export const FONT_SANS = '"Chakra Petch", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

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
  /** Stage separator (>): green triangle as in the in-game command list. */
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

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.x relative luminance of a #rrggbb color. */
function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(h.slice(i, i + 2), 16)));
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

/** WCAG 2.x contrast ratio between two #rrggbb colors (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

/** Label text color for a fill: dark or white, whichever contrasts more (WCAG AA for every arcade fill). */
export function textOn(fill: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(fill)) return COLORS.text;
  return contrastRatio(COLORS.dark, fill) > contrastRatio('#ffffff', fill) ? COLORS.dark : '#ffffff';
}
