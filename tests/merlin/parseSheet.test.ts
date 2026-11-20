// @ts-expect-error Node types are not included in the app's TypeScript configuration.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import data from '../../src/data/t6-merlin/t6.json';
// @ts-expect-error The standalone Node script has no TypeScript declarations.
import { parseSheet, readCsv } from '../../scripts/merlin/parseSheet.mjs';

const sheet = (name: string) => parseSheet(readFileSync(`src/data/t6-merlin/csv/${name}.csv`, 'utf8'), name);

describe('Merlin sheet importer', () => {
  it('reads quoted multiline cells and escaped quotes', () => {
    expect(readCsv('a,"b\nc","d""e"\r\nx,y,z\r\n')).toEqual([['a', 'b\nc', 'd"e'], ['x', 'y', 'z']]);
  });

  it('preserves Kazuya routes and the separate sections', () => {
    const kazuya = sheet('Kazuya');
    expect(kazuya.structure).toContainEqual({ launchers: ['EWGF'], routes: expect.arrayContaining(['EWGF - df+1,2 - B!']) });
    expect(kazuya.structure.find((group: { launchers: string[] }) => group.launchers.includes('EWGF')).routes).toHaveLength(3);
    expect(kazuya.structure.some((group: { launchers: string[] }) => group.launchers.includes('f,F+3'))).toBe(true);
    expect(kazuya.postBound).toHaveLength(6);
    expect(kazuya.postBound).toContain('CD4,1');
    expect(kazuya.counterHit[0].launchers).toContain('B+4');
    expect(kazuya.punish).toContainEqual({ startup: '10f', stand: '1,1,2 / 1,2,2', crouch: 'd+1' });
    expect(kazuya.wall.boundToSplat).toContain('1 - EWGF - 1+2');
  });

  it('preserves notes and handles Steve’s reversed structure columns', () => {
    expect(sheet('Baek').notes[0]).toContain('Can input 3+4');
    expect(sheet('Steve').counterHit[0].launchers).toContain('B+1');
    expect(sheet('Steve').structure[0].launchers).toContain('U/f+2');
  });

  it('preserves Merlin hard marks on pieces only', () => {
    expect(data.characters.find(c => c.name === 'Nina')?.hard).toContain('df+3,2~SSR - SS1~b - uf+4 - uWS1 x3 - 1+4 - B!');
    const nina = data.characters.find(c => c.name === 'Nina')?.hard;
    expect(nina).toHaveLength(19);
    // Matches despite the sheet's double space, and both routes of a two-line red cell count.
    expect(nina).toContain('uf4 - iWS1 x 6 - 1+4  - B!');
    expect(nina).toEqual(expect.arrayContaining(['cc - df+3,2~SSR - SS1~f - iWS1 x4 - 1+4 - B!', 'ws1 - SSR - d+4,1 - iWS1 x4 - 1+4 - B!']));
    expect(data.characters.find(c => c.name === 'Steve')?.hard).toHaveLength(2);
    expect(data.characters.find(c => c.name === 'Kazuya')?.hard).toEqual([]);
  });

  it('splits alternatives into individual pieces and removes wall continuation markers', () => {
    const baek = sheet('Baek');
    expect(baek.guaranteed[0].starters).toEqual(['CH U/f+2', 'CH f,F+4', '(F+2,1,)2']);
    expect(baek.wall.boundToSplat).toContain('iFLA f+3, 4, d+4,4');
    for (const c of data.characters) {
      const pieces = [
        ...c.guaranteed.flatMap(g => [...g.starters, ...g.followUps]),
        ...c.structure.flatMap(g => [...g.launchers, ...g.routes]),
        ...c.counterHit.flatMap(g => [...g.launchers, ...g.routes]),
        ...c.lowParry, ...c.postBound, ...c.wall.splatToBound, ...c.wall.boundToSplat,
      ];
      expect(pieces.every(piece => !/[\r\n]/.test(piece)), c.name).toBe(true);
    }
  });
});
