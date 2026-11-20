/**
 * "What is it / when is it used" for each piece of a layered TTT2 combo.
 * Everything comes from the guide data and the notation engine; nothing is invented.
 */
import { canonicalPiece, type Flag, type PoolPiece, type PoolRoute } from './generator';
import type { RouteKind } from './types';

export interface InfoLine {
  label: string;
  value: string;
  /** Warning lines are things the player should verify in practice mode. */
  tone?: 'warning';
}

const WHEN: Readonly<Record<RouteKind, string>> = {
  normal: 'Normal hit',
  counterHit: 'On counter hit',
  lowParry: 'After a low parry',
  wall: 'At the wall',
};

const FLAG_LABEL: Readonly<Record<Flag['kind'], string>> = { condition: 'Condition', note: 'Note', notation: 'Notation' };

function flagLines(flags: readonly Flag[]): InfoLine[] {
  return flags.map((f) => ({ label: FLAG_LABEL[f.kind], value: f.text, tone: 'warning' }));
}

export function describeRoute({ piece, analysis, flags }: PoolRoute): InfoLine[] {
  return [
    { label: 'When', value: WHEN[piece.routeKind ?? 'normal'] },
    ...(piece.starter ? [{ label: 'Starter', value: canonicalPiece(piece.starter, piece.character) }] : []),
    ...(piece.forms ? [{ label: 'Only', value: piece.forms.join(', ') }] : []),
    ...(analysis.opener
      ? [{ label: 'Hits before TA', value: `~${analysis.preTaHits}` }]
      : [
          { label: 'Hits', value: `~${analysis.preTaHits}` },
          { label: 'Tag Assault', value: 'No B! in this guide route: solo combo, no TA' },
        ]),
    ...(analysis.boundMove ? [{ label: 'Bound', value: canonicalPiece(analysis.boundMove, piece.character) }] : []),
    ...(analysis.usesWall ? [{ label: 'Wall', value: 'Uses the wall (W!)' }] : []),
    ...flagLines(flags),
  ];
}

/** A TA filler or an ender, performed by `performer`. */
export function describePiece({ piece, flags }: PoolPiece, performer: string): InfoLine[] {
  return [
    { label: 'By', value: performer },
    { label: 'Where', value: piece.context === 'wall' ? 'At the wall' : 'Open ground' },
    ...(piece.form ? [{ label: 'Form', value: piece.form }] : []),
    ...(piece.variant ? [{ label: 'Variant', value: piece.variant }] : []),
    ...flagLines(flags),
  ];
}

/** Text of a piece in a phase dropdown. */
export function optionLabel(entry: PoolPiece | PoolRoute): string {
  const { piece } = entry;
  if ('analysis' in entry) return `${piece.starter ? canonicalPiece(piece.starter, piece.character) : 'Route'} · ${canonicalPiece(entry.analysis.opener ?? piece.notation, piece.character)}${entry.analysis.opener ? '' : ' (solo)'}`;
  return canonicalPiece(piece.notation, piece.character);
}
