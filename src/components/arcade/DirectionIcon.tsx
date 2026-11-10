import type { Direction } from '../../types/notation';
import { COLORS } from '../../render/theme';

export interface DirectionIconProps {
  direction: Direction;
  /** Held directions (uppercase in notation) render as solid yellow arrows. */
  held?: boolean;
  size: number;
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

/** Arrow pointing right inside a unit box (0..1). */
const ARROW_PATH = 'M0.14 0.42 H0.56 V0.22 L0.88 0.5 L0.56 0.78 V0.58 H0.14 Z';

export function DirectionIcon({ direction, held = false, size, x = 0, y = 0 }: DirectionIconProps) {
  const label = held ? `hold ${direction}` : direction;
  if (direction === 'n') {
    return (
      <g transform={`translate(${x} ${y})`} role="img" aria-label="neutral">
        <circle cx={size / 2} cy={size / 2} r={size * 0.16} fill={COLORS.arrow} />
        <circle cx={size / 2} cy={size / 2} r={size * 0.3} fill="none" stroke={COLORS.arrow} strokeWidth={size * 0.05} />
      </g>
    );
  }
  const angle = DIRECTION_ANGLE[direction];
  return (
    <g transform={`translate(${x} ${y})`} role="img" aria-label={label} data-direction={direction}>
      <g transform={`rotate(${angle} ${size / 2} ${size / 2}) scale(${size})`}>
        <path
          d={ARROW_PATH}
          fill={held ? COLORS.arrowHeld : 'none'}
          stroke={held ? COLORS.arrowHeld : COLORS.arrow}
          strokeWidth={0.07}
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}
