import { describe, expect, it } from 'vitest';
import { parseNotation } from '../../src/parser';
import { toCompact } from '../../src/parser/compact';
import type { GameId, InputNode, ParseResult } from '../../src/types/notation';

function parse(text: string, game: GameId = 't8', extra: { dialect?: string; characters?: string[] } = {}): ParseResult {
  return parseNotation(text, { game, ...extra });
}

function compact(text: string, game: GameId = 't8', extra: { dialect?: string; characters?: string[] } = {}): string {
  return toCompact(parse(text, game, extra).ast);
}

function codes(result: ParseResult): string[] {
  return result.diagnostics.map((d) => d.code);
}

function firstSteps(result: ParseResult) {
  const steps = result.ast.sections[0]?.stages[0]?.steps;
  if (!steps) throw new Error('no steps');
  return steps;
}

describe('spec examples A–F', () => {
  it('A: df+1,2 is two sequential commands, never simultaneous', () => {
    const r = parse('df+1,2');
    const steps = firstSteps(r);
    expect(steps).toHaveLength(2);
    const [a, b] = steps.map((s) => s.node as InputNode);
    expect(a?.direction?.value).toBe('df');
    expect(a?.buttons).toEqual([1]);
    expect(b?.direction).toBeUndefined();
    expect(b?.buttons).toEqual([2]);
    expect(steps[1]?.relation?.kind).toBe('sequence');
    expect(toCompact(r.ast)).toBe('df+1 , 2');
  });

  it('B: 1+2 is one command with two simultaneous buttons', () => {
    const r = parse('1+2');
    const steps = firstSteps(r);
    expect(steps).toHaveLength(1);
    expect((steps[0]?.node as InputNode).buttons).toEqual([1, 2]);
  });

  it('C: 1~b~uf+4 preserves rapid transitions', () => {
    const r = parse('1~b~uf+4');
    expect(toCompact(r.ast)).toBe('1 ~ b ~ uf+4');
    const steps = firstSteps(r);
    expect(steps.map((s) => s.relation?.kind ?? null)).toEqual([null, 'transition', 'transition']);
    expect((steps[1]?.node as InputNode).buttons).toEqual([]);
  });

  it('D: df+1,2~5 renders TAG as a separate transitioned action', () => {
    const r = parse('df+1,2~5', 'ttt2');
    expect(toCompact(r.ast)).toBe('df+1 , 2 ~ TAG');
    const tag = firstSteps(r)[2]?.node as InputNode;
    expect(tag.tag).toBe(true);
    expect(tag.buttons).toEqual([]);
    expect(r.diagnostics).toEqual([]);
  });

  it('E: named moves stay labeled', () => {
    const r = parse('EWGF, EWGF, df+1,2~5', 'ttt2', { characters: ['Kazuya'] });
    expect(toCompact(r.ast)).toBe('named(EWGF) , named(EWGF) , df+1 , 2 ~ TAG');
    expect(r.diagnostics).toEqual([]);
  });

  it('F: TTT2 sections differ by dialect with explicit ASTs', () => {
    const text = 'EWGF, EWGF, df+1,2~5 ; 3+4,2 ; cd+3 W!';
    const opts = { characters: ['Kazuya', 'Armor King'] };
    const section = parse(text, 'ttt2', { ...opts, dialect: 'standard' });
    const kage = parse(text, 'ttt2', { ...opts, dialect: 'kage-ttt2' });

    expect(section.ast.sections.map((s) => s.boundary)).toEqual(['start', 'section', 'section']);
    expect(kage.ast.sections.map((s) => s.boundary)).toEqual(['start', 'tagAssault', 'tagAssault']);
    expect(toCompact(section.ast)).toBe(
      'named(EWGF) , named(EWGF) , df+1 , 2 ~ TAG |section| 3+4 , 2 |section| cd+3 _ event(wallSplat:W!)',
    );
    expect(toCompact(kage.ast)).toBe(
      'named(EWGF) , named(EWGF) , df+1 , 2 ~ TAG |tagAssault| 3+4 , 2 |tagAssault| cd+3 _ event(wallSplat:W!)',
    );
    expect(section.diagnostics).toEqual([]);
    expect(kage.diagnostics).toEqual([]);
  });
});

