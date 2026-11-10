/**
 * Layout engine: ParseResult → positioned boxes for one SVG.
 * Pure and deterministic (text measurement is injectable), so it is unit
 * tested independently from React. Each step becomes one box; simultaneous
 * buttons stay in one cluster inside one box, sequential steps are separate
 * boxes joined by relation boxes. Lines wrap after separators.
 */
import { MOTIONS } from '../notation/core/lexicon';
import { MECHANICS, type MechanicId } from '../notation/mechanics';
import { parseNotation } from '../parser';
import type {
  AttackButton,
  Direction,
  ItemNode,
  MotionId,
  ParseResult,
  Prefix,
  PrefixKind,
  RelationKind,
  Span,
  Step,
} from '../types/notation';
import { estimateText, type MeasureFn } from './measure';
import { COLORS, EVENT_COLORS, MECHANIC_COLORS } from './theme';

export type Part =
  | { type: 'prefix'; x: number; w: number; text: string; kind: PrefixKind }
  | { type: 'direction'; x: number; w: number; direction: Direction; held: boolean }
  | { type: 'motion'; x: number; w: number; motion: MotionId; sequence: readonly Direction[] }
  | { type: 'plus'; x: number; w: number }
  | { type: 'buttons'; x: number; w: number; active: readonly AttackButton[] }
  | { type: 'tag'; x: number; w: number }
  | { type: 'hold'; x: number; w: number }
  | { type: 'repeat'; x: number; w: number; count: number }
  | { type: 'label'; x: number; w: number; text: string; caption?: string; fill: string; style: LabelStyle };

export type LabelStyle = 'solid' | 'note' | 'unknown';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
/** A part before horizontal placement. */
type PartDraft = DistributiveOmit<Part, 'x'>;

export type BoxKind = 'item' | 'relation' | 'stage' | 'bracket' | 'sectionHeader';

export interface Box {
  id: number;
  kind: BoxKind;
  x: number;
  y: number;
  w: number;
  h: number;
  parts: Part[];
  /** item boxes: AST node type (drives the panel style). */
  nodeType?: ItemNode['type'];
  relation?: RelationKind;
  bracket?: { side: 'open' | 'close'; style: 'optional' | 'expansion' };
  header?: { title: string; tagAssault: boolean; unassigned: boolean; tagWidth: number };
  /** Overlaps a warning diagnostic. */
  flagged: boolean;
  /** Tooltip / accessible text. */
  title: string;
}

export interface Layout {
  width: number;
  height: number;
  size: number;
  boxes: Box[];
}

export interface SectionHeaderInfo {
  title: string | null;
}

export interface LayoutOptions {
  /** Available width in px. */
  width: number;
  /** Base unit (button cluster size) in px. */
  size?: number;
  /** Render named moves followed by their expansion. */
  expandNamed?: boolean;
  /** One entry per section; when provided (or when there are several sections) headers are drawn. */
  sectionHeaders?: readonly SectionHeaderInfo[];
  measure?: MeasureFn;
  padding?: number;
}

type Draft = Omit<Box, 'x' | 'y' | 'id'> & { breakAfter: boolean };

const RELATION_WIDTH: Readonly<Record<RelationKind, number>> = {
  sequence: 0.42,
  transition: 0.5,
  justFrame: 0.6,
  delay: 0.95,
  implicit: 0.16,
};

const RELATION_TITLE: Readonly<Record<RelationKind, string>> = {
  sequence: 'then (,)',
  transition: 'immediately (~)',
  justFrame: 'just frame (:)',
  delay: 'delayed (<)',
  implicit: 'then',
};

class Builder {
  readonly s: number;
  readonly h: number;
  private readonly measure: MeasureFn;
  private readonly flaggedSpans: Span[];

  constructor(
    private readonly result: ParseResult,
    private readonly options: LayoutOptions,
  ) {
    this.s = options.size ?? 40;
    this.h = Math.round(this.s * 1.25);
    this.measure = options.measure ?? estimateText;
    this.flaggedSpans = result.diagnostics.filter((d) => d.severity === 'warning' && d.span).map((d) => d.span as Span);
  }

  private flagged(span: Span): boolean {
    return this.flaggedSpans.some((f) => f.start < span.end && span.start < f.end);
  }

  private textW(text: string, scale: number, weight = 700): number {
    return this.measure(text, this.s * scale, weight);
  }

  // -- parts -------------------------------------------------------------------

