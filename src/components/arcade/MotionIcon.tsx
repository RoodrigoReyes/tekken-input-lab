import type { Direction, MotionId } from '../../types/notation';
import type { Side } from '../../render/side';
import { COLORS } from '../../render/theme';
import { DirectionIcon } from './DirectionIcon';

export interface MotionIconProps {
  /** Only used as the accessible name; the icon shows arrows, never letters. */
  motion: MotionId;
  sequence: readonly Direction[];
  width: number;
  height: number;
  /** Size of each arrow. */
  arrow: number;
  /** Space between arrows. */
  gap?: number;
  /** Draw a compact pill behind the arrows; off by default (arrows look like plain inputs). */
  framed?: boolean;
  side?: Side;
  x?: number;
  y?: number;
}

/** Motion input (qcf, cd, ff, …) drawn as its arrows only, like the in-game display; optionally framed. */
export function MotionIcon({ motion, sequence, width, height, arrow, gap = 0, framed = false, side = 'left', x = 0, y = 0 }: MotionIconProps) {
  const span = sequence.length * arrow + Math.max(0, sequence.length - 1) * gap;
  const startX = (width - span) / 2;
  const arrowsY = (height - arrow) / 2;
  return (
    <g transform={`translate(${x} ${y})`} role="img" aria-label={motion}>
      {framed && <rect x={0} y={height * 0.08} width={width} height={height * 0.84} rx={height * 0.2} fill="#1f2533" stroke={COLORS.panelStroke} />}
      {sequence.map((dir, i) => (
        <DirectionIcon key={i} direction={dir} size={arrow} side={side} x={startX + i * (arrow + gap)} y={arrowsY} />
      ))}
    </g>
  );
}