describe('game inputs from the spec (§13)', () => {
  it('Tekken 6', () => {
    const r = parse('df+2 > 1,2 B! > ff+3', 't6');
    expect(toCompact(r.ast)).toBe('df+2 > 1 , 2 _ event(bound:B!) > ff+3');
    expect(r.diagnostics).toEqual([]);
  });

  it('Tekken 7', () => {
    const r = parse('df+2 > 4 > S! > dash > f+2,1', 't7');
    expect(toCompact(r.ast)).toBe('df+2 > 4 > event(screw:S!) > move(dash) > f+2 , 1');
    expect(r.diagnostics).toEqual([]);
  });

  it('Tekken 8', () => {
    const r = parse('df+2 > 1,2 > T! > dash > f+2,1', 't8');
    expect(toCompact(r.ast)).toBe('df+2 > 1 , 2 > event(tornado:T!) > move(dash) > f+2 , 1');
    expect(r.diagnostics).toEqual([]);
  });

  it('advanced notation', () => {
    const r = parse('qcf+1 > uf+2,1 B! > SSL 1~b~uf+4 > f+1,2,1+2', 't6');
    expect(toCompact(r.ast)).toBe(
      'qcf+1 > uf+2 , 1 _ event(bound:B!) > move(SSL) _ 1 ~ b ~ uf+4 > f+1 , 2 , 1+2',
    );
    expect(r.diagnostics).toEqual([]);
  });

  it('labeled TTT2 sections (Kazuya + Armor King)', () => {
    const text = 'Kazuya:\nEWGF, EWGF, df+1,2~5\n\nArmor King:\n3+4,2\n\nKazuya:\ncd+3, W!, df+3,2,<1';
    const r = parse(text, 'ttt2', { characters: ['Kazuya', 'Armor King'] });
    expect(r.ast.sections.map((s) => [s.boundary, s.label])).toEqual([
      ['start', 'Kazuya'],
      ['label', 'Armor King'],
      ['label', 'Kazuya'],
    ]);
    expect(toCompact(r.ast)).toBe(
      '@Kazuya: named(EWGF) , named(EWGF) , df+1 , 2 ~ TAG |label| @Armor King: 3+4 , 2 |label| @Kazuya: cd+3 , event(wallSplat:W!) , df+3 , 2 < 1',
    );
    expect(r.diagnostics).toEqual([]);
  });

  it('a label after ; keeps the dialect boundary', () => {
    const r = parse('df+1,2~5 ; Armor King: 3+4,2', 'ttt2', { dialect: 'kage-ttt2' });
    expect(r.ast.sections[1]?.boundary).toBe('tagAssault');
    expect(r.ast.sections[1]?.label).toBe('Armor King');
  });
});

describe('cross-game warnings (warning, not error, no reinterpretation)', () => {
  const cases: Array<[string, GameId, string, string]> = [
    ['Tekken 7 Bound as juggle extender', 't7', 'df+2 > 1,2 B! > f+2,1', 'bound'],
    ['Tekken 8 Screw', 't8', 'df+2 > 1,2 S! > f+2,1', 'screw'],
    ['Tekken 6 Tornado', 't6', 'df+2 > 1,2 T! > ff+3', 'tornado'],
    ['Tekken 8 Rage Drive', 't8', 'df+2 > RD > dash > f+2,1', 'rageDrive'],
    ['Tekken 7 Heat', 't7', 'df+2 > H.2+3 > f+2,1', 'heat'],
    ['Tekken 6 Balcony Break', 't6', 'df+2 > 1,2 B! > f+4 BB!', 'balconyBreak'],
    ['Non-TTT2 TAG button', 't7', 'df+1,2~5', 'tagButton'],
  ];

  it.each(cases)('%s', (_name, game, text, mechanic) => {
    const r = parse(text, game);
    const hits = r.diagnostics.filter((d) => d.mechanic === mechanic);
    expect(hits).toHaveLength(1);
    expect(hits[0]?.severity).toBe('warning');
    expect(hits[0]?.span).toBeDefined();
    // Only the cross-game problem is reported.
    expect(r.diagnostics.filter((d) => d.severity === 'warning')).toHaveLength(1);
  });

  it('keeps the original mechanic in the AST', () => {
    expect(compact('df+2 > 1,2 S! > f+2,1', 't8')).toContain('event(screw:S!)');
    expect(compact('df+2 > RD > dash > f+2,1', 't8')).toContain('mech(rageDrive:RD)');
    expect(compact('df+2 > H.2+3 > f+2,1', 't7')).toContain('H.2+3');
    expect(compact('df+1,2~5', 't7')).toBe('df+1 , 2 ~ TAG');
  });

  it('T8 Bound is fine right after an airborne Heat Burst', () => {
    expect(parse('df+2 > 2+3 B! > f+2,1', 't8').diagnostics).toEqual([]);
    expect(parse('df+2 > HB, B! > f+2,1', 't8').diagnostics).toEqual([]);
    expect(codes(parse('df+2 > H.2+3 B! > f+2,1', 't8'))).toEqual(['mechanic-conditional']);
  });

  it('a standalone Heat marker is also checked', () => {
    expect(parse('1,2 H.', 'ttt2').diagnostics.map((d) => d.mechanic)).toEqual(['heat']);
    expect(parse('1,2 H.', 't8').diagnostics).toEqual([]);
  });

  it('extenders may only appear once per combo', () => {
    const r = parse('df+2 > 1,2 B! > 3 B!', 't6');
    expect(codes(r)).toEqual(['extender-repeated']);
  });

  it('Wall Bound rules', () => {
    expect(codes(parse('1,2 F! > 3 WBo!', 't8'))).toEqual(['wall-bound-after-floor-break']);
    const t7 = parse('1,2 WBo!', 't7');
    expect(t7.diagnostics.map((d) => [d.code, d.severity])).toEqual([['mechanic-conditional', 'info']]);
    expect(parse('1,2 WBo!', 't8').diagnostics).toEqual([]);
  });

  it('Tag Assault event outside TTT2', () => {
    expect(parse('1,2 TA!', 't7').diagnostics[0]?.mechanic).toBe('tagAssault');
    expect(parse('1,2 TA!', 'ttt2').diagnostics).toEqual([]);
  });

  it('; outside TTT2 is a section break with a warning', () => {
    const r = parse('1,2 ; 3,4', 't7');
    expect(r.ast.sections).toHaveLength(2);
    expect(codes(r)).toEqual(['semicolon-non-tag-game']);
  });
});

