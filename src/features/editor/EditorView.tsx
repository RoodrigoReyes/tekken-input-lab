import { useMemo, useState, type FormEvent } from 'react';
import { DiagnosticsList } from '../../components/combos/DiagnosticsList';
import { ComboVisual, DEFAULT_VISUAL, VisualControls } from '../../components/combos/ComboVisual';
import { Button, LinkButton } from '../../components/ui/Button';
import { ComboBox, Field, Select, TextArea, TextInput } from '../../components/ui/Field';
import { TagInput } from '../../components/ui/TagInput';
import { useToast } from '../../components/ui/Toast';
import { errorMessage, useCombo, useCombos, useRepository } from '../../hooks/useCombos';
import { paths } from '../../hooks/useHashRoute';
import { dialectsForGame, getDialect } from '../../notation/dialects';
import { GAMES, getGame } from '../../notation/games';
import { DIFFICULTIES, type Combo, type ComboDraft } from '../../types/combo';
import type { GameId } from '../../types/notation';
import { parseCombo } from '../combo/parseCombo';
import { collectTags } from '../library/filters';
import { NotationReference } from './NotationReference';
import { SectionAssigner } from './SectionAssigner';

const NEW_DRAFT: ComboDraft = {
  game: 't8',
  character: '',
  name: '',
  notation: '',
  dialect: 'standard',
  sectionCharacters: [],
  tags: [],
  difficulty: 'beginner',
  notes: '',
  favorite: false,
};

function toDraft(combo: Combo): ComboDraft {
  const { id: _id, createdAt: _c, updatedAt: _u, ...draft } = combo;
  void _id;
  void _c;
  void _u;
  return draft;
}

/** Create (id = null) or edit an existing combo. */
export function EditorView({ id, navigate }: { id: string | null; navigate: (hash: string) => void }) {
  const { data, loading, error } = useCombo(id);
  if (id !== null && loading) return <p className="text-ink-400">Loading…</p>;
  if (id !== null && (error || !data)) {
    return <p className="text-red-300">{error ?? 'This combo no longer exists.'}</p>;
  }
  return <EditorForm key={id ?? 'new'} id={id} initial={data ? toDraft(data) : NEW_DRAFT} navigate={navigate} />;
}

function EditorForm({ id, initial, navigate }: { id: string | null; initial: ComboDraft; navigate: (hash: string) => void }) {
  const repo = useRepository();
  const toast = useToast();
  const { data: library } = useCombos();
  const [draft, setDraft] = useState<ComboDraft>(initial);
  const [damage, setDamage] = useState(initial.damage?.toString() ?? '');
  const [visual, setVisual] = useState(DEFAULT_VISUAL);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const game = getGame(draft.game);
  const dialects = dialectsForGame(draft.game);
  const parsed = useMemo(
    () => parseCombo(draft),
    [draft.game, draft.dialect, draft.notation, draft.character, draft.partner, draft.sectionCharacters],
  );
  const team = [draft.character, draft.partner].filter((c): c is string => Boolean(c?.trim()));

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

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <h1 className="text-2xl font-extrabold">{id ? 'Edit combo' : 'New combo'}</h1>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        {game.tag && (
          <Field label="Partner">
            <ComboBox id="partner" options={game.roster} value={draft.partner ?? ''} onChange={(e) => set('partner', e.target.value)} placeholder="e.g. Armor King" />
          </Field>
        )}
        {dialects.length > 1 && (
          <Field label="Notation dialect" hint={getDialect(draft.dialect).description}>
            <Select value={draft.dialect} onChange={(e) => set('dialect', e.target.value)}>
              {dialects.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <Field label="Combo name">
        <TextInput value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Midscreen BnB" maxLength={120} required />
      </Field>

      <Field label="Notation" hint="The original text is saved exactly as typed.">
        <TextArea
          value={draft.notation}
          onChange={(e) => set('notation', e.target.value)}
          rows={3}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className="font-mono"
          placeholder="qcf+1 > uf+2,1 B! > SSL 1~b~uf+4 > f+1,2,1+2"
        />
      </Field>

      <section className="space-y-2" aria-label="Live preview">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-ink-400 uppercase">Preview</h2>
          <VisualControls value={visual} onChange={setVisual} />
        </div>
        <ComboVisual parsed={parsed} options={visual} />
        <DiagnosticsList diagnostics={parsed.result.diagnostics} notation={draft.notation} />
      </section>

      {game.tag && parsed.result.ast.sections.length > 1 && (
        <SectionAssigner parsed={parsed} characters={team} manual={draft.sectionCharacters} onChange={(m) => set('sectionCharacters', m)} />
      )}

      <NotationReference game={draft.game} dialect={draft.dialect} characters={team} />

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Difficulty">
          <Select value={draft.difficulty} onChange={(e) => set('difficulty', e.target.value as ComboDraft['difficulty'])}>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d[0]?.toUpperCase() + d.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Damage (optional)">
          <TextInput type="number" inputMode="numeric" min={0} max={999} value={damage} onChange={(e) => setDamage(e.target.value)} />
        </Field>
        <Field label="Tags">
          <TagInput id="tags" value={draft.tags} onChange={(t) => set('tags', t)} suggestions={collectTags(library)} />
        </Field>
      </div>

      <Field label="Notes">
        <TextArea value={draft.notes} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="Timing tips, wall/ground conditions…" />
      </Field>

      {formError && (
        <p role="alert" className="rounded-lg border border-red-800 bg-red-950 p-3 text-sm text-red-200">
          {formError}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save combo'}
        </Button>
        <LinkButton href={id ? paths.details(id) : paths.library()} variant="ghost">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
