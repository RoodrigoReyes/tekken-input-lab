/**
 * Recursive-descent parser: tokens → AST + syntactic diagnostics.
 * See grammar.ts for the grammar. The parser never throws: anything it cannot
 * interpret becomes an `unknown` node with a diagnostic.
 */
import { lookupMovement, lookupState, HEAT_PREFIX, TAG_BUTTON } from '../notation/core/lexicon';
import { lookupCharacterWord, type CharacterLookup } from '../notation/characters/dictionary';
import { lookupEvent, type Dialect } from '../notation/dialects';
import { getGame } from '../notation/games';
import { MECHANICS, lookupMechanicWord, type MechanicId } from '../notation/mechanics';
import type {
  AttackButton,
  ComboNode,
  Diagnostic,
  GameId,
  InputNode,
  ItemNode,
  Prefix,
  Relation,
  SectionBoundary,
  SectionNode,
  Severity,
  Span,
  StageNode,
  Step,
  Token,
  TokenType,
} from '../types/notation';
import { ITEM_START_TOKENS, PREFIXABLE_TOKENS, RELATION_TOKENS } from './grammar';

export interface ParseContext {
  game: GameId;
  dialect: Dialect;
  /** Selected characters (primary first). Used to resolve character-specific words. */
  characters: readonly string[];
}

interface SigToken extends Token {
  /** Whitespace preceded this token. */
  spaceBefore: boolean;
}

type StopSet = ReadonlySet<TokenType>;
const SECTION_STOPS: StopSet = new Set<TokenType>(['semicolon', 'label']);
const STAGE_STOPS: StopSet = new Set<TokenType>([...SECTION_STOPS, 'stage']);
const OPTIONAL_STOPS: StopSet = new Set<TokenType>([...STAGE_STOPS, 'rbracket']);
/** Tokens after a `+` that make it "dangling" rather than "unexpected". */
const DANGLING_AFTER: StopSet = new Set<TokenType>([...OPTIONAL_STOPS, 'comma', 'tilde', 'colon', 'delay']);

const GAME_NAMES = (game: GameId): string => getGame(game).name;
/** Maximum `[ ]` nesting; deeper input is reported instead of recursed into. */
const MAX_OPTIONAL_DEPTH = 8;

class Parser {
  private readonly toks: SigToken[];
  private pos = 0;
  private lastEnd = 0;
  private depth = 0;
  readonly diagnostics: Diagnostic[] = [];

  constructor(
    tokens: readonly Token[],
    private readonly text: string,
    private readonly ctx: ParseContext,
  ) {
    const sig: SigToken[] = [];
    let space = false;
    for (const t of tokens) {
      if (t.type === 'ws') {
        space = true;
        continue;
      }
      sig.push({ ...t, spaceBefore: space });
      space = false;
    }
    this.toks = sig;
  }

  // -- token helpers ---------------------------------------------------------

  private peek(offset = 0): SigToken | undefined {
    return this.toks[this.pos + offset];
  }

  private advance(): SigToken {
    const t = this.toks[this.pos] as SigToken;
    this.pos++;
    this.lastEnd = t.span.end;
    return t;
  }

  private diag(code: string, severity: Severity, message: string, span?: Span): void {
    this.diagnostics.push({ code, severity, message, span });
  }

  private slice(start: number): { span: Span; raw: string } {
    const end = Math.max(start, this.lastEnd);
    return { span: { start, end }, raw: this.text.slice(start, end) };
  }

  // -- combo / sections / stages ------------------------------------------------

  parseCombo(): ComboNode {
    const sections: SectionNode[] = [];
    let boundary: SectionBoundary = 'start';
    for (;;) {
      const sectionStart = this.peek()?.span.start ?? this.text.length;
      let label: string | undefined;
      if (this.peek()?.type === 'label') label = this.advance().character;
      const stages = this.parseStages();
      sections.push({
        type: 'section',
        index: sections.length,
        boundary,
        ...(label !== undefined ? { label } : {}),
        stages,
        span: { start: sectionStart, end: Math.max(sectionStart, this.lastEnd) },
      });
      const t = this.peek();
      if (!t) break;
      if (t.type === 'semicolon') {
        this.advance();
        boundary = this.semicolonBoundary(t);
      } else {
        boundary = 'label';
      }
    }
    return { type: 'combo', sections };
  }