describe('dialects', () => {
  it('WB! is Wall Break by default and Wall Bound in the wall-bounce dialect', () => {
    expect(compact('1,2 WB!', 't8')).toBe('1 , 2 _ event(wallBreak:WB!)');
    expect(compact('1,2 WB!', 't8', { dialect: 'wall-bounce' })).toBe('1 , 2 _ event(wallBound:WB!)');
  });

  it('F! and FB! are both Floor Break', () => {
    expect(compact('1 F! > 2 FB!', 't8')).toBe('1 _ event(floorBreak:F!) > 2 _ event(floorBreak:FB!)');
  });

  it('T8 stage events', () => {
    expect(compact('1 WBl! > 2 FBl!', 't8')).toBe('1 _ event(wallBlast:WBl!) > 2 _ event(floorBlast:FBl!)');
  });
});

describe('aliases and normalization', () => {
  it.each([
    ['d/f+1', 'df+1'],
    ['u/b+4', 'ub+4'],
    ['↘+1', 'df+1'],
    ['↘1', 'df+1'],
    ['df1', 'df+1'],
    ['→→+2', 'f _ f+2'],
    ['D/F+1', 'DF+1'],
    ['  df + 1 ,  2  ', 'df+1 , 2'],
  ])('%s → %s', (input, expected) => {
    expect(compact(input)).toBe(expected);
  });

  it('normalized text uses canonical tokens', () => {
    expect(parse('d/f + 1 ,2 ↘1').normalized).toBe('df+1,2 df1');
  });

  it('preserves the exact original string and token spans', () => {
    const text = '  qcf+1 >  uf+2,1 B!  > SSL 1~b~↗+4 ';
    const r = parse(text, 't6');
    expect(r.original).toBe(text);
    expect(r.tokens.map((t) => t.raw).join('')).toBe(text);
    for (const t of r.tokens) expect(text.slice(t.span.start, t.span.end)).toBe(t.raw);
  });
});

