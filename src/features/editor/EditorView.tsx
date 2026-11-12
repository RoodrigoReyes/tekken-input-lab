import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { DiagnosticsList } from '../../components/combos/DiagnosticsList';
import { ComboVisual, DEFAULT_VISUAL, VisualControls } from '../../components/combos/ComboVisual';
import { Button, LinkButton } from '../../components/ui/Button';
import { ComboBox, Field, Select, TextArea, TextInput } from '../../components/ui/Field';
import { Collapsible } from '../../components/ui/Collapsible';
import { Eyebrow, PageTitle, Panel, PanelHeader } from '../../components/ui/Panel';
import { TagInput } from '../../components/ui/TagInput';
import { useToast } from '../../components/ui/Toast';
import { errorMessage, useCombo, useCombos, useRepository } from '../../hooks/useCombos';
import { paths } from '../../hooks/useHashRoute';
import { dialectsForGame, getDialect } from '../../notation/dialects';
import { GAMES, getGame } from '../../notation/games';
import { DIFFICULTIES, type ComboDraft } from '../../types/combo';
import type { GameId } from '../../types/notation';
import { parseCombo } from '../combo/parseCombo';
import { clearHandoff, peekEditorDraft, peekPendingGenerated, stashEditorDraft } from '../generator/handoff';
import { collectTags } from '../library/filters';
import { draftFromGenerated, NEW_DRAFT, toDraft } from './draft';
import { NotationReference } from './NotationReference';
import { NotationToolbar } from './NotationToolbar';
import { SectionAssigner } from './SectionAssigner';

export { draftFromGenerated } from './draft';

/** Create (id = null) or edit an existing combo. */
export function EditorView({ id, navigate }: { id: string | null; navigate: (hash: string) => void }) {
  const { data, loading, error } = useCombo(id);
  if (id !== null && loading) return <p className="label-sm text-fg-muted">Loading…</p>;
  if (id !== null && (error || !data)) {
    return (
      <Panel className="flex flex-col items-center gap-3 px-6 py-[58px] text-center">
        <p className="font-condensed text-2xl font-bold uppercase">{error ?? 'This combo no longer exists.'}</p>
        <LinkButton href={paths.library()}>← Back to library</LinkButton>
      </Panel>
    );
  }
  return <EditorForm key={id ?? 'new'} id={id} initial={data ? toDraft(data) : null} navigate={navigate} />;
}

/**
 * New combos resume the draft stashed before opening the generator, and merge
 * the combo chosen there ("Use this combo") into it.
 */
function initialDraft(initial: ComboDraft | null): { draft: ComboDraft; generated: boolean } {
  if (initial) return { draft: initial, generated: false };
  const base = peekEditorDraft() ?? NEW_DRAFT;
  const pending = peekPendingGenerated();
  return pending ? { draft: draftFromGenerated(base, pending.combo, pending.team), generated: true } : { draft: base, generated: false };
}

interface EditorFormProps {
  id: string | null;
  initial: ComboDraft | null;
  navigate: (hash: string) => void;
}

/** Whether a draft already carries optional details (then that section starts open). */
function hasDetails(draft: ComboDraft): boolean {
  return draft.tags.length > 0 || draft.notes.trim() !== '' || draft.damage !== undefined || draft.difficulty !== NEW_DRAFT.difficulty;
}

/** One-line recap of the optional details, shown while the section is folded. */
function detailsSummary(draft: ComboDraft, damage: string): string {
  const parts = [
    `Difficulty: ${draft.difficulty}`,
    damage.trim() && `${damage.trim()} dmg`,
    draft.tags.length > 0 && `${draft.tags.length} tag${draft.tags.length > 1 ? 's' : ''}`,
    draft.notes.trim() && 'Notes',
  ];
  return parts.filter(Boolean).join(' · ');
}

/** Damage field text → number, or undefined when empty/invalid (validated on save). */
function damageValue(text: string): number | undefined {
  const n = Number(text);
  return text.trim() === '' || !Number.isInteger(n) ? undefined : n;
}

