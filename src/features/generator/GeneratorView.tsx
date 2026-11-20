import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button } from '../../components/ui/Button';
import { Segmented } from '../../components/ui/Chip';
import { Collapsible } from '../../components/ui/Collapsible';
import { Checkbox, Field, Select } from '../../components/ui/Field';
import { PageTitle, Panel } from '../../components/ui/Panel';
import { useToast } from '../../components/ui/Toast';
import { errorMessage } from '../../hooks/useCombos';
import { paths } from '../../hooks/useHashRoute';
import { assembleCombo, bestPick, collectPieces, formMatches, reachesBound, type ComboPick, type GeneratedCombo, type GeneratorOptions, type Performer } from '../../ttt2/generator';
import { GUIDE_SOURCE, loadGuideLibrary } from '../../ttt2/guideData';
import { loadMovelists, movesFor } from '../../ttt2/movelistData';
import { enderKey, type MovelistMove } from '../../ttt2/candidateEnders';
import { characterPatterns } from '../../ttt2/movePatterns';
import type { GuideLibrary, PieceContext, RouteKind } from '../../ttt2/types';
import { ComboBuilder } from './ComboBuilder';
import { ComboResult } from './ComboResult';
import { peekEditorDraft, setPendingGenerated } from './handoff';
import { MovePatterns } from './MovePatterns';
import { swapTeam, type TeamFields } from './teamSwap';
import { verifiedEnders } from './verifiedEnders';

/** Every route kind is offered: the route dropdown groups them (Normal, Counter hit, Low parry, Wall). */
const ROUTE_KINDS: readonly RouteKind[] = ['normal', 'counterHit', 'lowParry'];
/** Default team when the guide has them (the spec's sample combo). */
const DEFAULT_TEAM = ['Kazuya', 'Nina'] as const;

interface Settings extends TeamFields {
  context: PieceContext;
  fillerBy: Performer;
  enderBy: Performer;
  includeAdditional: boolean;
  onlyClean: boolean;
  /** Suggest extra enders for the starting character from their move list (heuristic). */
  suggestEnders: boolean;
  /** Move landed on the fly: only routes using it before B! ('' = all). */
  move: string;
}

/** Last settings, kept for the session so leaving the page (e.g. to the editor and back) does not reset them. */
let remembered: Settings | null = null;

function defaultSettings(names: readonly string[]): Settings {
  // Prefer the team typed in the editor (when coming from it), then the sample team.
  const draft = peekEditorDraft();
  const find = (name: string | undefined) => names.find((n) => n.toLowerCase() === name?.trim().toLowerCase());
  const point = find(draft?.character) ?? find(DEFAULT_TEAM[0]) ?? names[0] ?? '';
  const mate = find(draft?.partner) ?? find(DEFAULT_TEAM[1]) ?? names.find((n) => n !== point) ?? '';
  return {
    point,
    mate,
    context: 'open',
    pointForm: '',
    partnerForm: '',
    routeId: '',
    fillerId: '',
    enderId: '',
    fillerBy: 'partner',
    enderBy: 'point',
    includeAdditional: true,
    onlyClean: false,
    suggestEnders: false,
    move: '',
  };
}

function useGuideLibrary(): { library: GuideLibrary | null; error: string | null } {
  const [library, setLibrary] = useState<GuideLibrary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    loadGuideLibrary()
      .then((lib) => active && setLibrary(lib))
      .catch((e: unknown) => active && setError(`Could not load the combo guide: ${errorMessage(e)}`));
    return () => {
      active = false;
    };
  }, []);
  return { library, error };
}

function formsOf(library: GuideLibrary, character: string): string[] {
  const kit = library.kits.find((k) => k.character === character);
  const forms = new Set(kit?.pieces.flatMap((p) => (p.form ? [p.form] : [])) ?? []);
  return forms.size ? [character, ...forms] : [];
}

