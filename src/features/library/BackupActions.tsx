import { useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { errorMessage, useRepository } from '../../hooks/useCombos';
import { createBackup, importBackup, parseBackupText, serializeBackup } from '../../storage/backup';
import { downloadBlob } from '../export/download';

const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

/** Export the whole library to JSON, or merge a JSON backup into it. */
export function BackupActions({ onImported }: { onImported: () => Promise<void> }) {
  const repo = useRepository();
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);

  const exportJson = async () => {
    try {
      const combos = await repo.findAll();
      const stamp = new Date().toISOString().slice(0, 10);
      downloadBlob(new Blob([serializeBackup(createBackup(combos))], { type: 'application/json' }), `tekken-input-lab-${stamp}.json`);
      toast(`Exported ${combos.length} combos`, 'success');
    } catch (e) {
      toast(`Export failed: ${errorMessage(e)}`, 'error');
    }
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('File is larger than 10 MB.');
      const result = parseBackupText(await file.text());
      const { added, updated, keptLocal } = await importBackup(repo, result);
      await onImported();
      const parts = [`${added} added`, `${updated} updated`];
      if (keptLocal) parts.push(`${keptLocal} kept (your copy is newer)`);
      if (result.skipped.length) parts.push(`${result.skipped.length} invalid skipped`);
      toast(`Import: ${parts.join(', ')}`, result.skipped.length ? 'info' : 'success');
    } catch (e) {
      toast(`Import failed: ${errorMessage(e)}`, 'error');
    } finally {
      if (input.current) input.current.value = '';
    }
  };

  return (
    <>
      <Button onClick={() => input.current?.click()}>
        <span aria-hidden>↑</span> Import JSON
      </Button>
      <Button onClick={exportJson}>
        <span aria-hidden>↓</span> Export JSON
      </Button>
      <input
        ref={input}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-label="Import backup file"
        onChange={(e) => void importJson(e.target.files?.[0])}
      />
    </>
  );
}
