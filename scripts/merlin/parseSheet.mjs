import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSrQDVLlXLCnW7Bo1LnF2yBjObEBWady8sfX4Fz8j2lUIpAINFQWa0f5-qBLUR8QMcjEX5NtCx1pgUU/pubhtml';

export function readCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"' && cell === '') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n' || char === '\r') {
      row.push(cell); rows.push(row); row = []; cell = '';
      if (char === '\r' && text[i + 1] === '\n') i++;
    } else cell += char;
  }
  if (quoted) throw new Error('Unclosed quoted CSV cell');
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const lines = (cell = '') => cell.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
const value = (row, col) => (row?.[col] ?? '').trim();

export function redTexts(html) {
  const colors = new Map([...html.matchAll(/\.([\w-]+)\s*\{([^}]*)\}/g)].flatMap(([, name, rule]) => rule.match(/\bcolor\s*:\s*(#[\da-f]{6})/i) ? [[name, rule.match(/\bcolor\s*:\s*(#[\da-f]{6})/i)[1].toLowerCase()]] : []));
  const text = (content) => content.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').split(/\n/).map(line => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const red = [];
  for (const [, attrs, content] of html.matchAll(/<span\b([^>]*)>([\s\S]*?)<\/span>/gi)) if (/color\s*:\s*#ff0000\b/i.test(attrs)) red.push(...text(content));
  for (const [, attrs, content] of html.matchAll(/<(td|th)\b([^>]*)>([\s\S]*?)<\/\1>/gi)) {
    if (/color\s*:\s*#ff0000\b/i.test(attrs) || [...(attrs.match(/class=["']([^"']*)/)?.[1] ?? '').split(/\s+/)].some(c => colors.get(c) === '#ff0000')) red.push(...text(content));
  }
  return [...new Set(red)];
}

export function parseSheet(text, name, html = '') {
  const rows = readCsv(text);
  const find = (col, label) => rows.findIndex(row => value(row, col).toLowerCase() === label.toLowerCase());
  const guaranteedStart = find(1, 'Guaranteed Hits');
  const wallStart = find(1, 'Wall Combos');
  const punishStart = find(1, 'Punishment');
  const structureStart = rows.findIndex(row => /combo structure/i.test(value(row, 5)));
  const reversed = /counter hit/i.test(value(rows[structureStart], 5));
  const routeGroups = col => rows.slice(structureStart + 2).flatMap(row => {
    const launchers = lines(row[col]);
    return launchers.length ? [{ launchers, routes: lines(row[col + 1]) }] : [];
  });
  const middle = routeGroups(5);
  const right = routeGroups(10);
  const lowParry = middle.filter(group => group.launchers.length === 1 && group.launchers[0].toLowerCase() === 'low parry').flatMap(group => group.routes);
  const regularMiddle = middle.filter(group => !(group.launchers.length === 1 && group.launchers[0].toLowerCase() === 'low parry'));
  const wallHeader = rows[wallStart + 1] ?? [];
  const splatCol = wallHeader.findIndex(cell => cell.trim().toLowerCase() === 'splat > bound');
  let boundCol = wallHeader.findIndex(cell => cell.trim().toLowerCase() === 'bound > splat');
  if (boundCol === 3 && !rows.slice(wallStart + 2, punishStart).some(row => value(row, 3))) boundCol = 2;
  const playersStart = find(5, 'Players to Watch');
  const notesStart = find(10, 'Notes');
  const result = {
    name,
    players: playersStart < 0 ? [] : rows.slice(playersStart + 1, structureStart).flatMap(row => [...lines(row[5]), ...lines(row[6])]),
    notes: notesStart < 0 ? [] : rows.slice(notesStart + 1, structureStart).flatMap(row => lines(row[10])),
    guaranteed: rows.slice(guaranteedStart + 2, wallStart).flatMap(row => value(row, 1) || value(row, 2) ? [{ starters: lines(row[1]), followUps: lines(row[2]) }] : []),
    structure: reversed ? right : regularMiddle,
    counterHit: reversed ? regularMiddle : right,
    lowParry,
    postBound: lines(rows[structureStart + 2]?.[8]),
    wall: {
      splatToBound: rows.slice(wallStart + 2, punishStart).flatMap(row => lines(row[splatCol]).map(line => line.replace(/^-\s+/, ''))),
      boundToSplat: rows.slice(wallStart + 2, punishStart).flatMap(row => lines(row[boundCol]).map(line => line.replace(/^-\s+/, ''))),
    },
    punish: rows.slice(punishStart + 2).flatMap(row => value(row, 1) ? [{ startup: value(row, 1), stand: value(row, 2), crouch: value(row, 3) }] : []),
  };
  // Red text is whitespace-collapsed; stored pieces keep the sheet's spacing (e.g. "1+4  - B!").
  const squash = (s) => s.replace(/\s+/g, ' ').trim();
  const pieces = new Map([
    ...result.guaranteed.flatMap(g => [...g.starters, ...g.followUps]),
    ...result.structure.flatMap(g => [...g.launchers, ...g.routes]),
    ...result.counterHit.flatMap(g => [...g.launchers, ...g.routes]),
    ...result.lowParry, ...result.postBound, ...result.wall.splatToBound, ...result.wall.boundToSplat,
  ].map(piece => [squash(piece), piece]));
  result.hard = [...new Set(redTexts(html).filter(piece => piece !== '*' && piece !== '*?' && pieces.has(squash(piece))).map(piece => pieces.get(squash(piece))))];
  return result;
}

async function main() {
  const dir = join(root, 'src/data/t6-merlin/csv');
  const files = (await readdir(dir)).filter(file => file.endsWith('.csv') && file !== 'INFO.csv').sort();
  const characters = await Promise.all(files.map(async file => {
    const name = basename(file, '.csv');
    return parseSheet(await readFile(join(dir, file), 'utf8'), name, await readFile(join(root, 'src/data/t6-merlin/archive', `${name}.html`), 'utf8'));
  }));
  await writeFile(join(root, 'src/data/t6-merlin/t6.json'), JSON.stringify({ source, author: 'Merlin', characters }, null, 2) + '\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
