import { forwardRef, type KeyboardEvent, type ReactNode } from 'react';
import type { Box, Layout, Part } from '../../render/layout';
import type { Side } from '../../render/side';
import { COLORS, FONT_SANS } from '../../render/theme';
import { ArcadeButtons } from './ArcadeButtons';
import { DirectionIcon } from './DirectionIcon';
import { HoldMark, LabelGlyph, PlusMark, PrefixChip, RepeatBadge, TagIndicator } from './Glyphs';
import { MotionIcon } from './MotionIcon';
import { Bracket, RelationMark, SectionHeader, StageSeparator } from './Separators';

export interface ComboSvgProps {
  layout: Layout;
  /** Optional heading drawn above the sequence (used for exports). */
  heading?: { title: string; subtitle?: string };
  /** Paint a background rectangle (exports). */
  background?: boolean;
  title?: string;
  /** Player side: 2P mirrors forward/back arrows. */
  side?: Side;
  /** Makes named moves with a known input clickable to show or hide it. */
  onToggleNamed?: (key: number) => void;
  activeStage?: number;
}

function PartView({ part, box, size, side }: { part: Part; box: Box; size: number; side: Side }): ReactNode {
  const h = box.h;
  const common = { x: part.x, w: part.w, h, size };
  switch (part.type) {
    case 'prefix':
      return <PrefixChip {...common} text={part.text} kind={part.kind} />;
    case 'direction':
      return <DirectionIcon direction={part.direction} held={part.held} size={part.w} side={side} x={part.x} y={(h - part.w) / 2} />;
    case 'motion':
      return (
        <MotionIcon motion={part.motion} sequence={part.sequence} width={part.w} height={h} arrow={part.arrow} gap={part.gap} framed={part.framed} side={side} x={part.x} />
      );
    case 'plus':
      return <PlusMark {...common} />;
    case 'buttons':
      return <ArcadeButtons active={part.active} size={part.w} x={part.x} y={(h - part.w) / 2} />;
    case 'tag':
      return <TagIndicator {...common} />;
    case 'hold':
      return <HoldMark {...common} />;
    case 'repeat':
      return <RepeatBadge {...common} count={part.count} />;
    case 'label':
      return <LabelGlyph {...common} text={part.text} caption={part.caption} fill={part.fill} style={part.style} />;
  }
}

function ItemPanel({ box }: { box: Box }) {
  const isInput = box.nodeType === 'input';
  if (!isInput && !box.flagged) return null;
  return (
    <rect
      x={0.5}
      y={0.5}
      width={box.w - 1}
      height={box.h - 1}
      rx={box.h * 0.18}
      fill={isInput ? COLORS.panel : 'none'}
      stroke={box.flagged ? COLORS.warning : COLORS.panelStroke}
      strokeWidth={box.flagged ? 2 : 1}
      strokeDasharray={box.flagged ? '5 3' : undefined}
    />
  );
}

function BoxView({ box, size, side, onToggleNamed, activeStage }: { box: Box; size: number; side: Side; onToggleNamed?: (key: number) => void; activeStage?: number }) {
  let content: ReactNode = null;
  switch (box.kind) {
    case 'item':
      content = (
        <>
          <ItemPanel box={box} />
          {box.parts.map((part, i) => (
            <PartView key={i} part={part} box={box} size={size} side={side} />
          ))}
        </>
      );
      break;
    case 'relation':
      content = <RelationMark box={box} size={size} />;
      break;
    case 'stage':
      content = <StageSeparator box={box} size={size} />;
      break;
    case 'bracket':
      content = <Bracket box={box} size={size} />;
      break;
    case 'sectionHeader':
      content = <SectionHeader box={box} size={size} />;
      break;
  }
  const toggle = box.expandable && onToggleNamed ? () => onToggleNamed(box.expandable!.key) : undefined;
  return (
    <g
      transform={`translate(${box.x} ${box.y})`}
      data-kind={box.kind}
      data-node={box.nodeType}
      opacity={activeStage === undefined ? undefined : box.stageIndex === activeStage ? 1 : 0.25}
      {...(toggle && {
        role: 'button',
        tabIndex: 0,
        'aria-expanded': box.expandable!.open,
        'aria-label': `${box.title}: ${box.expandable!.open ? 'hide' : 'show'} input`,
        style: { cursor: 'pointer' },
        onClick: toggle,
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          e.preventDefault();
          toggle();
        },
      })}
    >
      <title>{box.title}</title>
      {content}
    </g>
  );
}

/** Renders a computed layout as a single, self-contained SVG (also used for export). */
export const ComboSvg = forwardRef<SVGSVGElement, ComboSvgProps>(function ComboSvg({ layout, heading, background, title, side = 'left', onToggleNamed, activeStage }, ref) {
  const s = layout.size;
  const headH = heading ? Math.round(s * (heading.subtitle ? 1.25 : 0.9)) : 0;
  const width = layout.width;
  const height = layout.height + headH;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={title ?? 'Combo notation'}
      data-side={side}
      data-motion-frame={layout.motionFrame ? 'on' : 'off'}
    >
      {background && <rect width={width} height={height} fill={COLORS.background} />}
      {heading && (
        <g transform={`translate(${s * 0.2} 0)`}>
          <text y={s * 0.62} fontFamily={FONT_SANS} fontWeight={700} fontSize={s * 0.42} fill={COLORS.text}>
            {heading.title}
          </text>
          {heading.subtitle && (
            <text y={s * 1.05} fontFamily={FONT_SANS} fontWeight={600} fontSize={s * 0.28} fill={COLORS.muted}>
              {heading.subtitle}
            </text>
          )}
        </g>
      )}
      <g transform={`translate(0 ${headH})`}>
        {layout.boxes.map((box) => (
          <BoxView key={box.id} box={box} size={s} side={side} onToggleNamed={onToggleNamed} activeStage={activeStage} />
        ))}
      </g>
    </svg>
  );
});
