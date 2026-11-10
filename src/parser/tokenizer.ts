/**
 * Tokenizer: original text → tokens. Every token keeps its exact raw text and
 * a span into the original string, so `tokens.map(t => t.raw).join('')`
 * always reproduces the input. Aliases (d/f, arrows, x3, …) are resolved into
 * `canonical`, but nothing is dropped.
 */
import { ARROW_DIRECTIONS, lookupDirection, lookupMotion, own } from '../notation/core/lexicon';
import type { Token, TokenType } from '../types/notation';

export interface TokenizeOptions {
  /** Character names recognized as `Name:` section labels at line start or after `;`. */
  labelNames?: readonly string[];
}

const SINGLE_CHAR: Readonly<Record<string, TokenType>> = {
  '+': 'plus',
  ',': 'comma',
  '~': 'tilde',
  '>': 'stage',
  ':': 'colon',
  '<': 'delay',
  '*': 'hold',
  ';': 'semicolon',
  '.': 'dot',
  '[': 'lbracket',
  ']': 'rbracket',
};

const isLetter = (c: string | undefined): boolean => c !== undefined && /[A-Za-z]/.test(c);
const isDigit = (c: string | undefined): boolean => c !== undefined && /[0-9]/.test(c);
const isSpace = (c: string | undefined): boolean => c !== undefined && /\s/.test(c);

class Tokenizer {
  private readonly tokens: Token[] = [];
  private i = 0;
  private lineStart = true;
  private readonly labelNames: string[];

  constructor(
    private readonly text: string,
    options: TokenizeOptions,
  ) {
    // Longest first so "Armor King" wins over "King".
    this.labelNames = [...new Set(options.labelNames ?? [])].sort((a, b) => b.length - a.length);
  }

  run(): Token[] {
    while (this.i < this.text.length) {
      this.next();
    }
    return this.tokens;
  }

  private push(type: TokenType, start: number, end: number, extra: Partial<Token> = {}): void {
    const raw = this.text.slice(start, end);
    this.tokens.push({ type, raw, canonical: raw, span: { start, end }, ...extra });
    this.i = end;
  }

  private next(): void {
    const { text, i } = this;
    const c = text[i] as string;

    if (isSpace(c)) {
      let end = i;
      while (isSpace(text[end])) end++;
      const raw = text.slice(i, end);
      const newline = /[\r\n]/.test(raw);
      this.push('ws', i, end, { canonical: ' ', newline });
      if (newline) this.lineStart = true;
      return;
    }

    if (this.lineStart && this.tryLabel()) return;
    this.lineStart = false;

    if (c === ';') {
      this.push('semicolon', i, i + 1);
      this.lineStart = true;
      return;
    }

    const single = own(SINGLE_CHAR, c);
    if (single) {
      this.push(single, i, i + 1);
      return;
    }

    if (isDigit(c)) {
      this.push('button', i, i + 1, { button: Number(c) });
      return;
    }

    const arrow = own(ARROW_DIRECTIONS, c);
    if (arrow) {
      this.push('direction', i, i + 1, { canonical: arrow, direction: arrow, held: false });
      return;
    }

    if (c === '(') {
      this.readNote();
      return;
    }

    if (c === '×' && isDigit(text[i + 1])) {
      this.readRepeat(i + 1);
      return;
    }

    if (isLetter(c)) {
      this.readWord();
      return;
    }

    // Unknown single code point (keep surrogate pairs together).
    const cp = text.codePointAt(i) ?? 0;
    this.push('unknown', i, i + (cp > 0xffff ? 2 : 1));
  }

  /** `Name:` at line start (or after `;`) where Name is a known character. */
  private tryLabel(): boolean {
    const { text, i } = this;
    for (const name of this.labelNames) {
      const candidate = text.slice(i, i + name.length);
      if (candidate.localeCompare(name, undefined, { sensitivity: 'base' }) !== 0) continue;
      let j = i + name.length;
      if (isLetter(text[j]) || isDigit(text[j])) continue;
      while (text[j] === ' ' || text[j] === '\t') j++;
      if (text[j] !== ':') continue;
      this.push('label', i, j + 1, { canonical: `${name}:`, character: name });
      this.lineStart = false;
      return true;
    }
    return false;
  }

  private readNote(): void {
    const { text, i } = this;
    let depth = 0;
    let end = i;
    while (end < text.length) {
      const ch = text[end];
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      end++;
      if (depth === 0) break;
    }
    this.push('note', i, end, { closed: depth === 0 });
  }

  private readRepeat(digitsStart: number): void {
    let end = digitsStart;
    while (isDigit(this.text[end])) end++;
    const count = Number(this.text.slice(digitsStart, end));
    this.push('repeat', this.i, end, { canonical: `x${count}`, count });
  }

  private readWord(): void {
    const { text, i } = this;
    let end = i;
    while (isLetter(text[end])) end++;
    const word = text.slice(i, end);

    // d/f, u/b, D/F … (slash direction aliases)
    if (
      word.length === 1 &&
      /[dDuU]/.test(word) &&
      text[end] === '/' &&
      /[fFbB]/.test(text[end + 1] ?? '') &&
      !isLetter(text[end + 2])
    ) {
      const joined = word + (text[end + 1] as string);
      const dir = lookupDirection(joined);
      if (dir) {
        this.push('direction', i, end + 2, { canonical: joined, direction: dir.value, held: dir.held });
        return;
      }
    }

    if (text[end] === '!') {
      this.push('event', i, end + 1);
      return;
    }

    if ((word === 'x' || word === 'X') && isDigit(text[end])) {
      this.readRepeat(end);
      return;
    }

    const dir = lookupDirection(word);
    if (dir) {
      this.push('direction', i, end, { direction: dir.value, held: dir.held });
      return;
    }

    const motion = lookupMotion(word);
    if (motion) {
      this.push('motion', i, end, { canonical: motion.id, motion: motion.id });
      return;
    }

    this.push('word', i, end);
  }
}

export function tokenize(text: string, options: TokenizeOptions = {}): Token[] {
  return new Tokenizer(text, options).run();
}