  private semicolonBoundary(t: SigToken): SectionBoundary {
    const game = getGame(this.ctx.game);
    if (!game.tag) {
      this.diag(
        'semicolon-non-tag-game',
        'warning',
        `";" has no standard meaning in ${game.name}; treated as a section break.`,
        t.span,
      );
      return 'section';
    }
    return this.ctx.dialect.semicolon === 'tagAssault' ? 'tagAssault' : 'section';
  }

  private parseStages(): StageNode[] {
    const stages: StageNode[] = [];
    let lastSep: SigToken | undefined;
    for (;;) {
      const stage = this.parseChain(STAGE_STOPS);
      const next = this.peek();
      const nextIsSep = next?.type === 'stage';
      if (stage.steps.length > 0) {
        stages.push(stage);
      } else if (nextIsSep || lastSep) {
        this.diag('empty-stage', 'warning', 'Empty combo stage around ">".', (nextIsSep ? next : lastSep)?.span);
      }
      if (!nextIsSep) break;
      lastSep = this.advance();
    }
    return stages;
  }

  // -- chains -----------------------------------------------------------------------

  private parseChain(stops: StopSet): StageNode {
    const steps: Step[] = [];
    const start = this.peek()?.span.start ?? this.lastEnd;
    let pending: Relation | null = null;

    for (;;) {
      const t = this.peek();
      if (!t || stops.has(t.type)) break;

      const relKind = RELATION_TOKENS[t.type];
      if (relKind) {
        this.advance();
        if (steps.length === 0) {
          this.diag('dangling-operator', 'warning', `"${t.raw}" has no preceding input.`, t.span);
        } else if (pending?.kind === 'sequence' && relKind === 'delay') {
          pending = { kind: 'delay', raw: this.text.slice(pending.span.start, t.span.end), span: { start: pending.span.start, end: t.span.end } };
        } else if (pending) {
          this.diag('unexpected-operator', 'warning', `Unexpected "${t.raw}" after "${pending.raw}".`, t.span);
        } else {
          pending = { kind: relKind, raw: t.raw, span: t.span };
        }
        continue;
      }

      if (!ITEM_START_TOKENS.has(t.type)) {
        // plus, dot, hold, repeat, rbracket … where a step should start.
        this.advance();
        this.diag('unexpected-operator', 'warning', `Unexpected "${t.raw}".`, t.span);
        continue;
      }

      const prev = steps[steps.length - 1]?.node;
      const relation: Relation | null =
        pending ?? (prev ? { kind: 'implicit', raw: this.text.slice(prev.span.end, t.span.start), span: { start: prev.span.end, end: t.span.start } } : null);
      const node = this.parseItem();
      if (prev && relation?.kind === 'implicit') this.checkImplicit(prev, node, t);
      steps.push({ relation, node });
      pending = null;
    }

    if (pending) this.diag('dangling-operator', 'warning', `"${pending.raw}" is not followed by an input.`, pending.span);
    return { type: 'stage', steps, span: { start, end: Math.max(start, this.lastEnd) } };
  }

  private checkImplicit(prev: ItemNode, node: ItemNode, first: SigToken): void {
    const plain = (n: ItemNode): n is InputNode => n.type === 'input' && n.prefixes.length === 0;
    if (!plain(prev) || !plain(node)) return;
    const span = { start: prev.span.start, end: node.span.end };
    if (first.spaceBefore) {
      this.diag('ambiguous-whitespace', 'info', `Whitespace between "${prev.raw}" and "${node.raw}" is read as sequential; use "," to be explicit.`, span);
    } else if (!prev.direction && !prev.motion && !node.direction && !node.motion) {
      this.diag('ambiguous-adjacent-buttons', 'warning', `"${prev.raw}${node.raw}" has no operator: use "+" for simultaneous or "," for sequential. Read as sequential.`, span);
    }
  }

  // -- steps --------------------------------------------------------------------------

  private parseItem(): ItemNode {
    const start = (this.peek() as SigToken).span.start;
    const prefixes = this.parsePrefixes();
    const node = this.parseCore(start, prefixes);
    // postfix modifiers
    for (;;) {
      const t = this.peek();
      if (t?.type === 'hold') {
        this.advance();
        node.hold = true;
      } else if (t?.type === 'repeat') {
        this.advance();
        node.repeat = t.count;
      } else break;
    }
    Object.assign(node, this.slice(start));
    return node;
  }

