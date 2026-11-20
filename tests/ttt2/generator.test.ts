import { describe, expect, it } from 'vitest';
import { assembleCombo, bestPick, collectPieces, generateCombos, reachesBound, type GeneratorOptions } from '../../src/ttt2/generator';
import { importGuide, rosterName, splitAdditional } from '../../src/ttt2/guideImporter';
import { analyzeRoute } from '../../src/ttt2/routeAnalysis';
import type { GuideLibrary } from '../../src/ttt2/types';
import text from './fixtures/guide-excerpt.md?raw';

const library = importGuide(text, 'excerpt');
const kit = (name: string) => library.kits.find((k) => k.character === name)!;
const pieces = (name: string, role: string, context = 'open', form?: string) =>
  kit(name).pieces.filter((p) => p.role === role && p.context === context && p.form === form);

describe('importGuide', () => {
  it('reads every character section and maps guide names to the roster', () => {
    expect(library.kits.map((k) => k.character)).toEqual(['Nina', 'Kazuya', 'Hwoarang', 'Eddy']);
    expect(kit('Kazuya').guideName).toBe('Kazuya / Devil');
    expect(rosterName('Steve Fox')).toBe('Steve');
    expect(rosterName('Dr. B')).toBe('Dr. Bosconovitch');
  });

  it('splits "|" lists into one alternative per piece, verbatim', () => {
    expect(pieces('Nina', 'taFiller').map((p) => p.notation)).toEqual([
      'uf+4,(3,)4', 'ss+1~f~2', 'b+1+4', 'df+3,2~ss+1~b~u~f+4,3,3', 'ss+1~b~u~f+4,3,3',
      'f+4,3,3', 'f,F+4', 'ss+1~f~1,1+2', 'ws+4,3',
    ]);
    expect(pieces('Nina', 'ender').map((p) => p.notation)).toEqual(['qcf+4,2,3', 'iws+1,1+2', 'iws+1, ff+3', 'ff+1+2']);
    expect(pieces('Nina', 'taFiller', 'wall')).toHaveLength(4);
  });

  it('attaches a list note only to the pieces it names', () => {
    const ta = pieces('Nina', 'taFiller');
    expect(ta.filter((p) => p.notes.length).map((p) => p.notation)).toEqual(['f,F+4']);
    expect(ta.find((p) => p.notation === 'f,F+4')?.notes[0]).toMatch(/single-hit filler damage/);
    // A note naming no piece applies to the whole list.
    expect(kit('Hwoarang').pieces.filter((p) => p.role === 'taFiller' && p.context === 'open' && !p.additional).every((p) => p.notes.length >= 1)).toBe(true);
    const route = kit('Nina').pieces.find((p) => p.role === 'route' && p.notation.startsWith('qcf+1'));
    expect(route?.starter).toBe('qcf+1');
  });

  it('reads "Additional" pieces with their condition', () => {
    const extra = kit('Hwoarang').pieces.filter((p) => p.additional);
    expect(extra.map((p) => [p.role, p.context, p.notation, p.condition])).toContainEqual([
      'taFiller', 'wall', 'u+3~, LFF 4,4,4,4', 'Ogre/big-body option; confirm it for the opponent.',
    ]);
    expect(splitAdditional('u+3, LFS f+4,3. Open-stage filler.')).toEqual({ notation: 'u+3, LFS f+4,3', condition: 'Open-stage filler.' });
  });

  it('keeps forms: Kazuya and Devil Kazuya lists, form-restricted routes', () => {
    expect(pieces('Kazuya', 'taFiller').map((p) => p.notation)).toEqual(['b+4,1', 'wgf', 'ss cd4,1']);
    expect(pieces('Kazuya', 'taFiller', 'open', 'Devil Kazuya').map((p) => p.notation)).toEqual(['cd+4,1', 'b+4,1', 'uf+1+2']);
    const both = kit('Kazuya').pieces.find((p) => p.notation === 'EWGF > 3,1,4 > db+2 > CD+4,1');
    expect(both?.forms).toEqual(['Kazuya', 'Devil Kazuya']);
  });

  it('accepts unnumbered routes and sub-headers (Hwoarang)', () => {
    const routes = kit('Hwoarang').pieces.filter((p) => p.role === 'route');
    expect(routes.find((p) => p.notation.startsWith('df+2 > f+2'))?.starter).toBe('df+2');
    expect(routes.find((p) => p.notation.startsWith('RFF f+4~4'))?.starter).toBe('RFF f+4~4');
  });

  it('records shared kits', () => {
    expect(kit('Eddy').sharedWith).toEqual(['Christie']);
  });

  it('reports what it cannot classify instead of guessing', () => {
    for (const s of library.skipped) expect(s.reason).toBeTruthy();
  });
});

