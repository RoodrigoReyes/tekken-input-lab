import { useMemo, useState } from 'react';
import { DEFAULT_VISUAL } from '../../components/combos/ComboVisual';
import { DiagnosticsList } from '../../components/combos/DiagnosticsList';
import { GameBadge } from '../../components/combos/GameBadge';
import { Button, LinkButton } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { PageTitle, Panel } from '../../components/ui/Panel';
import { useToast } from '../../components/ui/Toast';
import { errorMessage, useRepository } from '../../hooks/useCombos';
import { paths } from '../../hooks/useHashRoute';
import { usePlayerSide } from '../../hooks/usePlayerSide';
import type { ComboDraft } from '../../types/combo';
import { PracticeDisplay } from '../details/PracticeDisplay';
import { parseCombo } from '../combo/parseCombo';
import { decodeShareLink } from './shareLink';

export function SharedView({ payload, navigate }: { payload: string; navigate: (hash: string) => void }) {
  const decoded = useMemo(() => decodeShareLink(payload), [payload]);
  if (!decoded.ok) return (
    <Panel className="flex flex-col items-center gap-3 px-6 py-[58px] text-center">
      <p className="text-2xl font-bold uppercase" role="alert">Invalid share link</p>
      <p className="max-w-md text-sm text-fg-muted">{decoded.error}</p>
      <LinkButton href={paths.library()} variant="primary">Back to library</LinkButton>
    </Panel>
  );
  return <SharedCombo draft={decoded.draft} payload={payload} navigate={navigate} />;
}

function SharedCombo({ draft, payload, navigate }: { draft: ComboDraft; payload: string; navigate: (hash: string) => void }) {
  const repo = useRepository();
  const toast = useToast();
  const [side] = usePlayerSide();
  const [saving, setSaving] = useState(false);
  const [visual, setVisual] = useState({ ...DEFAULT_VISUAL, size: 48 });
  const parsed = useMemo(() => parseCombo(draft), [draft]);
  const save = async () => {
    setSaving(true);
    try {
      const combo = await repo.create(draft);
      toast('Combo saved', 'success');
      navigate(paths.details(combo.id));
    } catch (error) {
      toast(`Could not save combo: ${errorMessage(error)}`, 'error');
      setSaving(false);
    }
  };
  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 space-y-2">
          <PageTitle>{draft.name}</PageTitle>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
            <GameBadge game={draft.game} />
            <span>{[draft.character || 'No character', draft.partner].filter(Boolean).join(' + ')}</span>
            <span className="capitalize">{(draft.difficulty === 'beginner' ? 'Beginner' : draft.difficulty === 'intermediate' ? 'Intermediate' : 'Advanced')}</span>
            {draft.damage !== undefined && <span>{`Damage: ${draft.damage}`}</span>}
            {draft.tags.map((tag) => <Chip key={tag}>#{tag}</Chip>)}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={async () => {
            const link = `${window.location.href.split('#')[0]}#/overlay?d=${encodeURIComponent(payload)}&size=${visual.size}&side=${side === 'right' ? '2p' : '1p'}`;
            try {
              await navigator.clipboard.writeText(link);
              toast('OBS overlay link copied', 'success');
            } catch {
              toast('Could not copy overlay link', 'error');
            }
          }}>Copy OBS overlay link</Button>
          <Button variant="primary" onClick={save} disabled={saving}>Save to my library</Button>
        </div>
      </header>
      <Panel aria-label="Commands" className="flex flex-col gap-3 p-4">
        <PracticeDisplay key={draft.notation} parsed={parsed} visual={visual} onVisualChange={setVisual} />
        {parsed.result.diagnostics.length > 0 && <DiagnosticsList diagnostics={parsed.result.diagnostics} notation={draft.notation} />}
      </Panel>
      <Panel className="p-4">
        <h2 className="label-md mb-2 text-fg-muted">Original notation</h2>
        <pre className="overflow-x-auto font-mono text-sm leading-[22px] font-medium whitespace-pre-wrap text-fg">{draft.notation}</pre>
      </Panel>
    </article>
  );
}