function EditorForm({ id, initial, navigate }: EditorFormProps) {
  const repo = useRepository();
  const toast = useToast();
  const { data: library } = useCombos();
  const [start] = useState(() => initialDraft(initial));
  const [draft, setDraft] = useState<ComboDraft>(start.draft);
  const [damage, setDamage] = useState(start.draft.damage?.toString() ?? '');
  const [visual, setVisual] = useState(DEFAULT_VISUAL);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const notationRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => clearHandoff(), []);
  useEffect(() => {
    if (formError) errorRef.current?.focus();
  }, [formError]);

  const game = getGame(draft.game);
  const dialects = dialectsForGame(draft.game);
  const parsed = useMemo(
    () => parseCombo(draft),
    [draft.game, draft.dialect, draft.notation, draft.character, draft.partner, draft.sectionCharacters], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const team = [draft.character, draft.partner].filter((c): c is string => Boolean(c?.trim()));
  const diagnostics = parsed.result.diagnostics;
  const warnings = diagnostics.filter((d) => d.severity === 'warning').length;

  const set = <K extends keyof ComboDraft>(key: K, value: ComboDraft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const changeGame = (next: GameId) =>
    setDraft((d) => ({
      ...d,
      game: next,
      dialect: getDialect(d.dialect).games.includes(next) ? d.dialect : getGame(next).defaultDialect,
    }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const dmg = damage.trim() === '' ? undefined : Number(damage);
    if (dmg !== undefined && (!Number.isInteger(dmg) || dmg < 0 || dmg > 999)) {
      setFormError('Damage must be a whole number between 0 and 999.');
      return;
    }
    const sections = parsed.result.ast.sections.length;
    const payload: ComboDraft = {
      ...draft,
      damage: dmg,
      partner: draft.game === 'ttt2' ? draft.partner : undefined,
      sectionCharacters: draft.sectionCharacters.slice(0, sections),
    };
    setSaving(true);
    try {
      const saved = id ? await repo.update(id, payload) : await repo.create(payload);
      toast(id ? 'Combo updated' : 'Combo saved', 'success');
      navigate(paths.details(saved.id));
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const cancelHref = id ? paths.details(id) : paths.library();

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Eyebrow>
            <a href={paths.library()} className="hover:text-fg">
              Combo Library
            </a>
            <span aria-hidden>/</span>
            <span className="text-primary">{id ? 'Edit' : 'New'}</span>
          </Eyebrow>
          <PageTitle>{id ? 'Edit combo' : 'New combo'}</PageTitle>
        </div>
        <div className="flex items-center gap-4">
          <LinkButton href={cancelHref} variant="link">
            Cancel
          </LinkButton>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save combo'}
          </Button>
        </div>
      </div>

      {start.generated && (
        <p className="rounded-[4px] border border-warning/50 bg-warning/5 px-3 py-2 text-sm text-warning">
          ⚠ Generated from the TTT2 guide and not tested yet. Review the preview and the “to verify” notes before saving.
        </p>
      )}

      {formError && (
        <p ref={errorRef} tabIndex={-1} role="alert" className="rounded-[4px] border border-danger bg-danger-surface p-3 text-sm text-fg">
          {formError}
        </p>
      )}

      <Panel className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Combo name" aside="Required" className="sm:col-span-2 xl:col-span-1">
          <TextInput value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Midscreen BnB" maxLength={120} required />
        </Field>
        <Field label="Game">
          <Select value={draft.game} onChange={(e) => changeGame(e.target.value as GameId)}>
            {GAMES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Character">
          <ComboBox id="character" options={game.roster} value={draft.character} onChange={(e) => set('character', e.target.value)} placeholder="e.g. Kazuya" />
        </Field>
        {game.tag ? (
          <Field label="Partner" aside="TTT2 only">
            <ComboBox id="partner" options={game.roster} value={draft.partner ?? ''} onChange={(e) => set('partner', e.target.value)} placeholder="e.g. Armor King" />
          </Field>
        ) : (
          <div className="hidden xl:block" />
        )}
        {dialects.length > 1 && (
          <Field label="Notation dialect" hint={getDialect(draft.dialect).description} className="sm:col-span-2 xl:col-span-4">
            <Select value={draft.dialect} onChange={(e) => set('dialect', e.target.value)} className="max-w-md">
              {dialects.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </Panel>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Panel className="flex flex-col gap-3 p-4">
            <PanelHeader title="Notation input" />
            <NotationToolbar
              game={draft.game}
              target={notationRef}
              onInsert={(next, caret) => {
                set('notation', next);
                window.requestAnimationFrame(() => {
                  notationRef.current?.focus();
                  notationRef.current?.setSelectionRange(caret, caret);
                });
              }}
            />
            <Field label="Notation" hint="The original text is saved exactly as typed.">
              <TextArea
                ref={notationRef}
                value={draft.notation}
                onChange={(e) => set('notation', e.target.value)}
                rows={5}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                className="min-h-36 font-mono text-sm leading-[22px] font-medium"
                placeholder="qcf+1 > uf+2,1 B! > SSL 1~b~uf+4 > f+1,2,1+2"
              />
            </Field>
            <div className="label-sm flex flex-wrap items-center justify-between gap-2 text-[11px] text-fg-muted">
              <span className="flex items-center gap-2">
                <span aria-hidden className={`size-2 rounded-full ${warnings ? 'bg-warning' : draft.notation.trim() ? 'bg-success' : 'bg-fg-muted'}`} />
                {!draft.notation.trim() ? 'Waiting for notation' : warnings ? `${warnings} warning${warnings > 1 ? 's' : ''} detected` : 'No warnings'}
              </span>
              <span>
                {draft.notation.length} chars · {getDialect(draft.dialect).name}
              </span>
            </div>
            {game.tag && (
              <a href={paths.generator()} onClick={() => id === null && stashEditorDraft({ ...draft, damage: damageValue(damage) })} className="flex items-center justify-between gap-3 rounded-[4px] border border-line-strong bg-neutral px-3 py-2.5 text-sm text-fg-muted hover:border-line hover:text-fg">
                <span>
                  <strong className="label-md mr-2 text-fg">Generate from guide</strong>
                  Build a TTT2 team combo from the bundled “TTT2 BNB Combos” guide.
                </span>
                <span aria-hidden className="text-primary">→</span>
              </a>
            )}
          </Panel>

          <Collapsible
            title="Combo details"
            summary={detailsSummary(draft, damage)}
            defaultOpen={hasDetails(start.draft)}
            aside={<span className="label-sm text-[11px] text-fg-muted uppercase">Optional</span>}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Difficulty">
                <Select value={draft.difficulty} onChange={(e) => set('difficulty', e.target.value as ComboDraft['difficulty'])}>
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d[0]?.toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Damage (optional)" aside="0–999">
                <TextInput type="number" inputMode="numeric" min={0} max={999} value={damage} onChange={(e) => setDamage(e.target.value)} />
              </Field>
            </div>
            <Field label="Tags">
              <TagInput id="tags" value={draft.tags} onChange={(t) => set('tags', t)} suggestions={collectTags(library)} />
            </Field>
            <Field label="Notes">
              <TextArea value={draft.notes} onChange={(e) => set('notes', e.target.value)} rows={4} placeholder="Timing tips, wall/ground conditions…" />
            </Field>
          </Collapsible>

          <NotationReference game={draft.game} dialect={draft.dialect} characters={team} />
        </div>

        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[72px]">
          <Panel aria-label="Live preview" className="flex flex-col gap-3 p-4">
            <PanelHeader
              title="Live arcade display"
              icon={<span aria-hidden className="size-2 rounded-full bg-success" />}
              aside={<VisualControls value={visual} onChange={setVisual} />}
            />
            <ComboVisual parsed={parsed} options={visual} />
          </Panel>

          {diagnostics.length > 0 && (
            <Panel className="flex flex-col gap-3 p-4">
              <PanelHeader
                title={`Problems & diagnostics (${diagnostics.length})`}
                icon={<span aria-hidden className="text-warning">⚠</span>}
                aside={<span className="label-sm text-[11px] text-fg-muted uppercase">{game.name}</span>}
              />
              <DiagnosticsList diagnostics={diagnostics} notation={draft.notation} />
              <p className="text-sm text-fg-muted">Warnings never block saving and never change your text.</p>
            </Panel>
          )}

          {game.tag && parsed.result.ast.sections.length > 1 && (
            <SectionAssigner parsed={parsed} characters={team} manual={draft.sectionCharacters} onChange={(m) => set('sectionCharacters', m)} />
          )}
        </div>
      </div>
    </form>
  );
}
