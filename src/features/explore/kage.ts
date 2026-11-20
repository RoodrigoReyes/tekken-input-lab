import { CHARACTER_ENTRIES } from '../../notation/characters/dictionary';
import { canonicalNotation } from '../../notation/canonical';

type Game = 't7' | 't8';

const words: Record<string, string> = {
  'dash': 'dash', 'heat burst': 'HB', 'heat smash': 'HS', 'during heat': 'H.',
  'rage art': 'RA', 'rage drive': 'RD', 'ssr': 'SSR', 'ssl': 'SSL', 'ss': 'SS',
  'ws': 'WS', 'iws': 'iWS', 'fc': 'FC', 'ch': 'CH', 'bt': 'BT', 'wr': 'WR', 'cc': 'CC', 'cd': 'cd',
};
for (const entry of CHARACTER_ENTRIES) {
  if (entry.games.some((game) => game === 't7' || game === 't8')) {
    words[entry.label.toLowerCase()] = entry.abbr;
    words[entry.abbr.toLowerCase()] = entry.abbr;
  }
}

const direction = /^(?:[fbud]|[du]\/[fb]|n)$/i;
const directionText = (text: string) => {
  const value = text.replace('/', '');
  return value.toLowerCase() === 'n' || text !== text.toUpperCase() ? value.toLowerCase() : value;
};
const button = /^[1-4](?:[+~:][1-4])*\*?$/;
const named = new Set(CHARACTER_ENTRIES.filter((entry) => entry.kind === 'named').map((entry) => entry.abbr));

function splitInputs(stage: string, game: Game): string[] {
  return (stage.match(game === 't8' ? /\([^)]*\)|[^,]+/g : /\([^)]*\)|\S+/g) ?? []).map((s) => s.trim()).filter(Boolean);
}

export function kageToNotation(raw: string, game: Game, character?: string): string {
  const stages = game === 't8' ? raw.split('►') : raw.split(/\s+,\s+/);
  const converted = stages.map((stage) => {
    const inputs = splitInputs(stage, game);
    const result: string[] = [];
    for (let i = 0; i < inputs.length; i++) {
      let token = inputs[i]!;
      if (game === 't7') {
        for (let end = Math.min(i + 4, inputs.length); end > i + 1; end--) {
          const phrase = inputs.slice(i, end).join(' ');
          if (words[phrase.toLowerCase()]) { token = phrase; i = end - 1; break; }
        }
      }
      const previous = inputs[i - 1];
      if (token.startsWith('(') && previous && named.has(words[previous.toLowerCase()] ?? previous)) continue;
      const joined = /^((?:[fbud]|[du]\/[fb]|n))([:~<][1-4](?:[+~:][1-4])*\*?)$/i.exec(token);
      if (joined) {
        result.push(`${directionText(joined[1]!)}${joined[2]}`);
      } else if (direction.test(token)) {
        const dir = directionText(token);
        if (inputs[i + 1] && button.test(inputs[i + 1]!)) result.push(`${dir}+${inputs[++i]}`);
        else result.push(dir);
      } else if (/^[1-4]\*\(max\)$/i.test(token)) {
        result.push(`${token.slice(0, 2)} (max)`);
      } else if (button.test(token)) {
        result.push(token);
      } else if (/^[fbud]<[1-4]$/i.test(token)) {
        result.push(token);
      } else if (token === '*' && result.length) {
        result[result.length - 1] += '*';
      } else if (/^(?:W|WB|WBl|FBl|F|FB|BB|WBo|T|S|B)!$/i.test(token)) {
        result.push(token);
      } else if (words[token.toLowerCase()]) {
        result.push(words[token.toLowerCase()]!);
      } else {
        result.push(`(${token.replace(/[()]/g, '')})`);
      }
    }
    const prefixes = new Set(['WS', 'iWS', 'FC', 'BT', 'WR', 'CH', 'LP', 'H.', ...CHARACTER_ENTRIES.filter((entry) => entry.kind === 'stance').map((entry) => entry.abbr)]);
    return result.reduce((text, item, index) => {
      const previous = result[index - 1];
      const attach = previous && prefixes.has(previous) && /^(?:[fbudn]+[+~:]|[1-4])/i.test(item);
      const motion = previous === 'cd' && button.test(item);
      return text + (index ? motion ? '+' : attach ? (previous === 'H.' ? '' : ' ') : ',' : '') + item;
    }, '');
  }).join(' > ');
  return canonicalNotation(converted, { game, characters: character ? [character] : [] });
}
