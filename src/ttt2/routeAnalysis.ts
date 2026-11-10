/**
 * Derives connection facts from a route using the notation engine:
 * where the Bound happens, what caused it, and an estimate of hits before TA.
 * Hit counts are estimates (one per attack step; ×N repeats multiply).
 */
import { parseNotation } from '../parser';
import type { ItemNode, ParseResult, Step } from '../types/notation';
import type { RouteAnalysis } from './types';

const WALL_EVENTS = new Set(['wallSplat', 'wallBound', 'wallBreak']);

function hitsOf(node: ItemNode): number {
  const per = node.type === 'namedMove' || (node.type === 'input' && (node.buttons.length > 0 || node.tag)) ? 1 : 0;
  return per * (node.repeat ?? 1);
}

function countHits(steps: readonly Step[]): number {
  return steps.reduce((sum, s) => sum + hitsOf(s.node), 0);
}

export function analyzeRoute(notation: string, character: string): RouteAnalysis {
  const result: ParseResult = parseNotation(notation, { game: 'ttt2', characters: [character] });
  const stages = result.ast.sections.flatMap((s) => s.stages);
  const usesWall = stages.some((st) => st.steps.some((s) => s.node.type === 'event' && WALL_EVENTS.has(s.node.mechanic)));

  let preTaHits = 0;
  for (const stage of stages) {
    const boundIndex = stage.steps.findIndex((s) => s.node.type === 'event' && s.node.mechanic === 'bound');
    if (boundIndex === -1) {
      preTaHits += countHits(stage.steps);
      continue;
    }
    const before = stage.steps.slice(0, boundIndex);
    const bound = stage.steps[boundIndex] as Step;
    const first = before[0]?.node;
    const boundHits = countHits(before);
    return {
      opener: notation.slice(0, bound.node.span.end),
      soloFinish: notation.slice(bound.node.span.end).replace(/^\s*>?\s*/, '').trim() || undefined,
      preTaHits: preTaHits + boundHits,
      boundMove: first ? notation.slice(first.span.start, before[before.length - 1]?.node.span.end).trim() : undefined,
      boundHits,
      usesWall,
    };
  }
  return { preTaHits, boundHits: 0, usesWall };
}