  private parsePrefixes(): Prefix[] {
    const prefixes: Prefix[] = [];
    for (;;) {
      const t = this.peek();
      if (t?.type !== 'word') break;
      const def = this.prefixDef(t);
      if (!def) break;
      const joiner = this.peek(1);
      const hasJoiner = joiner?.type === 'dot' || joiner?.type === 'plus';
      const target = this.peek(hasJoiner ? 2 : 1);
      if (!target || !PREFIXABLE_TOKENS.has(target.type)) break;
      if (def.kind === 'heat' && joiner?.type !== 'dot') break;
      if (def.lookup) this.checkCharacterContext(def.lookup, t);
      this.advance();
      if (hasJoiner) this.advance();
      prefixes.push({
        kind: def.kind,
        id: def.id,
        abbr: def.abbr,
        label: def.label,
        raw: this.text.slice(t.span.start, this.lastEnd),
        span: { start: t.span.start, end: this.lastEnd },
      });
    }
    return prefixes;
  }

  private prefixDef(t: SigToken): (Omit<Prefix, 'raw' | 'span'> & { lookup?: CharacterLookup }) | null {
    if ((t.raw === 'H' || t.raw === 'h') && this.peek(1)?.type === 'dot') {
      return { kind: 'heat', ...HEAT_PREFIX };
    }
    const state = lookupState(t.raw);
    if (state) return { kind: 'state', ...state };
    const ch = lookupCharacterWord(this.ctx.game, t.raw, this.ctx.characters);
    if (ch?.entry.kind === 'stance') {
      return { kind: 'stance', id: ch.entry.abbr, abbr: ch.entry.abbr, label: ch.entry.label, lookup: ch };
    }
    return null;
  }

  private parseCore(start: number, prefixes: Prefix[]): ItemNode {
    const t = this.peek() as SigToken;
    const base = { span: t.span, raw: t.raw, prefixes, hold: false };
    switch (t.type) {
      case 'direction':
      case 'motion':
      case 'button':
        return this.parseInput(start, prefixes);
      case 'event':
        return this.parseEvent(base);
      case 'word':
        return this.parseWord(base);
      case 'lbracket':
        return this.parseOptional(base);
      case 'note': {
        this.advance();
        const closed = t.closed === true;
        if (!closed) this.diag('unclosed-group', 'warning', 'Unclosed "(".', t.span);
        return { ...base, type: 'note', text: t.raw.slice(1, closed ? -1 : undefined).trim() };
      }
      default:
        this.advance();
        this.diag('unknown-token', 'warning', `Unrecognized character "${t.raw}".`, t.span);
        return { ...base, type: 'unknown' };
    }
  }

  private parseInput(start: number, prefixes: Prefix[]): ItemNode {
    const first = this.advance();
    const node: InputNode = { type: 'input', span: first.span, raw: first.raw, prefixes, hold: false, buttons: [], tag: false };
    let digits: number[] = [];
    if (first.type === 'button') {
      digits = [first.button as number, ...this.parseMoreButtons()];
    } else {
      if (first.type === 'direction' && first.direction) {
        node.direction = { value: first.direction, held: first.held ?? false, raw: first.raw };
      } else if (first.motion) {
        node.motion = { value: first.motion, raw: first.raw };
      }
      const nx = this.peek();
      if (nx?.type === 'plus') {
        if (this.peek(1)?.type === 'button') {
          this.advance();
          digits = [this.advance().button as number, ...this.parseMoreButtons()];
        } else {
          this.badPlus();
        }
      } else if (nx?.type === 'button' && !nx.spaceBefore) {
        digits = [this.advance().button as number, ...this.parseMoreButtons()];
      }
    }

    if (digits.some((d) => d < 1 || d > TAG_BUTTON)) {
      const { span, raw } = this.slice(start);
      this.diag('invalid-button', 'warning', `"${raw}" uses a button that does not exist (valid: 1-4, 5 = TAG).`, span);
      return { type: 'unknown', span, raw, prefixes, hold: false };
    }
    node.buttons = [...new Set(digits.filter((d) => d !== TAG_BUTTON))].sort((a, b) => a - b) as AttackButton[];
    node.tag = digits.includes(TAG_BUTTON);
    return node;
  }

