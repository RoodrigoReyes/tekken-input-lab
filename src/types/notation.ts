/**
 * Shared types for the notation engine. The parser produces these; the
 * renderer consumes them. Nothing here depends on React or the DOM.
 */

export type GameId = 't6' | 't7' | 't8' | 'ttt2';

export type Direction = 'f' | 'b' | 'u' | 'd' | 'df' | 'db' | 'uf' | 'ub' | 'n';

export type MotionId = 'qcf' | 'qcb' | 'hcf' | 'hcb' | 'cd' | 'ff' | 'bb' | 'fff';

export type AttackButton = 1 | 2 | 3 | 4;

/** Character offsets into the ORIGINAL notation string: [start, end). */
export interface Span {
  start: number;
  end: number;
}

export type Severity = 'info' | 'warning';

export interface Diagnostic {
  code: string;
  severity: Severity;
  message: string;
  span?: Span;
  /** Mechanic id for availability diagnostics. */
  mechanic?: string;
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

export type TokenType =
  | 'direction'
  | 'motion'
  | 'button'
  | 'word'
  | 'event'
  | 'plus'
  | 'comma'
  | 'tilde'
  | 'stage'
  | 'colon'
  | 'delay'
  | 'hold'
  | 'semicolon'
  | 'dot'
  | 'lbracket'
  | 'rbracket'
  | 'note'
  | 'repeat'
  | 'label'
  | 'ws'
  | 'unknown';

export interface Token {
  type: TokenType;
  /** Exact source text. */
  raw: string;
  /** Canonical text used for normalization (e.g. "d/f" -> "df", "↘" -> "df"). */
  canonical: string;
  span: Span;
  /** direction tokens */
  direction?: Direction;
  held?: boolean;
  /** motion tokens */
  motion?: MotionId;
  /** button tokens: 1-4 attack, 5 TAG, anything else is invalid */
  button?: number;
  /** repeat tokens (x3) */
  count?: number;
  /** label tokens (`Kazuya:`) */
  character?: string;
  /** note tokens: a matching `)` was found */
  closed?: boolean;
  /** whitespace tokens: did it contain a line break */
  newline?: boolean;
}

// ---------------------------------------------------------------------------
// AST
// ---------------------------------------------------------------------------

export type RelationKind =
  /** `,` next input */
  | 'sequence'
  /** `~` immediately / rapid transition */
  | 'transition'
  /** `:` just frame */
  | 'justFrame'
  /** `<` or `,<` delayed */
  | 'delay'
  /** whitespace or direct adjacency with no operator */
  | 'implicit';

export interface Relation {
  kind: RelationKind;
  raw: string;
  span: Span;
}

export type PrefixKind = 'state' | 'stance' | 'heat';

export interface Prefix {
  kind: PrefixKind;
  id: string;
  abbr: string;
  label: string;
  raw: string;
  span: Span;
}

interface NodeBase {
  span: Span;
  raw: string;
  /** Prefix states/stances such as WS, FC, H., ZEN. */
  prefixes: Prefix[];
  /** `*` postfix: input is held. */
  hold: boolean;
  /** `x3` postfix. */
  repeat?: number;
}

export interface InputNode extends NodeBase {
  type: 'input';
  direction?: { value: Direction; held: boolean; raw: string };
  motion?: { value: MotionId; raw: string };
  /** Attack buttons pressed together (1-4), sorted, unique. */
  buttons: AttackButton[];
  /** TAG button (5) pressed as part of this input. */
  tag: boolean;
}

export interface NamedMoveNode extends NodeBase {
  type: 'namedMove';
  name: string;
  label: string;
  /** Characters whose dictionary defines this move (for the selected game). */
  characters: string[];
  /** Optional input expansion, only rendered in "expanded" display mode. */
  expansion?: string;
}

export interface MovementNode extends NodeBase {
  type: 'movement';
  id: string;
  abbr: string;
  label: string;
}

/** A state or stance written on its own (not attached to a following input). */
export interface StanceNode extends NodeBase {
  type: 'stance';
  kind: PrefixKind;
  id: string;
  abbr: string;
  label: string;
}

/** A combo event such as `B!`, `S!`, `W!`. */
export interface EventNode extends NodeBase {
  type: 'event';
  mechanic: string;
  abbr: string;
  label: string;
}

/** A system-mechanic keyword such as `RA`, `RD`, `HB`. */
export interface MechanicNode extends NodeBase {
  type: 'mechanic';
  mechanic: string;
  abbr: string;
  label: string;
}

/** `[ ... ]` optional section. */
export interface OptionalNode extends NodeBase {
  type: 'optional';
  steps: Step[];
}

/** `( ... )` free text note. */
export interface NoteNode extends NodeBase {
  type: 'note';
  text: string;
}

export interface UnknownNode extends NodeBase {
  type: 'unknown';
}

export type ItemNode =
  | InputNode
  | NamedMoveNode
  | MovementNode
  | StanceNode
  | EventNode
  | MechanicNode
  | OptionalNode
  | NoteNode
  | UnknownNode;

/** One element of a chain; `relation` links it to the previous step (null for the first). */
export interface Step {
  relation: Relation | null;
  node: ItemNode;
}

export interface StageNode {
  type: 'stage';
  steps: Step[];
  span: Span;
}

export type SectionBoundary =
  /** First section of the combo. */
  | 'start'
  /** `;` interpreted as a plain section separator. */
  | 'section'
  /** `;` interpreted as a Tag Assault (kage dialect). */
  | 'tagAssault'
  /** A `Character:` label started this section. */
  | 'label';

export interface SectionNode {
  type: 'section';
  index: number;
  boundary: SectionBoundary;
  /** Character named by an explicit `Name:` label in the notation. */
  label?: string;
  stages: StageNode[];
  span: Span;
}

export interface ComboNode {
  type: 'combo';
  sections: SectionNode[];
}

export interface ParseResult {
  parserVersion: string;
  game: GameId;
  dialect: string;
  original: string;
  normalized: string;
  tokens: Token[];
  ast: ComboNode;
  diagnostics: Diagnostic[];
}
