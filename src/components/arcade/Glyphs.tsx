/** Small SVG glyphs used inside item boxes. All coordinates are local to the box. */
import type { LabelStyle } from '../../render/layout';
import { COLORS, FONT_SANS, textOn } from '../../render/theme';
import type { PrefixKind } from '../../types/notation';

interface Placed {
  x: number;
  w: number;
  h: number;
  size: number;
}

export function PrefixChip({ x, w, h, size, text, kind }: Placed & { text: string; kind: PrefixKind }) {
  const chipH = size * 0.5;
  const fill = kind === 'heat' ? '#ea580c' : kind === 'stance' ? '#334155' : '#1e293b';
  return (
    <g>
      <rect x={x} y={(h - chipH) / 2} width={w} height={chipH} rx={chipH * 0.3} fill={fill} stroke="#475569" strokeWidth={1} />
      <text x={x + w / 2} y={h / 2} dy="0.35em" textAnchor="middle" fontFamily={FONT_SANS} fontWeight={700} fontSize={size * 0.32} fill={COLORS.text}>
        {text}
      </text>
    </g>
  );
}

export function PlusMark({ x, w, h, size }: Placed) {
  const c = size * 0.1;
  const cx = x + w / 2;
  const cy = h / 2;
  return <path d={`M${cx - c} ${cy} H${cx + c} M${cx} ${cy - c} V${cy + c}`} stroke={COLORS.muted} strokeWidth={size * 0.05} strokeLinecap="round" />;
}

export function TagIndicator({ x, w, h, size }: Placed) {
  const tagH = size * 0.56;
  return (
    <g role="img" aria-label="TAG">
      <rect x={x} y={(h - tagH) / 2} width={w} height={tagH} rx={tagH * 0.28} fill={COLORS.tag} />
      <text x={x + w / 2} y={h / 2} dy="0.35em" textAnchor="middle" fontFamily={FONT_SANS} fontWeight={800} fontSize={size * 0.32} fill={COLORS.dark}>
        TAG
      </text>
    </g>
  );
}

export function HoldMark({ x, w, h, size }: Placed) {
  return (
    <g role="img" aria-label="hold">
      <rect x={x} y={h * 0.32} width={w} height={h * 0.36} rx={h * 0.08} fill="none" stroke={COLORS.arrowHeld} strokeWidth={1.2} />
      <text x={x + w / 2} y={h / 2} dy="0.35em" textAnchor="middle" fontFamily={FONT_SANS} fontWeight={700} fontSize={size * 0.2} fill={COLORS.arrowHeld}>
        HOLD
      </text>
    </g>
  );
}

export function RepeatBadge({ x, w, h, size, count }: Placed & { count: number }) {
  return (
    <text x={x + w / 2} y={h / 2} dy="0.35em" textAnchor="middle" fontFamily={FONT_SANS} fontWeight={700} fontSize={size * 0.34} fill={COLORS.text}>
      ×{count}
    </text>
  );
}

export function LabelGlyph({ x, w, h, size, text, caption, fill, style }: Placed & { text: string; caption?: string; fill: string; style: LabelStyle }) {
  const labelH = h * 0.78;
  const top = (h - labelH) / 2;
  if (style === 'note') {
    return (
      <text x={x + w / 2} y={h / 2} dy="0.35em" textAnchor="middle" fontFamily={FONT_SANS} fontStyle="italic" fontSize={size * 0.3} fill={fill}>
        {text}
      </text>
    );
  }
  const solid = style === 'solid';
  const color = solid ? textOn(fill) : fill;
  return (
    <g>
      <rect
        x={x}
        y={top}
        width={w}
        height={labelH}
        rx={labelH * 0.22}
        fill={solid ? fill : 'transparent'}
        stroke={solid ? 'none' : fill}
        strokeWidth={1.5}
        strokeDasharray={solid ? undefined : '4 3'}
      />
      <text
        x={x + w / 2}
        y={caption ? top + labelH * 0.46 : h / 2}
        dy="0.35em"
        textAnchor="middle"
        fontFamily={FONT_SANS}
        fontWeight={800}
        fontSize={size * 0.4}
        fill={color}
      >
        {text}
      </text>
      {caption && (
        <text x={x + w / 2} y={top + labelH * 0.82} textAnchor="middle" fontFamily={FONT_SANS} fontWeight={700} fontSize={size * 0.2} fill={color} opacity={0.85}>
          {caption}
        </text>
      )}
    </g>
  );
}