/** Page: builds TTT2 team combos from the bundled guide (route → TA! → TA filler → ender). */
export function GeneratorView({ navigate }: { navigate: (hash: string) => void }) {
  const { library, error } = useGuideLibrary();
  const toast = useToast();

  const use = (combo: GeneratedCombo, team: { point: string; partner: string }) => {
    setPendingGenerated({ combo, team });
    toast('Combo inserted. Review it in the preview before saving.', 'success');
    navigate(paths.new());
  };

  const copy = async (notation: string) => {
    try {
      await navigator.clipboard.writeText(notation);
      toast('Notation copied', 'success');
    } catch (e) {
      toast(`Could not copy: ${errorMessage(e)}`, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1.5">
        <PageTitle>TTT2 Combo Generator</PageTitle>
        <p className="text-sm text-fg-muted">
          Team combos built from the bundled guide <strong className="text-fg">“{GUIDE_SOURCE.title}”</strong>. <span className="text-warning">⚠ Untested suggestions.</span>
        </p>
      </header>

      {error ? (
        <StateCard title="The guide failed to load" body={error} tone="error" />
      ) : !library ? (
        <StateCard title="Loading the combo guide…" body="Reading the bundled “TTT2 BNB Combos” guide." />
      ) : (
        <Generator library={library} onUse={use} onCopy={(n) => void copy(n)} />
      )}
    </div>
  );
}

interface GeneratorProps {
  library: GuideLibrary;
  onUse: (combo: GeneratedCombo, team: { point: string; partner: string }) => void;
  onCopy: (notation: string) => void;
}

function Generator({ library, onUse, onCopy }: GeneratorProps) {
  const names = useMemo(() => library.kits.map((k) => k.character).sort((a, b) => a.localeCompare(b)), [library]);
  const [verified, setVerified] = verifiedEnders.use();
  const [settings, setSettings] = useState<Settings>(() =>
    remembered && names.includes(remembered.point) && names.includes(remembered.mate) ? remembered : defaultSettings(names),
  );
  useEffect(() => {
    remembered = settings;
  }, [settings]);

  const { point, mate, context, pointForm, partnerForm, fillerBy, enderBy, includeAdditional, onlyClean, move, suggestEnders } = settings;
  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  // Move catalog for the suggested-enders heuristic (lazy; optional).
  const [movelists, setMovelists] = useState<Record<string, MovelistMove[]> | null>(null);
  useEffect(() => {
    if (!suggestEnders || movelists) return;
    let active = true;
    loadMovelists().then((m) => active && setMovelists(m)).catch(() => {});
    return () => { active = false; };
  }, [suggestEnders, movelists]);
  const enderCatalog = suggestEnders && enderBy === 'point' && context === 'open' && movelists ? movesFor(movelists, point) : undefined;

  const options: GeneratorOptions = {
    point,
    partner: mate,
    context,
    routeKinds: context === 'wall' ? [...ROUTE_KINDS, 'wall'] : ROUTE_KINDS,
    fillerBy,
    enderBy,
    includeAdditional,
    onlyClean,
    suggestEnders,
    verifiedEnders: verified,
    ...(enderCatalog ? { enderCatalog } : {}),
    ...(move.trim() ? { move } : {}),
    ...(pointForm && pointForm !== point ? { pointForm } : {}),
    ...(partnerForm && partnerForm !== mate ? { partnerForm } : {}),
  };
  const key = JSON.stringify({ ...options, enderCatalog: enderCatalog?.length ?? 0 });
  const sameCharacter = point === mate;
  const pools = useMemo(() => (point && mate && !sameCharacter ? collectPieces(library, options) : null), [library, key]); // eslint-disable-line react-hooks/exhaustive-deps
  const best = useMemo(() => (pools ? bestPick(pools) : null), [pools]);

  // A remembered choice that is no longer available (team, context or filters changed) falls back to the best pick.
  const pick: ComboPick | null =
    pools && best
      ? {
          routeId: pools.routes.some((r) => r.piece.id === settings.routeId) ? settings.routeId : best.routeId,
          fillerId: pools.fillers.some((f) => f.piece.id === settings.fillerId) ? settings.fillerId : best.fillerId,
          enderId: pools.enders.some((e) => e.piece.id === settings.enderId) ? settings.enderId : best.enderId,
        }
      : null;
  const combo = pools && pick ? assembleCombo(pools, pick) : null;
  const selectedEnder = pools?.enders.find((e) => e.piece.id === pick?.enderId)?.piece;
  const currentForm = pointForm && pointForm !== point ? pointForm : point;
  const isVerified = !!selectedEnder && verified.some((e) => e.character === point && e.form === currentForm && enderKey(e.notation) === enderKey(selectedEnder.notation));
  const verifyEnder = (checked: boolean) => {
    if (!selectedEnder) return;
    const remaining = verified.filter ( (e) => !(e.character === point && e.form === currentForm && enderKey(e.notation) === enderKey(selectedEnder.notation)) );
    setVerified(checked ? [...remaining, { character: point, form: currentForm, notation: selectedEnder.notation }] : remaining);
  };
  const teamRoutes = pools ? pools.routes.filter(reachesBound).length : 0;
  const soloRoutes = pools ? pools.routes.length - teamRoutes : 0;
  const patterns = useMemo(() => {
    const form = pointForm && pointForm !== point ? pointForm : undefined;
    const routes = library.kits.find((k) => k.character === point)?.pieces.filter((p) => p.role === 'route' && formMatches(p, form, point)) ?? [];
    return characterPatterns(routes);
  }, [library, point, pointForm]);

  const reset = () => setSettings(defaultSettings(names));
  const pointForms = formsOf(library, point);
  const partnerForms = formsOf(library, mate);
  const performers = [
    { value: 'point' as const, label: point ? `Point (${point})` : 'Point' },
    { value: 'partner' as const, label: mate ? `Teammate (${mate})` : 'Teammate' },
  ];
  const performerName = (p: Performer) => (p === 'point' ? point : mate);
  const formLabel = (form: string, name: string) => (form && form !== name ? form : name);
  const teamSummary = `${formLabel(pointForm, point)} → ${formLabel(partnerForm, mate)} · ${context === 'wall' ? 'At the wall' : 'Open ground'}`;
  const advancedSummary = [`Filler: ${performerName(fillerBy)}`, `Ender: ${performerName(enderBy)}`, includeAdditional && 'Conditional on', onlyClean && 'Clean only', suggestEnders && 'Suggested enders']
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex flex-col gap-4">
      <div aria-label="Generator options" role="group" className="flex flex-col gap-3">
        <Collapsible
          title="Team & setup"
          summary={teamSummary}
          defaultOpen
          storageKey="generator-team"
          aside={
            <button type="button" className="label-md inline-flex min-h-11 items-center px-1 text-fg-muted underline underline-offset-4 hover:text-fg" onClick={reset}>
              Reset
            </button>
          }
        >
          <div className="grid items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto]">
            <div className="flex flex-col gap-3">
              <Field label="Point character" aside="Starts the combo">
                <Select value={point} onChange={(e) => update({ point: e.target.value, pointForm: '', move: '' })}>
                  {names.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
              {pointForms.length > 0 && (
                <Field label={`${point} form`}>
                  <Select value={pointForm || point} onChange={(e) => update({ pointForm: e.target.value })}>
                    {pointForms.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>
            <Button
              className="self-center sm:mt-6 sm:self-start"
              onClick={() => setSettings((s) => ({ ...swapTeam(s), move: '' }))}
              disabled={!point || !mate || sameCharacter}
              aria-label="Swap point and teammate"
              title={`Let ${mate || 'the teammate'} start the combo and ${point || 'the point character'} tag in`}
            >
              <span aria-hidden className="sm:hidden">⇅</span>
              <span aria-hidden className="hidden sm:inline">⇄</span> Swap
            </Button>
            <div className="flex flex-col gap-3">
              <Field label="Tag-in teammate" aside="Tag Assault">
                <Select value={mate} onChange={(e) => update({ mate: e.target.value, partnerForm: '' })}>
                  {names.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </Field>
              {partnerForms.length > 0 && (
                <Field label={`${mate} form`}>
                  <Select value={partnerForm || mate} onChange={(e) => update({ partnerForm: e.target.value })}>
                    {partnerForms.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </Select>
                </Field>
              )}
            </div>
            <Group label="Where">
              <Segmented
                label="Where"
                value={context}
                onChange={(v) => update({ context: v })}
                options={[
                  { value: 'open', label: 'Open ground' },
                  { value: 'wall', label: 'At the wall' },
                ]}
              />
            </Group>
          </div>
        </Collapsible>

        <Collapsible title="Search by move" summary={move.trim() ? `${point} landed ${move.trim()}` : `${point}'s moves before B!`} storageKey="generator-move">
          <MovePatterns character={point} patterns={patterns} move={move} onMove={(m) => update({ move: m })} />
        </Collapsible>

        <Collapsible title="Advanced" summary={advancedSummary} storageKey="generator-advanced">
          <Group label="Filler by">
            <Segmented label="Filler by" value={fillerBy} onChange={(v) => update({ fillerBy: v })} options={performers} />
          </Group>
          <Group label="Ender by">
            <Segmented label="Ender by" value={enderBy} onChange={(v) => update({ enderBy: v })} options={performers} />
          </Group>
          <div className="flex flex-col gap-2.5 border-t border-line-strong pt-3">
            <Checkbox label="Include conditional (“Additional”) options" checked={includeAdditional} onChange={(e) => update({ includeAdditional: e.target.checked })} />
            <Checkbox label="Only pieces without notation warnings" checked={onlyClean} onChange={(e) => update({ onlyClean: e.target.checked })} />
            <Checkbox label="Suggest enders from the starter’s move list (heuristic, untested)" checked={suggestEnders} onChange={(e) => update({ suggestEnders: e.target.checked })} />
          </div>
        </Collapsible>
      </div>

      <section aria-label="Generated combo" className="flex min-w-0 flex-col gap-3">
        {sameCharacter ? (
          <StateCard title="Same character chosen twice" body="Pick two different characters for the point and the tag-in teammate." tone="error" />
        ) : (
          pools && (
            <>
              {combo && pick && <ComboResult combo={combo} point={point} partner={mate} onUse={(c) => onUse(c, { point, partner: mate })} onCopy={onCopy} />}
              <p className="label-sm text-fg-muted" role="status">
                <span aria-hidden className="mr-2 inline-block size-2 rounded-xs bg-fg-muted align-middle" />
                {teamRoutes} routes reaching B! · {soloRoutes} solo routes (no B!) · {pools.fillers.length} TA fillers · {pools.enders.length} enders
                <span className="text-fg-muted"> ({teamRoutes * pools.fillers.length * pools.enders.length} possible team combos)</span>
              </p>
              {combo && pick ? (
                <ComboBuilder pools={pools} pick={pick} onPick={(patch) => update(patch)} verified={isVerified} onVerify={verifyEnder} />
              ) : (
                <StateCard
                  title="No combos for these options"
                  body={[
                    pools.routes.length === 0 && (move.trim() ? `No ${point} route uses ${move.trim()} before B! here.` : `The guide has no ${point} route here.`),
                    pools.fillers.length === 0 && 'No TA fillers for this side/context.',
                    pools.enders.length === 0 && 'No enders for this side/context.',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              )}
              <p className="label-sm text-fg-muted">Source: {GUIDE_SOURCE.credits}</p>
            </>
          )
        )}
      </section>
    </div>
  );
}

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span aria-hidden className="label-md text-fg-muted">
        {label}
      </span>
      {children}
    </div>
  );
}

function StateCard({ title, body, tone }: { title: string; body?: string; tone?: 'error' }) {
  return (
    <Panel className={`flex flex-col items-center gap-2 px-6 py-[58px] text-center ${tone === 'error' ? 'border-danger/60' : ''}`}>
      <p className={`text-2xl font-bold uppercase ${tone === 'error' ? 'text-danger' : 'text-fg'}`} role={tone === 'error' ? 'alert' : undefined}>
        {title}
      </p>
      {body && <p className="max-w-lg text-sm text-fg-muted">{body}</p>}
    </Panel>
  );
}
