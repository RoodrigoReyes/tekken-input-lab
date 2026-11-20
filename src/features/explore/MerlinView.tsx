import { useEffect, useId, useState } from 'react';
import { CommandSequence } from '../../components/arcade';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Field, Select } from '../../components/ui/Field';
import { Panel } from '../../components/ui/Panel';
import { useToast } from '../../components/ui/Toast';
import { errorMessage, useRepository } from '../../hooks/useCombos';
import { useMotionFrame } from '../../hooks/useMotionFrame';
import { usePlayerSide } from '../../hooks/usePlayerSide';
import { parseNotation } from '../../parser';
import { DIFFICULTIES, type ComboDraft } from '../../types/combo';
import { EditCopy } from './EditCopy';
import { merlinToNotation } from './merlin';

const SOURCE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSrQDVLlXLCnW7Bo1LnF2yBjObEBWady8sfX4Fz8j2lUIpAINFQWa0f5-qBLUR8QMcjEX5NtCx1pgUU/pubhtml';
interface Group { launchers: string[]; routes: string[] }
interface Character {
  name: string; players: string[]; notes: string[];
  hard: string[];
  guaranteed: { starters: string[]; followUps: string[] }[];
  structure: Group[]; counterHit: Group[]; lowParry: string[]; postBound: string[];
  wall: { splatToBound: string[]; boundToSplat: string[] };
  punish: { startup: string; stand: string; crouch: string }[];
}

