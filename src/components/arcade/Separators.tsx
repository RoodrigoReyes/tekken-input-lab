/** Relation marks (, ~ : < implicit), stage separators (>), brackets and section headers. */
import { headerFont, type Box } from '../../render/layout';
import { COLORS, FONT_SANS } from '../../render/theme';

export function RelationMark({ box, size }: { box: Box; size: number }) {
  const { w, h } = box;
  const cx = w / 2;
  const cy = h / 2;
  const stroke = { stroke: COLORS.relation, strokeWidth: size * 0.06, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  switch (box.relation) {
    case 'sequence': {
      const a = size * 0.1;
      return <path d={`M${cx - a * 0.6} ${cy - a} L${cx + a * 0.6} ${cy} L${cx - a * 0.6} ${cy + a}`} {...stroke} />;
    }
    case 'transition': {
      const a = size * 0.16;
      return <path d={`M${cx - a} ${cy + a * 0.15} C${cx - a * 0.5} ${cy - a * 0.6}, ${cx} ${cy - a * 0.6}, ${cx} ${cy} S${cx + a * 0.5} ${cy + a * 0.6}, ${cx + a} ${cy - a * 0.15}`} {...stroke} />;
    }
    case 'justFrame':
      return (
        <text x={cx} y={cy} dy="0.35em" textAnchor="middle" fontFamily={FONT_SANS} fontWeight={700} fontSize={size * 0.28} fill={COLORS.arrowHeld}>
          JF
        </text>
      );
    case 'delay':
      return (
        <text x={cx} y={cy} dy="0.35em" textAnchor="middle" fontFamily={FONT_SANS} fontWeight={700} fontSize={size * 0.24} fill={COLORS.relation}>
          delay
        </text>
      );
    default:
      return null;
  }
}

export function StageSeparator({ box, size }: { box: Box; size: number }) {
  const cx = box.w / 2;
  const cy = box.h / 2;
  const a = size * 0.17;
  return (
    <path
      d={`M${cx - a * 0.7} ${cy - a} L${cx + a * 0.8} ${cy} L${cx - a * 0.7} ${cy + a} Z`}
      fill={COLORS.stageMarker}
      stroke={COLORS.stageMarker}
      strokeWidth={size * 0.02}
      strokeLinejoin="round"
    />
  );
}

export function Bracket({ box, size }: { box: Box; size: number }) {
  const open = box.bracket?.side === 'open';
  const dashed = box.bracket?.style === 'optional';
  const x0 = open ? box.w * 0.7 : box.w * 0.3;
  const x1 = open ? box.w * 0.3 : box.w * 0.7;
  const top = box.h * 0.12;
  const bottom = box.h * 0.88;
  return (
    <path
      d={`M${x0} ${top} H${x1} V${bottom} H${x0}`}
      stroke={COLORS.bracket}
      strokeWidth={size * 0.05}
      strokeDasharray={dashed ? `${size * 0.1} ${size * 0.07}` : undefined}
      fill="none"
    />
  );
}

export function SectionHeader({ box, size }: { box: Box; size: number }) {
  const header = box.header;
  if (!header) return null;
  const pillW = header.tagWidth - size * 0.15;
  return (
    <g>
      {header.tagAssault && (
        <g role="img" aria-label="Tag Assault">
          <rect x={0} y={0} width={pillW} height={box.h} rx={box.h * 0.3} fill={COLORS.tag} />
          <text x={pillW / 2} y={box.h / 2} dy="0.35em" textAnchor="middle" fontFamily={FONT_SANS} fontWeight={700} fontSize={headerFont(size, 0.26)} fill={COLORS.dark}>
            TAG ASSAULT
          </text>
        </g>
      )}
      <text
        x={header.tagWidth}
        y={box.h / 2}
        dy="0.35em"
        fontFamily={FONT_SANS}
        fontWeight={700}
        fontSize={headerFont(size, 0.3)}
        letterSpacing={size * 0.02}
        fill={header.unassigned ? COLORS.warning : COLORS.muted}
      >
        {header.title.toUpperCase()}
      </text>
    </g>
  );
}
