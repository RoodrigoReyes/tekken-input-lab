/**
 * JSON backup / restore of the whole library.
 * File format: { app, schemaVersion, exportedAt, combos[] }. Older schema
 * versions are migrated forward; files from a newer app version are refused
 * rather than guessed at. Invalid combos are skipped and reported.
 */
import type { Combo } from '../types/combo';
import { normalizeCombo, type ComboRepository } from './comboRepository';
import { APP_ID, backupSchemaV1, comboSchema, describeIssues, SCHEMA_VERSION } from './schema';

export interface BackupFile {
  app: typeof APP_ID;
  schemaVersion: number;
  exportedAt: string;
  combos: Combo[];
}

export interface BackupReadResult {
  combos: Combo[];
  skipped: Array<{ index: number; reason: string }>;
}

/** Upper bound on combos per file (the file itself is capped at 10 MB by the UI). */
export const MAX_IMPORT_COMBOS = 5000;

export interface ImportSummary {
  added: number;
  updated: number;
  /** Local copy was newer (or equal) and was kept. */
  keptLocal: number;
}

export class BackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupError';
  }
}

export function createBackup(combos: readonly Combo[], now: Date = new Date()): BackupFile {
  return { app: APP_ID, schemaVersion: SCHEMA_VERSION, exportedAt: now.toISOString(), combos: [...combos] };
}

export function serializeBackup(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2);
}

/** Migrate any supported version to the current one. */
function migrate(data: unknown): unknown {
  const version = (data as { schemaVersion?: unknown } | null)?.schemaVersion;
  if (typeof version !== 'number') throw new BackupError('This file is not a TekkenInputLab backup (missing schemaVersion).');
  if (version > SCHEMA_VERSION) {
    throw new BackupError(`This backup was made by a newer version of TekkenInputLab (schema ${version}). Please update the app.`);
  }
  // Future: if (version === 1) data = migrateV1toV2(data); …
  return data;
}

export function readBackup(data: unknown): BackupReadResult {
  const migrated = migrate(data);
  const file = backupSchemaV1.safeParse(migrated);
  if (!file.success) throw new BackupError(`Invalid backup file: ${describeIssues(file.error)}`);

  if (file.data.combos.length > MAX_IMPORT_COMBOS) {
    throw new BackupError(`Backup has ${file.data.combos.length} combos; the limit is ${MAX_IMPORT_COMBOS}.`);
  }
  const combos: Combo[] = [];
  const skipped: BackupReadResult['skipped'] = [];
  file.data.combos.forEach((raw, index) => {
    const parsed = comboSchema.safeParse(raw);
    if (!parsed.success) {
      skipped.push({ index, reason: describeIssues(parsed.error) });
      return;
    }
    const { damage, ...rest } = parsed.data;
    combos.push(
      normalizeCombo({
        ...rest,
        // Original notation is kept byte-for-byte.
        notation: (raw as { notation: string }).notation,
        ...(damage !== undefined ? { damage } : {}),
      }),
    );
  });
  return { combos, skipped };
}

export function parseBackupText(text: string): BackupReadResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError('This file is not valid JSON.');
  }
  return readBackup(data);
}

/**
 * Merge imported combos into the library without losing newer local edits:
 * new ids are added; on an id conflict the copy with the newer updatedAt wins.
 */
export async function importBackup(repo: ComboRepository, result: BackupReadResult): Promise<ImportSummary> {
  const summary: ImportSummary = { added: 0, updated: 0, keptLocal: 0 };
  const toWrite: Combo[] = [];
  for (const incoming of result.combos) {
    const local = await repo.findById(incoming.id);
    if (!local) {
      summary.added++;
      toWrite.push(incoming);
    } else if (incoming.updatedAt > local.updatedAt) {
      summary.updated++;
      toWrite.push(incoming);
    } else {
      summary.keptLocal++;
    }
  }
  await repo.putMany(toWrite);
  return summary;
}

/** One line for the import toast: how many combos were skipped and why (the first reason, 1-based position). */
export function describeSkipped(skipped: BackupReadResult['skipped']): string {
  const [first] = skipped;
  if (!first) return '';
  const count = `${skipped.length} invalid combo${skipped.length > 1 ? 's' : ''} skipped`;
  const more = skipped.length > 1 ? `; and ${skipped.length - 1} more` : '';
  return `${count} (combo ${first.index + 1}: ${first.reason}${more})`;
}
