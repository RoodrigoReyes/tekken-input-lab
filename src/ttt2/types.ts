/**
 * TTT2 team-combo building blocks, imported from a combo guide.
 *
 * A team combo is composed from pieces the guide already lists:
 *   route (point character, up to B!)  →  TA!  →  TA filler  →  ender
 * The original notation of each piece is kept verbatim.
 */

export type PieceRole = 'route' | 'taFiller' | 'ender';
export type PieceContext = 'open' | 'wall';
export type RouteKind = 'normal' | 'counterHit' | 'lowParry' | 'wall';

export interface ComboPiece {
  /** Stable id: `<character>/<section>/<n>`. */
  id: string;
  /** Roster name (e.g. "Steve" for the guide's "Steve Fox"). */
  character: string;
  /** Form this piece belongs to (e.g. "Devil Kazuya"); undefined = base form. */
  form?: string;
  /** Forms a route is restricted to ("Kazuya only" → ["Kazuya"]). */
  forms?: string[];
  role: PieceRole;
  context: PieceContext;
  routeKind?: RouteKind;
  /** Starter label from the guide ("Starter: EWGF"). Routes only. */
  starter?: string;
  /** Original notation, verbatim. */
  notation: string;
  /** "Additional …" pieces: extra options the guide marks with a condition. */
  additional: boolean;
  /** Ender that grabs the airborne opponent ("Additional Air Ender"); only the character who started the combo performs it. */
  airThrow?: boolean;
  /** Condition text from the guide (e.g. "Ogre/big-body option"). */
  condition?: string;
  /** Guide notes that apply to this piece. */
  notes: string[];
  /** Variant label from the guide ("Tech", "No Tech"). */
  variant?: string;
}

export interface CharacterKit {
  /** Roster name. */
  character: string;
  /** Name as written in the guide. */
  guideName: string;
  /** Characters sharing TA/ender options (clones). */
  sharedWith: string[];
  pieces: ComboPiece[];
}

export interface GuideLibrary {
  title: string;
  kits: CharacterKit[];
  /** Lines the importer could not classify (reported, never guessed). */
  skipped: Array<{ line: number; text: string; reason: string }>;
}

/** Facts derived from a route's notation by the notation engine. */
export interface RouteAnalysis {
  /** Text up to and including the B! (verbatim slice). Undefined when there is no B!. */
  opener?: string;
  /** The rest of the solo route after B! (the solo ender). */
  soloFinish?: string;
  /** Estimated hits before the TA (attack steps up to and including the B! string). */
  preTaHits: number;
  /** The string that caused the Bound (e.g. "db+2", "uf+2,1"). */
  boundMove?: string;
  /** Estimated hits of the bounding string. */
  boundHits: number;
  /** Route uses the wall (W!). */
  usesWall: boolean;
}
