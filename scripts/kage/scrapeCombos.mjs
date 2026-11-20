#!/usr/bin/env node
/**
 * Downloads community combos from the Kage combo sites (Tekken 8 and Tekken 7)
 * into src/data/community/kage-<game>.json. Each entry keeps the original text
 * and a link to its source page; conversion to app notation happens in the app.
 *
 * Usage: node scripts/kage/scrapeCombos.mjs [t8|t7] [--limit=N characters]
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITES = {
  t8: { base: 'https://tekken8combo.kagewebsite.com', link: (id) => `https://tekken8combo.kagewebsite.com/combo/${id}` },
  t7: { base: 'https://tekken7combo.kagewebsite.com', link: (id) => `https://tekken7combo.kagewebsite.com/combo.php?combo=${id}` },
};
const DELAY_MS = 1200;
const MAX_PAGES = 200;
const USER_AGENT = 'tekken-input-lab-combo-import/1.0 (open-source combo viewer)';
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../src/data/community');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
function unescapeHtml(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}
const text = (html) => unescapeHtml(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

async function get(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (res.ok) return res.text();
    if (res.status === 404) throw new Error(`404 ${url}`);
    console.warn(`HTTP ${res.status} on ${url}, retry ${attempt}`);
    await sleep(DELAY_MS * 4 * attempt);
  }
  throw new Error(`Failed after retries: ${url}`);
}

function characterSlugs(html, base) {
  const re = new RegExp(`href="${base.replace(/\./g, '\\.')}/combos-([a-z0-9-]+)/?"`, 'g');
  return [...new Set([...html.matchAll(re)].map((m) => m[1]))].sort();
}

export function parseComboItems(html, game) {
  const starts = [...html.matchAll(/class="combo-item[^"]*"\s+id="combo-(\d+)"/g)];
  return starts.map((m, i) => {
    const chunk = html.slice(m.index, starts[i + 1]?.index ?? m.index + 20000);
    const id = Number(m[1]);
    const raw = text(/<p class="comboTxt"[^>]*>([\s\S]*?)<\/p>/.exec(chunk)?.[1] ?? '');
    const character = text(/itemprop="character">\s*<a[^>]*>([\s\S]*?)<\/a>/.exec(chunk)?.[1] ?? '');
    const author = text(/itemprop="author"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/.exec(chunk)?.[1] ?? '');
    const date = /dateCreated">[^<]*?(\d{2}\/\d{2}\/\d{4})/.exec(chunk)?.[1] ?? null;
    const badgeBlock = /<p class="comboBadges">([\s\S]*?)<\/p>/.exec(chunk)?.[1] ?? '';
    const badges = [...badgeBlock.matchAll(/<span class="badge[^"]*"[^>]*>([\s\S]*?)<\/span>/g)].map((b) => text(b[1])).filter(Boolean);
    const num = (re) => { const b = badges.find((x) => re.test(x)); return b ? Number(re.exec(b)[1]) : null; };
    return {
      id,
      game,
      character,
      raw,
      hits: num(/^(\d+) hits?$/i),
      damage: num(/^(\d+) damages?$/i),
      tags: badges.filter((b) => !/^(\d+ (hits?|damages?)|#\d+)$/i.test(b)),
      author,
      date,
      source: SITES[game].link(id),
    };
  });
}

const maxPage = (html) => Math.max(1, ...[...html.matchAll(/[?&]page=(\d+)/g)].map((m) => Number(m[1])));

async function scrapeGame(game, limit) {
  const { base } = SITES[game];
  const slugs = characterSlugs(await get(`${base}/`), base).slice(0, limit);
  const combos = new Map();
  for (const slug of slugs) {
    // T7 only links the previous/next page, so keep paging until a page brings nothing new.
    let page = 1;
    for (; page <= MAX_PAGES; page++) {
      const html = await get(`${base}/combos-${slug}/?&page=${page}`);
      const items = parseComboItems(html, game).filter((c) => c.raw && !combos.has(c.id));
      for (const c of items) combos.set(c.id, c);
      await sleep(DELAY_MS);
      if (items.length === 0 || page >= maxPage(html)) break;
    }
    console.log(`${game} ${slug}: ${page} page(s), total ${combos.size}`);
  }
  const out = {
    source: base,
    note: 'Community combos from the Kage combo site. Each combo belongs to its author; see the source link. Not covered by the project MIT license.',
    fetchedAt: new Date().toISOString(),
    combos: [...combos.values()].sort((a, b) => a.character.localeCompare(b.character) || b.id - a.id),
  };
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, `kage-${game}.json`), JSON.stringify(out, null, 1) + '\n');
  console.log(`Wrote ${out.combos.length} ${game} combos`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const games = process.argv.slice(2).filter((a) => a in SITES);
  const limit = Number(/--limit=(\d+)/.exec(process.argv.join(' '))?.[1] ?? Infinity);
  for (const game of games.length ? games : ['t8', 't7']) await scrapeGame(game, limit);
}
