import { useEffect, useState } from 'react';
import { Button, LinkButton } from '../../components/ui/Button';
import { PageTitle, Panel } from '../../components/ui/Panel';
import { useToast } from '../../components/ui/Toast';
import { errorMessage, useRepository } from '../../hooks/useCombos';
import { paths } from '../../hooks/useHashRoute';
import { describeSkipped, importBackup, parseBackupText, type BackupReadResult } from '../../storage/backup';
import { validateImportUrl } from './importUrl';

const MAX_BYTES = 2 * 1024 * 1024;

async function readPack(url: string, signal: AbortSignal): Promise<BackupReadResult> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch {
    throw new Error('Could not fetch this URL. Check the address and CORS settings.');
  }
  if (!response.ok) throw new Error(`Could not fetch this URL (HTTP ${response.status}).`);
  if (response.url && !validateImportUrl(response.url)) throw new Error('The final URL must use HTTPS.');
  if (Number(response.headers.get('content-length')) > MAX_BYTES) throw new Error('The pack is larger than 2 MB.');
  if (!response.body) throw new Error('Could not read the response.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read().catch(() => {
        throw new Error('Could not read the pack. Check your connection and try again.');
      });
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) throw new Error('The pack is larger than 2 MB.');
      chunks.push(value);
    }
  } catch (e) {
    if (size > MAX_BYTES) throw e;
    throw new Error('Could not read the pack. Check your network connection.');
  } finally {
    await reader.cancel().catch(() => {});
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return parseBackupText(new TextDecoder().decode(bytes));
}

export function ImportUrlView({ url }: { url: string }) {
  const repo = useRepository();
  const toast = useToast();
  const [result, setResult] = useState<BackupReadResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    setError('');
    setImported(false);
    setLoading(true);
    const validUrl = validateImportUrl(url);
    if (!validUrl) {
      setError('Enter a valid HTTPS URL for the combo pack.');
      setLoading(false);
      return () => controller.abort();
    }
    void readPack(validUrl, controller.signal).then((pack) => {
      if (!controller.signal.aborted) setResult(pack);
    }).catch((e: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(e));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [url]);

  const confirmImport = async () => {
    if (!result || importing || imported) return;
    setImporting(true);
    try {
      const { added, updated, keptLocal } = await importBackup(repo, result);
      const parts = [`${added} added`, `${updated} updated`];
      if (keptLocal) parts.push(`${keptLocal} kept (your copy is newer)`);
      if (result.skipped.length) parts.push(describeSkipped(result.skipped));
      toast(`Import: ${parts.join(', ')}`, result.skipped.length ? 'warning' : 'success');
      setImported(true);
    } catch (e) {
      toast(`Import failed: ${errorMessage(e)}`, 'error');
    } finally {
      setImporting(false);
    }
  };

  const games = [...new Set(result?.combos.map((combo) => combo.game))];
  const characters = [...new Set(result?.combos.flatMap((combo) => [combo.character, ...(combo.partner ? [combo.partner] : [])]))];

  return (
    <div className="flex flex-col gap-4">
      <PageTitle>Import combo pack</PageTitle>
      <Panel className="flex flex-col items-start gap-3 p-5">
        <p className="text-sm break-all text-fg-muted">{`Source: ${url || '(missing URL)'}`}</p>
        {loading && <p>Loading pack…</p>}
        {error && <p role="alert" className="text-danger">{error}</p>}
        {result && (
          <>
            <p>{(result.combos.length === 1 ? `${result.combos.length} combo ready to import` : `${result.combos.length} combos ready to import`)}</p>
            <p className="text-sm text-fg-muted">{`Games: ${games.join(', ') || 'None'}`}</p>
            <p className="text-sm text-fg-muted">{`Characters: ${characters.join(', ') || 'None'}`}</p>
            {result.skipped.length > 0 && <p className="text-sm text-fg-muted">{describeSkipped(result.skipped)}</p>}
            {imported ? <p>Import complete.</p> : (
              <Button variant="primary" disabled={importing || result.combos.length === 0} onClick={() => void confirmImport()}>
                {importing ? 'Importing…' : (result.combos.length === 1 ? `Import ${result.combos.length} combo` : `Import ${result.combos.length} combos`)}
              </Button>
            )}
          </>
        )}
        <LinkButton href={paths.library()}>Go to library</LinkButton>
      </Panel>
    </div>
  );
}
