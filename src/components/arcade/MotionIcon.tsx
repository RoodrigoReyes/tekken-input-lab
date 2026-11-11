import type { Direction, MotionId } from '../../types/notation';
import type { Side } from '../../render/side';
import { COLORS, FONT_SANS } from '../../render/theme';
import { DirectionIcon } from './DirectionIcon';

export interface MotionIconProps {
  motion: MotionId;
  sequence: readonly Direction[];
  width: number;
  height: number;
  /** Base unit size. */
  size: number;
  side?: Side;
  x?: number;
  y?: number;
}

/** Compact motion pill: mini arrows for the motion plus its abbreviation. */
export function MotionIcon({ motion, sequence, width, height, size, side = 'left', x = 0, y = 0 }: MotionIconProps) {
  const arrow = size * 0.34;
  const totalArrows = sequence.length * arrow;
  const startX = (width - totalArrows) / 2;
  const arrowsY = height * 0.16;
  return (
    <g transform={`translate(${x} ${y})`} role="img" aria-label={motion}>
      <rect x={0} y={height * 0.08} width={width} height={height * 0.84} rx={height * 0.2} fill="#1f2533" stroke={COLORS.panelStroke} />
      {sequence.map((dir, i) => (
        <DirectionIcon key={i} direction={dir} size={arrow} side={side} x={startX + i * arrow} y={arrowsY} />
      ))}
      <text
        x={width / 2}
        y={height * 0.78}
        textAnchor="middle"
        fontFamily={FONT_SANS}
        fontWeight={700}
        fontSize={size * 0.24}
        fill={COLORS.text}
      >
        {motion}
      </text>
    </g>
  );
}
