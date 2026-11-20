import { useEffect, useMemo, useState } from 'react';
import { CommandSequence } from '../../components/arcade';
import { Button } from '../../components/ui/Button';
import { Chip, ToggleChip } from '../../components/ui/Chip';
import { Checkbox, Select } from '../../components/ui/Field';
import { PageTitle, Panel } from '../../components/ui/Panel';
import { useToast } from '../../components/ui/Toast';
import { errorMessage, useRepository } from '../../hooks/useCombos';
import { useMotionFrame } from '../../hooks/useMotionFrame';
import { usePlayerSide } from '../../hooks/usePlayerSide';
import { parseNotation } from '../../parser';
import { DIFFICULTIES, type ComboDraft } from '../../types/combo';
import { launcherOf } from '../library/filters';
import { DEFAULT_FILTERS, filterAndSortCombos, type CommunityCombo, type CommunityGame, type ConvertedCombo, type ExploreFilters } from './filters';
import { kageToNotation } from './kage';
import { MerlinView } from './MerlinView';
import { EditCopy } from './EditCopy';

const files = import.meta.glob<{ default: { combos: CommunityCombo[] } }>('../../data/community/kage-*.json');
const games = (['t8', 't7'] as const).filter((game) => `../../data/community/kage-${game}.json` in files);
const TAGS = ['Heat', 'Wall', 'Counter Hit', 'Rage'];

function convert(combo: CommunityCombo): ConvertedCombo {
  const notation = kageToNotation(combo.raw, combo.game, combo.character);
  const result = parseNotation(notation, { game: combo.game, characters: [combo.character] });
  return { ...combo, notation, result, clean: !result.diagnostics.some((d) => d.severity === 'warning') };
}

export function ExploreView() {
  const [game, setGame] = useState<CommunityGame | 't6'>(games[0] ?? 't8');
  const [combos, setCombos] = useState<ConvertedCombo[]>([]);
  const [filters, setFilters] = useState<ExploreFilters>(DEFAULT_FILTERS);
  const [limit, setLimit] = useState(20);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let active = true;
    if (game === 't6') return;
    const load = files[`../../data/community/kage-${game}.json`];
    if (!load) { setStatus('error'); return; }
    setStatus('loading');
    load().then((data) => {
      if (active) { setCombos(data.default.combos.map(convert)); setStatus('ready'); }
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, [game]);
  const set = <K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setLimit(20);
  };
  const visible = useMemo(() => filterAndSortCombos(combos, filters), [combos, filters]);
  const characters = useMemo(() => [...new Set(combos.map((c) => c.character))].sort(), [combos]);
  const launchers = useMemo(() => [...new Set(combos.filter((c) => !filters.character || c.character === filters.character).map((c) => launcherOf(c.notation)).filter(Boolean))].sort(), [combos, filters.character]);

  return <div className="flex flex-col gap-4">
    <header><PageTitle>Explore community combos</PageTitle>{game !== 't6' && <p className="mt-2 text-sm text-fg-muted">Combos from tekken8combo.kagewebsite.com / tekken7combo.kagewebsite.com, by their authors.</p>}</header>
    <Panel aria-label="Explore filters" className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap gap-1" role="group" aria-label="Game">{[...games, 't6' as const].map((g) => <ToggleChip key={g} active={game === g} onClick={() => { setGame(g); setFilters(DEFAULT_FILTERS); setLimit(20); }}>{g.toUpperCase()}</ToggleChip>)}</div>
      {game !== 't6' && <><div className="grid gap-2 sm:grid-cols-3">
        <Select aria-label="Character" value={filters.character} onChange={(e) => { setFilters((f) => ({ ...f, character: e.target.value, launcher: '' })); setLimit(20); }}><option value="">Any character</option>{characters.map((c) => <option key={c}>{c}</option>)}</Select>
        <Select aria-label="Launcher" value={filters.launcher} onChange={(e) => set('launcher', e.target.value)}><option value="">Any launcher</option>{launchers.map((l) => <option key={l}>{l}</option>)}</Select>
        <Select aria-label="Sort" value={filters.sort} onChange={(e) => set('sort', e.target.value as ExploreFilters['sort'])}><option value="newest">Newest</option><option value="damage">Most damage</option><option value="hits">Most hits</option></Select>
      </div>
      <div className="flex flex-wrap items-center gap-2"><span className="label-md text-fg-muted">Tags</span>{TAGS.map((tag) => <ToggleChip key={tag} active={filters.tags.includes(tag)} onClick={() => set('tags', filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag])}>{tag}</ToggleChip>)}<Checkbox label="Only clean conversions" checked={filters.cleanOnly} onChange={(e) => set('cleanOnly', e.target.checked)} /></div></>}
    </Panel>
    {game === 't6' ? <MerlinView /> : status === 'loading' ? <p role="status" className="text-fg-muted">Loading combos…</p> : status === 'error' ? <p role="alert">Could not load community combos.</p> : <>
      <p role="status" className="label-sm text-fg-muted">{(visible.length === 1 ? `${visible.length} combo` : `${visible.length} combos`)}</p>
      {visible.length === 0 ? <Panel className="p-4 text-fg-muted">No combos match these filters.</Panel> : <section aria-label="Community combos" className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">{visible.slice(0, limit).map((combo) => <CommunityCard key={`${combo.game}-${combo.id}`} combo={combo} />)}</section>}
      {limit < visible.length && <div><Button onClick={() => setLimit((n) => n + 20)}>Show more</Button></div>}
    </>}
  </div>;
}

function CommunityCard({ combo }: { combo: ConvertedCombo }) {
  const repo = useRepository();
  const toast = useToast();
  const [side] = usePlayerSide();
  const [motionFrame] = useMotionFrame();
  const [saving, setSaving] = useState(false);
  const draft: ComboDraft = {
      name: `${combo.character} ${combo.damage == null ? '' : `${combo.damage} dmg `}#${combo.id}`,
      notation: combo.notation, game: combo.game, character: combo.character, dialect: 'standard', sectionCharacters: [],
      damage: combo.damage ?? undefined, hits: combo.hits ?? undefined,
      position: combo.tags.some((t) => t.toLowerCase() === 'wall') ? 'wall' : undefined,
      tags: combo.tags, notes: `Source: ${combo.source} — by ${combo.author} (${combo.date})`, difficulty: DIFFICULTIES[1], favorite: false,
  };
  const save = async () => {
    setSaving(true);
    try { await repo.create(draft); toast('Combo saved to library', 'success'); }
    catch (error) { toast(`Could not save combo: ${errorMessage(error)}`, 'error'); }
    finally { setSaving(false); }
  };
  return <article className="flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-4">
    <header><h2 className="text-lg font-semibold">{combo.character}</h2></header>
    <div className="flex flex-wrap items-center gap-1.5">{combo.damage != null && <Chip>{combo.damage} dmg</Chip>}{combo.hits != null && <Chip>{(combo.hits === 1 ? `${combo.hits} hit` : `${combo.hits} hits`)}</Chip>}{combo.tags.map((tag) => <Chip key={tag}>{tag}</Chip>)}{!combo.clean && <Chip>Conversion warnings</Chip>}</div>
    <CommandSequence result={combo.result} size={24} side={side} motionFrame={motionFrame} />
    <p className="break-words font-mono text-sm text-fg-muted">{combo.raw}</p>
    <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-line-strong pt-3"><Button variant="primary" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save to library'}</Button><EditCopy draft={draft} /></div>
  </article>;
}