describe('analyzeRoute', () => {
  it('splits at the Bound and estimates hits', () => {
    const a = analyzeRoute('qcf+1 > uf+2,1 B! > SSL 1~b~uf+4 > f+1,2,1+2', 'Nina');
    expect(a).toMatchObject({ opener: 'qcf+1 > uf+2,1 B!', soloFinish: 'SSL 1~b~uf+4 > f+1,2,1+2', boundMove: 'uf+2,1', boundHits: 2, preTaHits: 3, usesWall: false });
  });

  it('counts named moves and repeats', () => {
    expect(analyzeRoute('EWGF > b+2,4 > db+2 B! > cd+4,1', 'Kazuya')).toMatchObject({ preTaHits: 4, boundMove: 'db+2', boundHits: 1 });
    expect(analyzeRoute('qcb+4 > uf+4 > df+1 > iWS+1 ×5 > f+1+4 B!', 'Nina').preTaHits).toBe(9);
  });

  it('detects wall routes and routes without Bound', () => {
    expect(analyzeRoute('f+2 W! > uf+3 B! > df+3,2,1', 'Kazuya').usesWall).toBe(true);
    expect(analyzeRoute('LP > f+4', 'Kazuya').opener).toBeUndefined();
  });
});

describe('generateCombos', () => {
  const base: GeneratorOptions = {
    point: 'Kazuya',
    partner: 'Nina',
    context: 'open',
    routeKinds: ['normal', 'counterHit', 'lowParry'],
    fillerBy: 'partner',
    enderBy: 'point',
  };

  it('Kazuya + Nina: routes with B! × Nina TA fillers × Kazuya enders', () => {
    const r = generateCombos(library, base);
    expect(r.stats).toMatchObject({ routes: 2, fillers: 9, enders: 2, candidates: 36, valid: 36 });
    expect(r.combos.every((c) => c.notation.split('B!').length === 2)).toBe(true);
    expect(r.stats.rejected['R1 route has no B!']).toBeGreaterThan(0);
    const first = r.combos.find((c) => c.filler?.notation === 'f+4,3,3' && c.ender?.notation === 'cd+4,1');
    expect(first?.notation).toBe('Kazuya:\nEWGF > b+2,4 > db+2 B! > TA!\nNina:\nf+4,3,3\nKazuya:\ncd+4,1');
  });

  it('merges consecutive sections of the same character', () => {
    const r = generateCombos(library, { ...base, enderBy: 'partner', limit: 1 });
    expect(r.combos[0]?.notation).toMatch(/^Kazuya:\n.+ > TA!\nNina:\n.+ > .+$/);
  });

  /** Small synthetic library: one route, two fillers (one with a notation problem), one ender. */
  const synthetic = (): GuideLibrary => ({
    title: 't',
    skipped: [],
    kits: [
      { character: 'Nina', guideName: 'Nina', sharedWith: [], pieces: [
        { id: 'r', character: 'Nina', role: 'route', context: 'open', routeKind: 'normal', notation: 'qcf+1 > uf+2,1 B!', additional: false, notes: [] },
        { id: 'e', character: 'Nina', role: 'ender', context: 'open', notation: 'qcf+4,2,3', additional: false, notes: [] },
      ] },
      { character: 'Lee', guideName: 'Lee', sharedWith: [], pieces: [
        { id: 'ok', character: 'Lee', role: 'taFiller', context: 'open', notation: 'b+3,4,3', additional: false, notes: [] },
        { id: 'bad', character: 'Lee', role: 'taFiller', context: 'open', notation: 'zzz 1', additional: false, notes: ['Check timing.'] },
      ] },
    ],
  });
  const leeOpts = { ...base, point: 'Nina', partner: 'Lee' };

  it('ranks combos with fewer things to verify first', () => {
    const { combos } = generateCombos(synthetic(), leeOpts);
    expect(combos.map((c) => c.filler?.id)).toEqual(['ok', 'bad']);
    expect(combos[1]?.flags.map((f) => f.kind).sort()).toEqual(['notation', 'note']);
    const flags = generateCombos(library, base).combos.map((c) => c.flags.length);
    expect(flags).toEqual([...flags].sort((a, b) => a - b));
  });

  it('onlyClean drops pieces whose notation has warnings', () => {
    const r = generateCombos(synthetic(), { ...leeOpts, onlyClean: true });
    expect(r.combos.map((c) => c.filler?.id)).toEqual(['ok']);
  });

  it('Nina\'s TA list from the guide is entirely clean now', () => {
    expect(generateCombos(library, { ...base, onlyClean: true }).stats.fillers).toBe(9);
  });

  it('respects forms', () => {
    const devil = generateCombos(library, { ...base, point: 'Nina', partner: 'Kazuya', partnerForm: 'Devil Kazuya', fillerBy: 'partner' });
    expect(new Set(devil.combos.map((c) => c.filler?.notation))).toEqual(new Set(['cd+4,1', 'b+4,1', 'uf+1+2']));
  });

  it('wall context: wall lists, wall routes, and open routes flagged to verify the carry', () => {
    const opts = { ...base, context: 'wall' as const, routeKinds: ['normal', 'wall'] as const };
    const r = generateCombos(library, opts);
    expect(r.combos.every((c) => c.filler?.context === 'wall' && c.ender?.context === 'wall')).toBe(true);
    const open = r.combos.filter((c) => c.route.context === 'open');
    expect(open.length).toBeGreaterThan(0);
    expect(open.every((c) => c.flags.some((f) => f.text.includes('carries the opponent to the wall')))).toBe(true);
    const strict = generateCombos(library, { ...opts, wallRoutes: 'wallOnly' });
    expect(strict.combos.every((c) => c.route.context === 'wall')).toBe(true);
    expect(strict.combos.length).toBeGreaterThan(0);
  });

  it('additional (conditional) pieces only when requested, with their condition as a flag', () => {
    const opts = { ...base, point: 'Nina', partner: 'Hwoarang', context: 'open' as const };
    const without = generateCombos(library, opts);
    const withExtra = generateCombos(library, { ...opts, includeAdditional: true });
    expect(withExtra.stats.fillers).toBe(without.stats.fillers + 2);
    expect(withExtra.combos.some((c) => c.flags.some((f) => f.kind === 'condition' && f.text === 'Open-stage filler.'))).toBe(true);
  });

  it('rejects combos that would use a second Bound (R4)', () => {
    const lib: GuideLibrary = {
      title: 't',
      skipped: [],
      kits: [
        { character: 'Nina', guideName: 'Nina', sharedWith: [], pieces: [
          { id: 'r', character: 'Nina', role: 'route', context: 'open', routeKind: 'normal', notation: 'qcf+1 > uf+2,1 B!', additional: false, notes: [] },
          { id: 'f', character: 'Nina', role: 'taFiller', context: 'open', notation: 'b+1+4 B!', additional: false, notes: [] },
          { id: 'e', character: 'Nina', role: 'ender', context: 'open', notation: 'qcf+4,2,3', additional: false, notes: [] },
        ] },
        { character: 'Lee', guideName: 'Lee', sharedWith: [], pieces: [] },
      ],
    };
    const r = generateCombos(lib, { ...base, point: 'Nina', partner: 'Lee', fillerBy: 'point' });
    expect(r.combos).toEqual([]);
    expect(r.stats.rejected['R4 extender-repeated']).toBe(1);
  });

  it('air throws end the combo only with the character who started it', () => {
    const lib = importGuide(
      ['# Armor King', '## Solo Combos', '1. d+2 B! > f+1+4', '## Ender', 'WR3', 'Additional Air Ender: f,hcf+1. Air throw (Muscle Driver).', '# Kazuya', '## TA!', 'b+4,1', '## Ender', 'cd+4,1'].join('\n'),
    );
    const air = lib.kits[0]!.pieces.find((p) => p.airThrow);
    expect(air).toMatchObject({ role: 'ender', context: 'open', notation: 'f,hcf+1', additional: true });
    const opts = { ...base, point: 'Armor King', partner: 'Kazuya', includeAdditional: true };
    const byStarter = collectPieces(lib, { ...opts, enderBy: 'point' })!;
    expect(byStarter.enders.map((e) => e.piece.notation)).toEqual(['WR3', 'f,hcf+1']);
    const byMate = collectPieces(lib, { ...opts, point: 'Kazuya', partner: 'Armor King', fillerBy: 'point', enderBy: 'partner' })!;
    expect(byMate.enders.map((e) => e.piece.notation)).toEqual(['WR3']);
  });

  it('returns nothing for unknown characters', () => {
    expect(generateCombos(library, { ...base, partner: 'Nobody' }).combos).toEqual([]);
  });
});