  private prefixParts(prefixes: readonly Prefix[]): PartDraft[] {
    return prefixes.map((p) => ({ type: 'prefix', w: this.textW(p.abbr, 0.32) + this.s * 0.26, text: p.abbr, kind: p.kind }) as const);
  }

  private labelPart(text: string, fill: string, style: LabelStyle, caption?: string): PartDraft {
    const main = this.textW(text, style === 'note' ? 0.3 : 0.4, style === 'note' ? 400 : 700);
    const cap = caption ? this.textW(caption, 0.2, 700) : 0;
    return { type: 'label', w: Math.max(main, cap) + this.s * 0.36, text, fill, style, ...(caption ? { caption } : {}) }
  }

  private coreParts(node: ItemNode): PartDraft[] {
    const s = this.s;
    switch (node.type) {
      case 'input': {
        const parts: PartDraft[] = [];
        if (node.direction) parts.push({ type: 'direction', w: s * 0.78, direction: node.direction.value, held: node.direction.held });
        if (node.motion) {
          const sequence = MOTIONS[node.motion.value].sequence;
          const w = Math.max(sequence.length * s * 0.36, this.textW(node.motion.value, 0.24)) + s * 0.24;
          parts.push({ type: 'motion', w, motion: node.motion.value, sequence });
        }
        const hasButtons = node.buttons.length > 0;
        if ((node.direction || node.motion) && (hasButtons || node.tag)) parts.push({ type: 'plus', w: s * 0.3 });
        if (hasButtons) parts.push({ type: 'buttons', w: s * 0.92, active: node.buttons });
        if (hasButtons && node.tag) parts.push({ type: 'plus', w: s * 0.3 });
        if (node.tag) parts.push({ type: 'tag', w: s * 1.05 });
        return parts;
      }
      case 'namedMove':
        return [this.labelPart(node.name, COLORS.named, 'solid')];
      case 'event':
        return [this.labelPart(node.abbr, EVENT_COLORS[node.mechanic] ?? COLORS.stance, 'solid', MECHANICS[node.mechanic as MechanicId]?.caption)];
      case 'mechanic':
        return [this.labelPart(node.abbr, MECHANIC_COLORS[node.mechanic] ?? COLORS.stance, 'solid', MECHANICS[node.mechanic as MechanicId]?.caption)];
      case 'movement':
        return [this.labelPart(node.abbr, COLORS.movement, 'solid')];
      case 'stance':
        return [this.labelPart(node.abbr, node.kind === 'heat' ? MECHANIC_COLORS.heatBurst ?? COLORS.stance : COLORS.stance, 'solid')];
      case 'note':
        return [this.labelPart(node.text, COLORS.note, 'note')];
      case 'unknown':
        return [this.labelPart(node.raw, COLORS.unknown, 'unknown')];
      case 'optional':
        return [];
    }
  }

  private itemDraft(node: ItemNode): Draft {
    const s = this.s;
    const raw: PartDraft[] = [...this.prefixParts(node.prefixes), ...this.coreParts(node)];
    if (node.hold) raw.push({ type: 'hold', w: s * 0.62 });
    if (node.repeat) raw.push({ type: 'repeat', w: this.textW(`×${node.repeat}`, 0.34) + s * 0.12, count: node.repeat });
    const pad = s * 0.12;
    const gap = s * 0.06;
    let x = pad;
    const parts = raw.map((p) => {
      const placed = { ...p, x } as Part;
      x += p.w + gap;
      return placed;
    });
    const w = Math.max(x - gap + pad, s * 0.5);
    return { kind: 'item', w, h: this.h, parts, nodeType: node.type, flagged: this.flagged(node.span), title: node.raw, breakAfter: false };
  }

  // -- stream --------------------------------------------------------------------

  steps(steps: readonly Step[], out: Draft[]): void {
    steps.forEach((step, i) => {
      if (i > 0 && step.relation) {
        const kind = step.relation.kind;
        out.push({ kind: 'relation', relation: kind, w: this.s * RELATION_WIDTH[kind], h: this.h, parts: [], flagged: false, title: RELATION_TITLE[kind], breakAfter: true });
      }
      this.item(step.node, out);
    });
  }

  private bracket(side: 'open' | 'close', style: 'optional' | 'expansion', out: Draft[]): void {
    out.push({ kind: 'bracket', bracket: { side, style }, w: this.s * 0.28, h: this.h, parts: [], flagged: false, title: style === 'optional' ? 'optional' : 'expansion', breakAfter: side === 'close' });
  }

