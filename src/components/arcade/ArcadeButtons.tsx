import type { AttackButton } from '../../types/notation';
import { COLORS, FONT_SANS } from '../../render/theme';

export interface ArcadeButtonsProps {
  /** Buttons pressed together; all others render inactive. */
  active: readonly AttackButton[];
  /** Cluster size in px (square). */
  size: number;
  x?: number;
  y?: number;
  /** Draw the button numbers inside the circles. Defaults to size >= 34. */
  showNumbers?: boolean;
}

/** Arcade 2×2 layout:  1 2 / 3 4. Red = pressed. */
const LAYOUT: ReadonlyArray<[AttackButton, number, number]> = [
  [1, 0.27, 0.27],
  [2, 0.73, 0.27],
  [3, 0.27, 0.73],
  [4, 0.73, 0.73],
];

export function ArcadeButtons({ active, size, x = 0, y = 0, showNumbers }: ArcadeButtonsProps) {
  const r = size * 0.21;
  const numbers = showNumbers ?? size >= 34;
  const label = active.length ? `Buttons ${active.join('+')}` : 'No buttons';
  return (
    <g transform={`translate(${x} ${y})`} role="img" aria-label={label}>
      {LAYOUT.map(([button, cx, cy]) => {
        const on = active.includes(button);
        return (
          <g key={button} data-button={button} data-active={on ? 'true' : 'false'}>
            <circle
              cx={cx * size}
              cy={cy * size}
              r={r}
              fill={on ? COLORS.buttonActive : COLORS.buttonInactive}
              stroke={on ? COLORS.buttonActiveStroke : COLORS.buttonInactiveStroke}
              strokeWidth={Math.max(1, size * 0.035)}
            />
            {numbers && (
              <text
                x={cx * size}
                y={cy * size}
                dy="0.35em"
                textAnchor="middle"
                fontFamily={FONT_SANS}
                fontWeight={700}
                fontSize={r * 1.05}
                fill={on ? '#ffffff' : '#5b6170'}
              >
                {button}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
