import type { GameId } from './notation';

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export interface Combo {
  id: string;
  game: GameId;
  character: string;
  /** TTT2 partner. */
  partner?: string;
  name: string;
  /** Original notation — the single source of truth. Never rewritten. */
  notation: string;
  /** Notation dialect used to interpret the text. */
  dialect: string;
  /** Manual character per section (TTT2); null = automatic. */
  sectionCharacters: Array<string | null>;
  tags: string[];
  difficulty: Difficulty;
  damage?: number;
  notes: string;
  favorite: boolean;
  /** ISO 8601 timestamps. */
  createdAt: string;
  updatedAt: string;
}

/** Fields a user edits; ids and timestamps are managed by the repository. */
export type ComboDraft = Omit<Combo, 'id' | 'createdAt' | 'updatedAt'>;
