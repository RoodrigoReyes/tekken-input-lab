/**
 * Runtime validation for data crossing the storage boundary (user drafts,
 * imported JSON). Schemas are versioned through the backup format.
 */
import { z } from 'zod';
import { DIFFICULTIES } from '../types/combo';

export const SCHEMA_VERSION = 1;
export const APP_ID = 'tekken-input-lab';

const gameSchema = z.enum(['t6', 't7', 't8', 'ttt2']);
const MAX_TEXT = 5000;

export const comboDraftSchema = z.object({
  game: gameSchema,
  character: z.string().trim().max(60),
  partner: z.string().trim().max(60).optional(),
  name: z.string().trim().min(1, 'Name is required').max(120),
  notation: z.string().max(MAX_TEXT).refine((s) => s.trim().length > 0, 'Notation is required'),
  dialect: z.string().max(40).default('standard'),
  sectionCharacters: z.array(z.string().max(60).nullable()).max(50).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  difficulty: z.enum(DIFFICULTIES),
  damage: z.number().int().min(0).max(999).optional(),
  notes: z.string().max(MAX_TEXT).default(''),
  favorite: z.boolean().default(false),
});

export const comboSchema = comboDraftSchema.extend({
  id: z.string().min(1).max(100),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const backupSchemaV1 = z.object({
  app: z.literal(APP_ID),
  schemaVersion: z.literal(1),
  exportedAt: z.iso.datetime(),
  combos: z.array(z.unknown()),
});

/** Human-readable summary of a zod error. */
export function describeIssues(error: z.ZodError): string {
  return error.issues
    .slice(0, 3)
    .map((i) => `${i.path.join('.') || 'value'}: ${i.message}`)
    .join('; ');
}