  private item(node: ItemNode, out: Draft[]): void {
    if (node.type === 'optional') {
      this.bracket('open', 'optional', out);
      this.steps(node.steps, out);
      this.bracket('close', 'optional', out);
      return;
    }
    out.push(this.itemDraft(node));
    if (node.type === 'namedMove' && this.options.expandNamed && node.expansion) {
      const expanded = parseNotation(node.expansion, { game: this.result.game, dialect: this.result.dialect });
      const steps = expanded.ast.sections[0]?.stages[0]?.steps ?? [];
      this.bracket('open', 'expansion', out);
      this.steps(steps, out);
      this.bracket('close', 'expansion', out);
    }
  }

  stage(out: Draft[]): void {
    out.push({ kind: 'stage', w: this.s * 0.62, h: this.h, parts: [], flagged: false, title: 'next stage (>)', breakAfter: true });
  }

  header(info: { title: string | null }, tagAssault: boolean): Draft {
    const title = info.title ?? 'Unassigned';
    const tagW = tagAssault ? this.textW('TAG ASSAULT', 0.26) + this.s * 0.5 : 0;
    const w = tagW + this.textW(title.toUpperCase(), 0.3) + this.s * 0.4;
    return {
      kind: 'sectionHeader',
      w,
      h: Math.round(this.s * 0.6),
      parts: [],
      header: { title, tagAssault, unassigned: info.title === null, tagWidth: tagW },
      flagged: false,
      title: tagAssault ? `Tag Assault → ${title}` : title,
      breakAfter: true,
    };
  }
}

/** Groups drafts into unbreakable segments (a segment ends at a break opportunity). */
function segments(drafts: readonly Draft[]): Draft[][] {
  const out: Draft[][] = [];
  let current: Draft[] = [];
  drafts.forEach((d, i) => {
    current.push(d);
    const next = drafts[i + 1];
    // Never start a line with a closing bracket.
    const nextIsClose = next?.kind === 'bracket' && next.bracket?.side === 'close';
    if (d.breakAfter && !nextIsClose) {
      out.push(current);
      current = [];
    }
  });
  if (current.length) out.push(current);
  return out;
}

export function layoutCombo(result: ParseResult, options: LayoutOptions): Layout {
  const b = new Builder(result, options);
  const pad = options.padding ?? Math.round(b.s * 0.2);
  const gap = Math.round(b.s * 0.1);
  const rowGap = Math.round(b.s * 0.28);
  const maxWidth = Math.max(options.width, b.s * 3);
  const sections = result.ast.sections;
  const showHeaders =
    sections.length > 1 || sections.some((s) => s.label) || (options.sectionHeaders?.some((h) => h.title) ?? false);

  const boxes: Box[] = [];
  let y = pad;
  let id = 0;

  sections.forEach((section, si) => {
    if (showHeaders) {
      const info = options.sectionHeaders?.[si] ?? { title: section.label ?? null };
      const head = b.header(info, section.boundary === 'tagAssault');
      boxes.push({ ...stripDraft(head), id: id++, x: pad, y });
      y += head.h + Math.round(b.s * 0.12);
    }
    const drafts: Draft[] = [];
    section.stages.forEach((stage, i) => {
      if (i > 0) b.stage(drafts);
      b.steps(stage.steps, drafts);
    });
    if (drafts.length === 0) {
      if (showHeaders) y += rowGap;
      return;
    }

    let x = pad;
    for (const seg of segments(drafts)) {
      const segW = seg.reduce((acc, d) => acc + d.w + gap, 0) - gap;
      if (x > pad && x + segW > maxWidth - pad) {
        x = pad;
        y += b.h + rowGap;
      }
      for (const d of seg) {
        boxes.push({ ...stripDraft(d), id: id++, x, y });
        x += d.w + gap;
      }
    }
    y += b.h + rowGap;
  });

  const contentRight = boxes.reduce((m, bx) => Math.max(m, bx.x + bx.w), 0);
  return {
    width: Math.ceil(contentRight + pad),
    height: Math.ceil(boxes.length ? y - rowGap + pad : pad * 2),
    size: b.s,
    boxes,
  };
}

function stripDraft(d: Draft): Omit<Box, 'x' | 'y' | 'id'> {
  const { breakAfter: _ignored, ...rest } = d;
  void _ignored;
  return rest;
}
