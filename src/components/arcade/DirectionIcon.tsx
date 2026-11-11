import type { Direction } from '../../types/notation';
import type { Side } from '../../render/side';
import { COLORS } from '../../render/theme';

export interface DirectionIconProps {
  direction: Direction;
  /** Held directions (uppercase in notation) keep the white arrow with a yellow outline. */
  held?: boolean;
  size: number;
  /** 2P side mirrors forward/back (the notation direction itself is unchanged). */
  side?: Side;
  x?: number;
  y?: number;
}

/** Rotation (deg) from an arrow pointing right (forward). SVG y grows downward. */
export const DIRECTION_ANGLE: Readonly<Record<Exclude<Direction, 'n'>, number>> = {
  f: 0,
  df: 45,
  d: 90,
  db: 135,
  b: 180,
  ub: 225,
  u: 270,
  uf: 315,
};

/** On-screen rotation for a notation direction; the 2P side mirrors it horizontally. */
export function directionAngle(direction: Exclude<Direction, 'n'>, side: Side): number {
  const angle = DIRECTION_ANGLE[direction];
  return side === 'right' ? (540 - angle) % 360 : angle;
}

/** Arrow pointing right inside a unit box (0..1). */
const ARROW_PATH = 'M0.14 0.42 H0.56 V0.22 L0.88 0.5 L0.56 0.78 V0.58 H0.14 Z';

export function DirectionIcon({ direction, held = false, size, side = 'left', x = 0, y = 0 }: DirectionIconProps) {
  // Accessible name and data-direction stay in notation terms (what the player reads and types);
  // only the drawing is mirrored on the 2P side.
  const label = held ? `hold ${direction}` : direction;
  if (direction === 'n') {
    return (
      <g transform={`translate(${x} ${y})`} role="img" aria-label="neutral">
        <circle cx={size / 2} cy={size / 2} r={size * 0.3} fill="none" stroke={COLORS.arrowOutline} strokeWidth={size * 0.11} />
        <circle cx={size / 2} cy={size / 2} r={size * 0.3} fill="none" stroke={COLORS.arrow} strokeWidth={size * 0.06} />
        <circle cx={size / 2} cy={size / 2} r={size * 0.15} fill={COLORS.arrow} stroke={COLORS.arrowOutline} strokeWidth={size * 0.03} />
      </g>
    );
  }
  const angle = directionAngle(direction, side);
  return (
    <g transform={`translate(${x} ${y})`} role="img" aria-label={label} data-direction={direction}>
      <g transform={`rotate(${angle} ${size / 2} ${size / 2}) scale(${size})`}>
        <path
          d={ARROW_PATH}
          fill={COLORS.arrow}
          stroke={held ? COLORS.arrowHeld : COLORS.arrowOutline}
          strokeWidth={held ? 0.09 : 0.07}
          strokeLinejoin="round"
          paintOrder="stroke"
        />
      </g>
    </g>
  );
}
