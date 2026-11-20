import { canonicalNotation } from '../../notation/canonical';

/** Translate Merlin's sheet notation without hiding unsupported input. */
export function merlinToNotation(text: string, character?: string): string {
  const converted = text.split(/(\([^)]*\))/g).map((part, index) => index % 2 ? part : part
    .replace(/\*/g, '')
    .replace(/(?:[ \t]+-[ \t]*|[ \t]*-[ \t]+)/g, ' > ')
    .replace(/\b([dDuU])\/([fFbB])(?=[+1-4\s,]|$)/g, (_, vertical: string, horizontal: string) =>
      vertical === vertical.toUpperCase() && horizontal === horizontal.toUpperCase() ? vertical + horizontal : (vertical + horizontal).toLowerCase(),
    )
    .replace(/\[([^\]]+)\]/g, '<$1')
    .replace(/\bdelay[ \t]+(?=[^\s>\-])/gi, '<')
    .replace(/\bCD(?=[1-4])/gi, 'cd+')
    .replace(/\bjab\b/gi, '1')
    .replace(/[ \t]+x[ \t]*(\d)\b/g, ' x$1'),
  ).join('');
  return canonicalNotation(converted, { game: 't6', characters: character ? [character] : [] });
}
