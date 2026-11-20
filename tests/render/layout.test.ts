import { describe, expect, it } from 'vitest';
import { parseNotation } from '../../src/parser';
import { headerFont, layoutCombo, type Box, type Part } from '../../src/render/layout';
import { estimateText } from '../../src/render/measure';
import type { GameId } from '../../src/types/notation';

function layout(text: string, game: GameId = 't8', opts: Partial<Parameters<typeof layoutCombo>[1]> = {}, characters?: string[]) {
  const r = parseNotation(text, { game, characters });
  return layoutCombo(r, { width: 2000, size: 40, ...opts });
}

const items = (boxes: Box[]) => boxes.filter((b) => b.kind === 'item');
const partsOf = (box: Box | undefined, type: Part['type']) => (box?.parts ?? []).filter((p) => p.type === type);

describe('layoutCombo', () => {
  it('df+1,2~5: three separate items, never a merged 1+2 cluster', () => {
    const l = layout('df+1,2~5', 'ttt2');
    const it3 = items(l.boxes);
    expect(it3).toHaveLength(3);
    const [first, second, third] = it3;
    expect(partsOf(first, 'direction')).toHaveLength(1);
    expect(partsOf(first, 'buttons').map((p) => (p as Extract<Part, { type: 'buttons' }>).active)).toEqual([[1]]);
    expect(partsOf(second, 'buttons').map((p) => (p as Extract<Part, { type: 'buttons' }>).active)).toEqual([[2]]);
    expect(partsOf(third, 'tag')).toHaveLength(1);
    expect(partsOf(third, 'buttons')).toHaveLength(0);
    expect(l.boxes.filter((b) => b.kind === 'relation').map((b) => b.relation)).toEqual(['sequence', 'transition']);
  });

  it('1+2: one cluster with both buttons active', () => {
    const l = layout('1+2');
    const clusters = items(l.boxes).flatMap((b) => partsOf(b, 'buttons'));
    expect(clusters).toHaveLength(1);
    expect((clusters[0] as Extract<Part, { type: 'buttons' }>).active).toEqual([1, 2]);
  });

  it('2+5: one cluster plus a TAG indicator in the same box', () => {
    const box = items(layout('2+5', 'ttt2').boxes)[0];
    expect(box?.parts.map((p) => p.type)).toEqual(['buttons', 'plus', 'tag']);
  });

  it('stages are separated by stage boxes', () => {
    const l = layout('df+2 > 1,2 > T!');
    expect(l.boxes.map((b) => b.kind)).toEqual(['item', 'stage', 'item', 'relation', 'item', 'stage', 'item']);
  });

  it('drops event captions below the readable size (a 0.2 caption at size 24 would be under 5px)', () => {
    const label = (size: number) => items(layout('T!', 't8', { size }).boxes)[0]?.parts[0] as Extract<Part, { type: 'label' }>;
    expect(label(24).caption).toBeUndefined();
    expect(label(38).caption).toBeUndefined();
    expect(label(40).caption).toBe('TORNADO');
    expect(label(24).text).toBe('T!');
  });

  it('labels: named moves, events, movements, prefixes, motions, hold', () => {
    const l = layout('EWGF > SSL > WS.4 > qcf+1 > df+1* > T!', 't8', {}, ['Kazuya']);
    const its = items(l.boxes);
    expect(its.map((b) => b.nodeType)).toEqual(['namedMove', 'movement', 'input', 'input', 'input', 'event']);
    expect((its[0]?.parts[0] as Extract<Part, { type: 'label' }>).text).toBe('EWGF');
    expect(its[2]?.parts.map((p) => p.type)).toEqual(['prefix', 'buttons']);
    expect(its[3]?.parts.map((p) => p.type)).toEqual(['motion', 'plus', 'buttons']);
    expect(its[4]?.parts.map((p) => p.type)).toEqual(['direction', 'plus', 'buttons', 'hold']);
    const event = its[5]?.parts[0] as Extract<Part, { type: 'label' }>;
    expect([event.text, event.caption]).toEqual(['T!', 'TORNADO']);
  });

  it('unframed motions (default) use the same arrow size and spacing as plain direction inputs', () => {
    const l = layout('f+1, cd+4');
    const [plain, motionBox] = items(l.boxes);
    const dir = partsOf(plain, 'direction')[0] as Extract<Part, { type: 'direction' }>;
    const motion = partsOf(motionBox, 'motion')[0] as Extract<Part, { type: 'motion' }>;
    expect(motion.framed).toBe(false);
    expect(motion.arrow).toBeCloseTo(dir.w);
    // Arrows sit side by side like separate inputs inside one box: n arrows + (n - 1) part gaps.
    const partGap = 40 * 0.06;
    expect(motion.gap).toBeCloseTo(partGap);
    expect(motion.w).toBeCloseTo(4 * dir.w + 3 * partGap);
  });

  it('framed motions keep the compact pill', () => {
    const motion = partsOf(items(layout('cd+4', 't8', { motionFrame: true }).boxes)[0], 'motion')[0] as Extract<Part, { type: 'motion' }>;
    expect(motion.framed).toBe(true);
    expect(motion.arrow).toBeLessThan(40 * 0.78);
    expect(motion.gap).toBe(0);
    expect(motion.w).toBeGreaterThan(4 * motion.arrow);
  });

  it('named moves are not expanded unless requested', () => {
    expect(items(layout('EWGF', 't8').boxes)).toHaveLength(1);
    const expanded = layoutCombo(parseNotation('EWGF', { game: 't8' }), { width: 2000, size: 40, expandNamed: true });
    expect(expanded.boxes.filter((b) => b.kind === 'bracket')).toHaveLength(2);
    expect(items(expanded.boxes).length).toBeGreaterThan(4);
  });

  it('expands only the named moves whose key is in expandedNamed', () => {
    const closed = layout('EWGF > EWGF', 't8');
    const keys = items(closed.boxes).map((b) => b.expandable?.key);
    expect(keys).toEqual([0, 7]);
    expect(closed.boxes.filter((b) => b.kind === 'bracket')).toHaveLength(0);
    const one = layout('EWGF > EWGF', 't8', { expandedNamed: new Set([7]) });
    expect(one.boxes.filter((b) => b.kind === 'bracket')).toHaveLength(2);
    expect(items(one.boxes).filter((b) => b.expandable).map((b) => b.expandable?.open)).toEqual([false, true]);
  });

  it('optional groups get brackets', () => {
    const l = layout('df+2 [dash] f+2');
    expect(l.boxes.map((b) => b.kind)).toEqual(['item', 'relation', 'bracket', 'item', 'bracket', 'relation', 'item']);
  });

  it('wraps onto new rows when narrow, without overflowing', () => {
    const text = 'df+2 > 1,2 > T! > dash > f+2,1 > df+1,2 > b+1+2';
    const wide = layout(text, 't8', { width: 4000 });
    const narrow = layout(text, 't8', { width: 300 });
    const rows = (l: typeof wide) => new Set(l.boxes.map((b) => b.y)).size;
    expect(rows(wide)).toBe(1);
    expect(rows(narrow)).toBeGreaterThan(2);
    expect(narrow.height).toBeGreaterThan(wide.height);
    for (const b of narrow.boxes) expect(b.x + b.w).toBeLessThanOrEqual(300);
  });

  it('never starts a row with a closing bracket', () => {
    const l = layout('1,2 [3,4,1,2,3,4] 1', 't8', { width: 220 });
    const rowStarts = new Map<number, Box>();
    for (const b of l.boxes) if (!rowStarts.has(b.y)) rowStarts.set(b.y, b);
    for (const b of rowStarts.values()) expect(b.bracket?.side).not.toBe('close');
  });

  it('never starts a row with a relation or stage separator', () => {
    for (let width = 120; width < 600; width += 7) {
      const l = layout('1,[2,3],4,[1,2],3 > [df+1] > 2', 't8', { width });
      const rowStarts = new Map<number, Box>();
      for (const b of l.boxes) if (!rowStarts.has(b.y)) rowStarts.set(b.y, b);
      for (const b of rowStarts.values()) expect(['relation', 'stage']).not.toContain(b.kind);
    }
  });

  it('expanded named moves never inherit warning highlights', () => {
    const r = parseNotation('EWGF,1,zzz', { game: 't8', characters: ['Kazuya'] });
    const l = layoutCombo(r, { width: 2000, size: 40, expandNamed: true });
    expect(items(l.boxes).filter((b) => b.flagged).map((b) => b.title)).toEqual(['zzz']);
  });

  it('section headers for TTT2 sections, including Tag Assault', () => {
    const r = parseNotation('df+1,2~5 ; 3+4,2', { game: 'ttt2', dialect: 'kage-ttt2' });
    const l = layoutCombo(r, { width: 2000, size: 40, sectionHeaders: [{ title: 'Kazuya' }, { title: 'Armor King' }] });
    const headers = l.boxes.filter((b) => b.kind === 'sectionHeader').map((b) => b.header);
    expect(headers).toEqual([
      { title: 'Kazuya', tagAssault: false, unassigned: false, tagWidth: 0 },
      { title: 'Armor King', tagAssault: true, unassigned: false, tagWidth: expect.any(Number) },
    ]);
  });

  it('section header text never drops below 10px, and the box makes room for it', () => {
    expect(headerFont(40, 0.3)).toBe(12);
    expect(headerFont(24, 0.3)).toBe(10);
    const r = parseNotation('1,2 ; 3,4', { game: 'ttt2' });
    const head = layoutCombo(r, { width: 2000, size: 24, sectionHeaders: [{ title: 'Kazuya' }, { title: 'Nina' }] }).boxes.find((b) => b.kind === 'sectionHeader');
    expect(head?.w).toBeCloseTo(estimateText('KAZUYA', 10, 700) + 24 * 0.4);
    expect(head?.h).toBeGreaterThanOrEqual(14);
  });

  it('single-section combos have no header', () => {
    expect(layout('1,2').boxes.some((b) => b.kind === 'sectionHeader')).toBe(false);
  });

  it('flags items covered by warnings only', () => {
    const l = layout('df+2 > 1,2 S! > f+2,1', 't8');
    expect(items(l.boxes).filter((b) => b.flagged).map((b) => b.title)).toEqual(['S!']);
  });

  it('scales with size', () => {
    const small = layout('df+1,2', 't8', { size: 20 });
    const big = layout('df+1,2', 't8', { size: 60 });
    expect(big.width).toBeGreaterThan(small.width * 2);
    expect(big.height).toBeGreaterThan(small.height * 2);
  });

  it('handles empty notation', () => {
    const l = layout('');
    expect(l.boxes).toEqual([]);
    expect(l.height).toBeGreaterThan(0);
  });
});
