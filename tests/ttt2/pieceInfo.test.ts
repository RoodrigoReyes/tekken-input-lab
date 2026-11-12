import { describe, expect, it } from 'vitest';
import { collectPieces, type GeneratorOptions } from '../../src/ttt2/generator';
import { importGuide } from '../../src/ttt2/guideImporter';
import { describePiece, describeRoute, optionLabel } from '../../src/ttt2/pieceInfo';
import text from './fixtures/guide-excerpt.md?raw';

const library = importGuide(text, 'excerpt');
const base: GeneratorOptions = {
  point: 'Nina',
  partner: 'Kazuya',
  context: 'open',
  routeKinds: ['normal', 'counterHit', 'lowParry'],
  fillerBy: 'partner',
  enderBy: 'point',
};
const pools = collectPieces(library, base)!;
const value = (lines: ReturnType<typeof describeRoute>, label: string) => lines.find((l) => l.label === label)?.value;

describe('describeRoute', () => {
  it('says when the route is used and what it does, from the guide data only', () => {
    const route = pools.routes.find((r) => r.piece.starter === 'qcf+1')!;
    const lines = describeRoute(route);
    expect(value(lines, 'When')).toBe('Normal hit');
    expect(value(lines, 'Starter')).toBe('qcf+1');
    expect(value(lines, 'Bound')).toBe(route.analysis.boundMove);
    expect(value(lines, 'Hits before TA')).toBe(`~${route.analysis.preTaHits}`);
  });

  it('names counter-hit and low-parry routes', () => {
    const ch = pools.routes.find((r) => r.piece.routeKind === 'counterHit');
    const lp = pools.routes.find((r) => r.piece.routeKind === 'lowParry');
    if (ch) expect(value(describeRoute(ch), 'When')).toBe('On counter hit');
    if (lp) expect(value(describeRoute(lp), 'When')).toBe('After a low parry');
    expect(ch ?? lp).toBeDefined();
  });
});

describe('describePiece', () => {
  it('names the performer and where it is used', () => {
    const filler = pools.fillers[0]!;
    const lines = describePiece(filler, 'Kazuya');
    expect(value(lines, 'By')).toBe('Kazuya');
    expect(value(lines, 'Where')).toBe('Open ground');
  });

  it('lists the guide notes and conditions as things to verify', () => {
    const ninaPools = collectPieces(library, { ...base, point: 'Kazuya', partner: 'Nina' })!;
    const noted = ninaPools.fillers.find((f) => f.piece.notation === 'f,F+4')!;
    const note = describePiece(noted, 'Nina').find((l) => l.label === 'Note');
    expect(note?.value).toMatch(/single-hit filler damage/);
    expect(note?.tone).toBe('warning');
  });
});

describe('optionLabel', () => {
  it('shows the starter and the part used before TA for routes', () => {
    const route = pools.routes.find((r) => r.piece.starter === 'qcf+1')!;
    expect(optionLabel(route)).toBe(`qcf+1 · ${route.analysis.opener}`);
  });

  it('shows the notation for fillers and enders', () => {
    expect(optionLabel(pools.enders[0]!)).toBe(pools.enders[0]!.piece.notation);
  });
});