describe('layered builder (collectPieces / assembleCombo / bestPick)', () => {
  const base: GeneratorOptions = {
    point: 'Kazuya',
    partner: 'Nina',
    context: 'open',
    routeKinds: ['normal', 'counterHit', 'lowParry'],
    fillerBy: 'partner',
    enderBy: 'point',
  };

  it('exposes the usable pieces of each phase with their performers', () => {
    const pools = collectPieces(library, base)!;
    expect(pools.routes.filter(reachesBound)).toHaveLength(2);
    expect(pools.fillers).toHaveLength(9);
    expect(pools.enders).toHaveLength(2);
    expect(pools.fillers.every((f) => f.piece.character === 'Nina')).toBe(true);
    expect(pools.enders.every((e) => e.piece.character === 'Kazuya')).toBe(true);
    expect(pools).toMatchObject({ point: 'Kazuya', fillerCharacter: 'Nina', enderCharacter: 'Kazuya' });
  });

  it('returns null for unknown characters', () => {
    expect(collectPieces(library, { ...base, point: 'Nobody' })).toBeNull();
  });

  it('assembles exactly the combo the full generator would build for the same pieces', () => {
    const pools = collectPieces(library, base)!;
    for (const combo of generateCombos(library, base).combos) {
      const built = assembleCombo(pools, { routeId: combo.route.id, fillerId: combo.filler!.id, enderId: combo.ender!.id });
      expect(built).toEqual(combo);
    }
  });

  it('returns null when a chosen piece is not available', () => {
    const pools = collectPieces(library, base)!;
    const pick = bestPick(pools)!;
    expect(assembleCombo(pools, { ...pick, enderId: 'missing' })).toBeNull();
  });

  it('picks, by default, a combo with as few things to verify as the best ranked one', () => {
    const pools = collectPieces(library, base)!;
    const best = assembleCombo(pools, bestPick(pools)!)!;
    expect(best.flags.length).toBe(generateCombos(library, base).combos[0]!.flags.length);
    expect(best.route.routeKind).toBe('normal');
  });

  it('falls back to a solo route when no team combo can be built, and has no pick without routes', () => {
    const pools = collectPieces(library, base)!;
    const solo = assembleCombo(pools, bestPick({ ...pools, enders: [] })!)!;
    expect(solo.filler).toBeUndefined();
    expect(bestPick({ ...pools, enders: [], routes: pools.routes.filter(reachesBound) })).toBeNull();
  });

  it('offers routes without B! (e.g. low parry) as solo combos: the whole route, no TA', () => {
    const pools = collectPieces(library, base)!;
    const lp = pools.routes.find((r) => r.piece.routeKind === 'lowParry')!;
    expect(reachesBound(lp)).toBe(false);
    const combo = assembleCombo(pools, { routeId: lp.piece.id, fillerId: '', enderId: '' })!;
    expect(combo.notation).toBe(`Kazuya:\n${lp.piece.notation}`);
    expect(combo.filler ?? combo.ender).toBeUndefined();
    // At the wall, open-ground solo routes are left out (they would ignore the wall lists).
    const wall = collectPieces(library, { ...base, context: 'wall', routeKinds: ['normal', 'counterHit', 'lowParry', 'wall'] })!;
    expect(wall.routes.some((r) => !reachesBound(r) && r.piece.context === 'open')).toBe(false);
  });
});

describe('personally verified enders', () => {
  it('keeps verified moves without heuristic suggestions and scopes them to the selected form', () => {
    const lib = importGuide(text, 'excerpt');
    const opts = { point: 'Kazuya', partner: 'Nina', context: 'open' as const, routeKinds: ['normal' as const], fillerBy: 'partner' as const, enderBy: 'point' as const, verifiedEnders: [{ character: 'Kazuya', form: 'Kazuya', notation: 'd/f+1,2' }] };
    const pools = collectPieces(lib, opts)!;
    expect(pools.enders.some((e) => e.piece.notation === 'd/f+1,2')).toBe(true);
    expect(collectPieces(lib, { ...opts, pointForm: 'Devil Kazuya' })!.enders.some((e) => e.piece.notation === 'd/f+1,2')).toBe(false);
    expect(collectPieces(lib, { ...opts, enderBy: 'partner' })!.enders.some((e) => e.piece.notation === 'd/f+1,2')).toBe(false);
  });
});
