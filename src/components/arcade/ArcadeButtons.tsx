import type { AttackButton } from '../../types/notation';
import { BUTTON_COLORS, COLORS, FONT_SANS } from '../../render/theme';

export interface ArcadeButtonsProps {
  /** Buttons pressed together; all others render inactive. */
  active: readonly AttackButton[];
  /** Cluster size in px (square). */
  size: number;
  x?: number;
  y?: number;
  /** Draw the button numbers inside the circles (off by default, as in the game). */
  showNumbers?: boolean;
}

/**
 * Tilted 2×2 geometry (docs/DESIGN.md → Button cluster), in units of D
 * (center-to-center distance): button radius 0.41·D, outline 0.35·r merged
 * into one black silhouette, right column raised by 0.14·D.
 */
const RADIUS = 0.41;
const OUTLINE = 0.35;
const RAISE = 0.14;
/** Total height in D units: column spacing + raise + outer radius on both ends. */
const EXTENT = 1 + RAISE + 2 * RADIUS * (1 + OUTLINE);

/** Center offsets from the cluster center, in D units: 1 2 / 3 4. */
const LAYOUT: ReadonlyArray<[AttackButton, number, number]> = [
  [1, -0.5, -0.5 + RAISE / 2],
  [2, 0.5, -0.5 - RAISE / 2],
  [3, -0.5, 0.5 + RAISE / 2],
  [4, 0.5, 0.5 - RAISE / 2],
];

export function clusterGeometry(size: number): { d: number; r: number; outline: number } {
  const d = size / EXTENT;
  const r = d * RADIUS;
  return { d, r, outline: r * OUTLINE };
}

export function ArcadeButtons({ active, size, x = 0, y = 0, showNumbers }: ArcadeButtonsProps) {
  const { d, r, outline } = clusterGeometry(size);
  const c = size / 2;
  const numbers = showNumbers ?? false;
  const label = active.length ? `Buttons ${active.join('+')}` : 'No buttons';
  const points = LAYOUT.map(([button, dx, dy]) => [button, c + dx * d, c + dy * d] as const);
  return (
    <g transform={`translate(${x} ${y})`} role="img" aria-label={label}>
      {/* Shared black silhouette: outer circles overlap so no background shows between buttons. */}
      <g fill={COLORS.buttonOutline}>
        {points.map(([button, cx, cy]) => (
          <circle key={button} cx={cx} cy={cy} r={r + outline} />
        ))}
        <rect x={c - d / 2} y={c - d / 2} width={d} height={d} />
      </g>
      {points.map(([button, cx, cy]) => {
        const on = active.includes(button);
        return (
          <g key={button} data-button={button} data-active={on ? 'true' : 'false'}>
            <circle cx={cx} cy={cy} r={r} fill={on ? BUTTON_COLORS[button].fill : COLORS.buttonInactive} />
            {numbers && (
              <text x={cx} y={cy} dy="0.35em" textAnchor="middle" fontFamily={FONT_SANS} fontWeight={700} fontSize={r * 1.05} fill={on ? '#ffffff' : '#8a979a'}>
                {button}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
