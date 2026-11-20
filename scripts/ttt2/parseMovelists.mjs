import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const source = path.join(root, 'src/data/ttt2/movelists-src');
const output = path.join(root, 'src/data/ttt2/movelists.json');
const files = (await readdir(source)).filter((file) => file.endsWith('.wikitext') && !file.startsWith('Category:')).sort();
const catalog = {};

for (const file of files) {
  const content = await readFile(path.join(source, file), 'utf8');
  const moves = [];
  let isThrowTable = false;
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (line.startsWith('{|')) isThrowTable = false;
    if (/\|\s*Throw Name\s*$/i.test(line)) isThrowTable = true;
    const nameMatch = line.match(/^!\s*\[\[([^\]]+)\]\]/);
    if (!nameMatch) continue;
    const commandLine = lines[i + 1]?.trim();
    const rangeLine = lines[i + 3]?.trim();
    if (!commandLine?.startsWith('!') || !rangeLine?.startsWith('!')) continue;
    const name = nameMatch[1].split('|').at(-1).trim();
    const command = commandLine.slice(1).trim();
    if (!name || !command) continue;
    const hits = isThrowTable ? [] : rangeLine.slice(1).split(',').flatMap((hit) => {
      const level = hit.trim().toLowerCase();
      if (level === 'high') return ['h'];
      if (level === 'mid') return ['m'];
      if (level === 'low') return ['l'];
      if (level === '!' || level === 'unblockable') return ['!'];
      return [];
    });
    moves.push({ name, command, hits });
  }
  catalog[file.slice(0, -'.wikitext'.length).replaceAll('_', ' ')] = moves;
}

await writeFile(output, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Parsed ${Object.keys(catalog).length} characters into ${path.relative(root, output)}`);