describe('modifiers, prefixes and grouping', () => {
  it.each([
    ['F+2', 'F+2'],
    ['df+1*', 'df+1*'],
    ['b+1+2*', 'b+1+2*'],
    ['ws4', 'WS.4'],
    ['WS+4', 'WS.4'],
    ['FC df+1', 'FC.df+1'],
    ['FC.df+1', 'FC.df+1'],
    ['CH df+1', 'CH.df+1'],
    ['H.2+3', 'H.2+3'],
    ['1:2', '1 : 2'],
    ['df+3,2,<1', 'df+3 , 2 < 1'],
    ['1<2', '1 < 2'],
    ['b+1 x3', 'b+1x3'],
    ['df+2 [dash] f+2', 'df+2 _ opt[move(dash)] _ f+2'],
    ['1,2 (wall carry)', '1 , 2 _ note(wall carry)'],
    ['RA', 'mech(rageArt:RA)'],
    ['2+5', '2+TAG'],
    ['qcf', 'qcf'],
    ['n', 'n'],
  ])('%s → %s', (input, expected) => {
    expect(compact(input, input === '2+5' ? 'ttt2' : 't8')).toBe(expected);
  });

  it('stances prefix the next input or stand alone', () => {
    const jin = { characters: ['Jin'] };
    expect(compact('ZEN.1', 't8', jin)).toBe('ZEN.1');
    expect(compact('ZEN 1', 't8', jin)).toBe('ZEN.1');
    expect(compact('1+2 ZEN', 't8', jin)).toBe('1+2 _ stance(ZEN)');
    expect(compact('ZEN, 1', 't8', jin)).toBe('stance(ZEN) , 1');
  });

  it('dictionaries are game-specific', () => {
    expect(codes(parse('ZEN.1', 't6', { characters: ['Jin'] }))).toContain('unknown-word');
  });

  it('flags named moves outside the selected character', () => {
    const r = parse('EWGF', 't8', { characters: ['Paul'] });
    expect(toCompact(r.ast)).toBe('named(EWGF)');
    expect(r.diagnostics.map((d) => [d.code, d.severity])).toEqual([['character-move-out-of-context', 'info']]);
    expect(parse('EWGF', 't8').diagnostics).toEqual([]);
  });

  it('named moves are matched case-insensitively and keep the canonical name', () => {
    expect(compact('ewgf', 't8', { characters: ['Kazuya'] })).toBe('named(EWGF)');
  });
});

describe('unknown and ambiguous notation', () => {
  it('unknown words produce an unknown node and a warning', () => {
    const r = parse('df+1 > XYZ > 2');
    expect(toCompact(r.ast)).toBe('df+1 > ?(XYZ) > 2');
    expect(codes(r)).toEqual(['unknown-word']);
    expect(r.diagnostics[0]?.span).toEqual({ start: 7, end: 10 });
  });

  it('unknown events', () => {
    const r = parse('1,2 Q!');
    expect(toCompact(r.ast)).toBe('1 , 2 _ ?(Q!)');
    expect(codes(r)).toEqual(['unknown-event']);
  });

  it('invalid buttons', () => {
    const r = parse('1,7');
    expect(toCompact(r.ast)).toBe('1 , ?(7)');
    expect(codes(r)).toEqual(['invalid-button']);
  });

  it('adjacent buttons without operator are ambiguous', () => {
    const r = parse('12');
    expect(toCompact(r.ast)).toBe('1 _ 2');
    expect(codes(r)).toEqual(['ambiguous-adjacent-buttons']);
  });

  it('whitespace between plain inputs is flagged as info', () => {
    const r = parse('1 2');
    expect(r.diagnostics.map((d) => [d.code, d.severity])).toEqual([['ambiguous-whitespace', 'info']]);
  });

  it('dangling and unexpected operators', () => {
    expect(codes(parse('1,2,'))).toEqual(['dangling-operator']);
    expect(codes(parse('1+'))).toEqual(['dangling-operator']);
    expect(codes(parse('> 1'))).toEqual(['empty-stage']);
    expect(codes(parse('1 > > 2'))).toEqual(['empty-stage']);
    expect(codes(parse('EWGF+1', 't8', { characters: ['Kazuya'] }))).toEqual(['unexpected-operator']);
    expect(codes(parse('df+1 [2'))).toEqual(['unclosed-group']);
    expect(codes(parse('1 ] 2'))).toContain('unexpected-operator');
  });

  it('unknown characters become unknown nodes', () => {
    const r = parse('1 # 2');
    expect(toCompact(r.ast)).toBe('1 _ ?(#) _ 2');
    expect(codes(r)).toContain('unknown-token');
  });

  it('never throws on arbitrary input', () => {
    const junk = ['', '   ', '>>>', ';;;', '+++', '~,:', '[[[]]]', '((', 'H.', '*', 'x3', '!', 'Kazuya:', '5~5~5'];
    for (const text of junk) {
      expect(() => parse(text, 'ttt2')).not.toThrow();
    }
  });

  it('empty notation yields one empty section and no diagnostics', () => {
    const r = parse('');
    expect(r.ast.sections).toHaveLength(1);
    expect(r.diagnostics).toEqual([]);
  });
});