export function MerlinView() {
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [error, setError] = useState(false);
  const [name, setName] = useState('');
  useEffect(() => {
    let active = true;
    import('../../data/t6-merlin/t6.json').then(({ default: data }) => {
      if (active) { setCharacters(data.characters); setName(data.characters[0]?.name ?? ''); }
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, []);
  const character = characters?.find((c) => c.name === name);
  return <div className="flex flex-col gap-4">
    <p className="text-sm text-fg-muted"><a className="underline underline-offset-4" href={SOURCE} target="_blank" rel="noopener noreferrer">Tekken 6 routes from Merlin's Tekken 6 Combo Library (@Merlin_FGC)</a></p>
    {error ? <p role="alert">Could not load Tekken 6 routes.</p> : !characters ? <p role="status">Loading Tekken 6 routes…</p> : <>
      <Field label="Character"><Select value={name} onChange={(e) => setName(e.target.value)}>{characters.map((c) => <option key={c.name}>{c.name}</option>)}</Select></Field>
      {character && <CharacterRoutes key={character.name} character={character} />}
    </>}
  </div>;
}

function Drawing({ text, character }: { text: string; character: string }) {
  const [side] = usePlayerSide();
  const [motionFrame] = useMotionFrame();
  const notation = merlinToNotation(text, character);
  const result = parseNotation(notation, { game: 't6', characters: [character] });
  return <><CommandSequence result={result} size={24} side={side} motionFrame={motionFrame} /><p className="break-words whitespace-pre-wrap font-mono text-sm text-fg-muted">{text}</p>{result.diagnostics.length > 0 && <p className="text-sm text-fg-muted">Notation has parser diagnostics; check the original text.</p>}</>;
}

function Save({ text, character, label, disabled = false }: { text: string; character: string; label: string; disabled?: boolean }) {
  const repo = useRepository();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const draft: ComboDraft = { name: `${character} ${label}`, notation: merlinToNotation(text, character), game: 't6', character, dialect: 'standard', sectionCharacters: [], tags: [], notes: `From Merlin's Tekken 6 Combo Library (@Merlin_FGC): ${SOURCE}`, difficulty: DIFFICULTIES[1], favorite: false };
  const save = async () => {
    setSaving(true);
    try {
      await repo.create(draft);
      toast('Combo saved to library', 'success');
    } catch (error) { toast(`Could not save combo: ${errorMessage(error)}`, 'error'); }
    finally { setSaving(false); }
  };
  return <div className="flex flex-wrap gap-3"><Button variant="primary" onClick={save} disabled={saving || disabled}>{saving ? 'Saving…' : 'Save to library'}</Button><EditCopy draft={draft} disabled={disabled} /></div>;
}

function Pieces({ title, pieces, value, onChange, character, hard = [] }: { title: string; pieces: string[]; value: number | null; onChange: (index: number) => void; character: string; hard?: string[] }) {
  const radioName = useId();
  return <fieldset className="flex min-w-0 flex-col gap-2"><legend className="font-semibold">{title}</legend>{pieces.length === 0 ? <p className="text-sm text-fg-muted">None listed.</p> : pieces.map((piece, i) => <label key={i} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3"><input className="mt-1 size-4 accent-primary" type="radio" name={radioName} checked={value === i} onChange={() => onChange(i)} /><span className="flex min-w-0 flex-col gap-1"><Drawing text={piece} character={character} />{hard.includes(piece) && <span className="w-fit" title="Marked hard by Merlin"><Chip>Hard</Chip></span>}{piece.includes('*') && <span className="text-sm">* Tied piece</span>}</span></label>)}</fieldset>;
}

function RouteBuilder({ character, groups, lowParry = false }: { character: Character; groups: Group[]; lowParry?: boolean }) {
  const [groupIndex, setGroup] = useState<number | null>(groups.length ? 0 : null);
  const [launcherPick, setLauncher] = useState<number | null>(null);
  const [routePick, setRoute] = useState<number | null>(null);
  const [enderPick, setEnder] = useState<number | null>(null);
  // A single option needs no click.
  const only = (picked: number | null, count: number) => picked ?? (count === 1 ? 0 : null);
  const group = groupIndex === null ? undefined : groups[groupIndex];
  const launcherIndex = only(launcherPick, group?.launchers.length ?? 0);
  const launcher = launcherIndex === null ? undefined : group?.launchers[launcherIndex];
  const routes = (lowParry ? character.lowParry : group?.routes ?? []).filter((route) => lowParry || !route.includes('*') || launcher?.includes('*'));
  const routeIndex = only(routePick, routes.length);
  const route = routeIndex === null ? undefined : routes[routeIndex];
  const needsEnder = !!route && /B!\s*(?:\([^)]*\))?\s*$/i.test(route);
  const enderIndex = only(enderPick, character.postBound.length);
  const ender = enderIndex === null ? undefined : character.postBound[enderIndex];
  const assembled = [launcher, route, needsEnder ? ender : undefined].filter(Boolean).join(' - ');
  const complete = !!route && (lowParry || !!launcher) && (!needsEnder || !!ender);
  return <div className="flex flex-col gap-4">
    {!lowParry && <Field label="Launcher group"><Select value={groupIndex ?? ''} onChange={(e) => { setGroup(e.target.value === '' ? null : Number(e.target.value)); setLauncher(null); setRoute(null); setEnder(null); }}><option value="">Choose a launcher group</option>{groups.map((g, i) => <option key={i} value={i}>{g.launchers.join(' / ')}</option>)}</Select></Field>}
    {group && <Pieces title="Launcher" pieces={group.launchers} value={launcherIndex} onChange={(i) => { setLauncher(i); setRoute(null); setEnder(null); }} character={character.name} hard={character.hard} />}
    {(lowParry || launcher) && <Pieces title="Route" pieces={routes} value={routeIndex} onChange={(i) => { setRoute(i); setEnder(null); }} character={character.name} hard={character.hard} />}
    {needsEnder && <Pieces title="Post-B! ender" pieces={character.postBound} value={enderIndex} onChange={setEnder} character={character.name} hard={character.hard} />}
    {assembled && <Panel className="flex min-w-0 flex-col gap-3 p-4"><h3 className="font-semibold">Assembled combo</h3><Drawing text={assembled} character={character.name} /><div><Save text={assembled} character={character.name} disabled={!complete} label={lowParry ? 'low parry' : 'route'} /></div></Panel>}
  </div>;
}

function Snippets({ pieces, character, label, hard = [] }: { pieces: string[]; character: string; label: string; hard?: string[] }) {
  return pieces.length ? <div className="grid gap-3 md:grid-cols-2">{pieces.map((piece, i) => <Panel key={i} className="flex min-w-0 flex-col gap-2 p-3"><Drawing text={piece} character={character} />{hard.includes(piece) && <span className="w-fit" title="Marked hard by Merlin"><Chip>Hard</Chip></span>}<div><Save text={piece} character={character} label={label} /></div></Panel>)}</div> : <p className="text-sm text-fg-muted">None listed.</p>;
}

function GuaranteedHit({ hit, character, hard }: { hit: Character['guaranteed'][number]; character: string; hard: string[] }) {
  const [starter, setStarter] = useState<number | null>(null);
  const [followUp, setFollowUp] = useState<number | null>(null);
  const text = [starter === null ? undefined : hit.starters[starter], followUp === null ? undefined : hit.followUps[followUp]].filter(Boolean).join(' - ');
  return <Panel className="flex min-w-0 flex-col gap-3 p-3">
    <Pieces title="Starter" pieces={hit.starters} value={starter} onChange={setStarter} character={character} hard={hard} />
    <Pieces title="Follow-up" pieces={hit.followUps} value={followUp} onChange={setFollowUp} character={character} hard={hard} />
    <div><Save text={text} character={character} label="guaranteed hit" disabled={starter === null || followUp === null} /></div>
  </Panel>;
}

function CharacterRoutes({ character }: { character: Character }) {
  return <div className="flex flex-col gap-4">
    {character.players.length > 0 && <p><strong>Players to watch:</strong> {character.players.join(', ')}</p>}
    {character.notes.map((note, i) => <p key={i} className="whitespace-pre-wrap text-sm">{note}</p>)}
    <section><h2 className="mb-3 text-xl font-semibold">Combo routes</h2><RouteBuilder key={character.name} character={character} groups={character.structure} /></section>
    <section><h2 className="mb-3 text-xl font-semibold">Counter hit routes</h2><RouteBuilder key={character.name} character={character} groups={character.counterHit} /></section>
    <section><h2 className="mb-3 text-xl font-semibold">Wall combos</h2><h3 className="mb-2 font-semibold">Splat → Bound</h3><Snippets pieces={character.wall.splatToBound} character={character.name} label="wall combo" hard={character.hard} /><h3 className="my-2 font-semibold">Bound → Splat</h3><Snippets pieces={character.wall.boundToSplat} character={character.name} label="wall combo" hard={character.hard} /></section>
    <section><h2 className="mb-3 text-xl font-semibold">Low parry</h2><RouteBuilder key={character.name} character={character} groups={[]} lowParry /></section>
    <section><h2 className="mb-3 text-xl font-semibold">Guaranteed hits</h2><div className="grid gap-3 md:grid-cols-2">{character.guaranteed.map((g, i) => <GuaranteedHit key={i} hit={g} character={character.name} hard={character.hard} />)}</div></section>
    <section><h2 className="mb-3 text-xl font-semibold">Punishment</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th scope="col">Startup</th><th scope="col">Standing</th><th scope="col">Crouching</th></tr></thead><tbody>{character.punish.map((p, i) => <tr key={i} className="border-t border-line"><td className="p-2">{p.startup}</td><td className="p-2 whitespace-pre-wrap">{p.stand}</td><td className="p-2 whitespace-pre-wrap">{p.crouch}</td></tr>)}</tbody></table></div></section>
  </div>;
}