  /** Consumes `+ BUTTON` pairs following a button. */
  private parseMoreButtons(): number[] {
    const more: number[] = [];
    while (this.peek()?.type === 'plus') {
      if (this.peek(1)?.type !== 'button') {
        this.badPlus();
        break;
      }
      this.advance();
      more.push(this.advance().button as number);
    }
    return more;
  }

  private badPlus(): void {
    const plus = this.advance();
    const after = this.peek();
    if (!after || DANGLING_AFTER.has(after.type)) {
      this.diag('dangling-operator', 'warning', '"+" is not followed by a button.', plus.span);
    } else {
      this.diag('unexpected-operator', 'warning', `"+" cannot join "${after.raw}"; only buttons can be pressed together.`, plus.span);
    }
  }

  private parseEvent(base: Omit<ItemNode, 'type'>): ItemNode {
    const t = this.advance();
    const mechanic = lookupEvent(this.ctx.dialect, t.raw.slice(0, -1));
    if (!mechanic) {
      this.diag('unknown-event', 'warning', `Unknown combo event "${t.raw}".`, t.span);
      return { ...base, type: 'unknown' };
    }
    return { ...base, type: 'event', mechanic, abbr: t.raw, label: MECHANICS[mechanic].label };
  }

  private parseWord(base: Omit<ItemNode, 'type'>): ItemNode {
    const t = this.advance();
    const ch = lookupCharacterWord(this.ctx.game, t.raw, this.ctx.characters);
    if (ch) {
      this.checkCharacterContext(ch, t);
      const { entry } = ch;
      if (entry.kind === 'named') {
        return {
          ...base,
          type: 'namedMove',
          name: entry.abbr,
          label: entry.label,
          characters: ch.characters,
          ...(entry.expansion ? { expansion: entry.expansion } : {}),
        };
      }
      return { ...base, type: 'stance', kind: 'stance', id: entry.abbr, abbr: entry.abbr, label: entry.label };
    }
    const state = lookupState(t.raw);
    if (state) return { ...base, type: 'stance', kind: 'state', ...state };
    if ((t.raw === 'H' || t.raw === 'h') && this.peek()?.type === 'dot') {
      this.advance();
      return { ...base, type: 'stance', kind: 'heat', ...HEAT_PREFIX };
    }
    const mech = lookupMechanicWord(t.raw);
    if (mech) return { ...base, type: 'mechanic', mechanic: mech.mechanic, abbr: mech.abbr, label: MECHANICS[mech.mechanic as MechanicId].label };
    const movement = lookupMovement(t.raw);
    if (movement) return { ...base, type: 'movement', ...movement };
    this.diag('unknown-word', 'warning', `Unrecognized notation "${t.raw}" for ${GAME_NAMES(this.ctx.game)}.`, t.span);
    return { ...base, type: 'unknown' };
  }

  private parseOptional(base: Omit<ItemNode, 'type'>): ItemNode {
    const open = this.advance();
    if (this.depth >= MAX_OPTIONAL_DEPTH) {
      this.diag('nesting-too-deep', 'warning', `"[" nested more than ${MAX_OPTIONAL_DEPTH} levels deep is not interpreted.`, open.span);
      return { ...base, type: 'unknown' };
    }
    this.depth++;
    const inner = this.parseChain(OPTIONAL_STOPS);
    this.depth--;
    if (this.peek()?.type === 'rbracket') this.advance();
    else this.diag('unclosed-group', 'warning', 'Unclosed "[".', open.span);
    return { ...base, type: 'optional', steps: inner.steps };
  }

  private checkCharacterContext(ch: CharacterLookup, t: SigToken): void {
    if (ch.inContext || this.ctx.characters.length === 0) return;
    this.diag(
      'character-move-out-of-context',
      'info',
      `"${ch.entry.abbr}" is not defined for ${this.ctx.characters.join(' / ')} in ${GAME_NAMES(this.ctx.game)} (defined for: ${ch.characters.join(', ')}).`,
      t.span,
    );
  }
}

export function parseTokens(
  tokens: readonly Token[],
  text: string,
  ctx: ParseContext,
): { ast: ComboNode; diagnostics: Diagnostic[] } {
  const parser = new Parser(tokens, text, ctx);
  const ast = parser.parseCombo();
  return { ast, diagnostics: parser.diagnostics };
}
