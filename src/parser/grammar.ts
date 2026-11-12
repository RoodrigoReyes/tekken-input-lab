/**
 * Tekken Input Lab notation grammar (EBNF). Implemented by parser.ts as a
 * recursive-descent parser over the tokens from tokenizer.ts.
 *
 *   combo    := section ( (';' | LABEL) section )*
 *   section  := LABEL? stage ( '>' stage )*
 *   stage    := step ( relation step )*
 *   relation := ',' '<'? | '~' | ':' | '<' | implicit (whitespace / adjacency)
 *   step     := prefix* core postfix*
 *   prefix   := (STATE | STANCE | 'H') ('.' | '+' | whitespace | adjacency)   — only when an input follows
 *   core     := input | NAMED_MOVE | MOVEMENT | EVENT | MECHANIC
 *             | '[' stage ']'            (optional part)
 *             | '(' text ')'             (note)
 *             | UNKNOWN
 *   input    := (DIRECTION | MOTION) ( '+' buttons | buttons-adjacent )?
 *             | buttons
 *   buttons  := BUTTON ( '+' BUTTON )*
 *   postfix  := '*' (hold) | 'xN' (repeat)
 *   BUTTON   := 1 | 2 | 3 | 4 | 5 (TAG)
 *
 * Operator semantics are never discarded: `+` groups simultaneous inputs into
 * ONE input node, while `,` `~` `:` `<` and whitespace create separate steps
 * linked by an explicit Relation.
 */
import type { RelationKind, TokenType } from '../types/notation';

/** Token types that link two steps. */
export const RELATION_TOKENS: Readonly<Partial<Record<TokenType, RelationKind>>> = {
  comma: 'sequence',
  tilde: 'transition',
  colon: 'justFrame',
  delay: 'delay',
};

/** Symbols used by the compact (debug/test) representation and the normalizer. */
export const RELATION_SYMBOLS: Readonly<Record<RelationKind, string>> = {
  sequence: ',',
  transition: '~',
  justFrame: ':',
  delay: '<',
  implicit: '_',
};

/** Tokens that bind tightly: whitespace next to them is insignificant. */
export const TIGHT_TOKENS: ReadonlySet<TokenType> = new Set<TokenType>([
  'plus',
  'comma',
  'tilde',
  'colon',
  'delay',
  'hold',
  'dot',
  'stage',
  'semicolon',
]);

/** Tokens that can begin a step's core. */
export const ITEM_START_TOKENS: ReadonlySet<TokenType> = new Set<TokenType>([
  'direction',
  'motion',
  'button',
  'word',
  'event',
  'lbracket',
  'note',
  'unknown',
]);

/** Tokens that a prefix (state/stance) may attach to. */
export const PREFIXABLE_TOKENS: ReadonlySet<TokenType> = new Set<TokenType>([
  'direction',
  'motion',
  'button',
  'word',
]);
