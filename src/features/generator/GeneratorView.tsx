import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { SideToggle } from '../../components/combos/SideToggle';
import { Button } from '../../components/ui/Button';
import { Segmented, ToggleChip } from '../../components/ui/Chip';
import { Checkbox, Field, Select } from '../../components/ui/Field';
import { Eyebrow, PageTitle, Panel, PanelHeader } from '../../components/ui/Panel';
import { useToast } from '../../components/ui/Toast';
import { errorMessage } from '../../hooks/useCombos';
import { paths } from '../../hooks/useHashRoute';
import { generateCombos, type GeneratedCombo, type GeneratorOptions, type Performer } from '../../ttt2/generator';
import { GUIDE_SOURCE, loadGuideLibrary } from '../../ttt2/guideData';
import type { GuideLibrary, PieceContext, RouteKind } from '../../ttt2/types';
import { GeneratedComboItem } from './GeneratedComboItem';
import { peekEditorDraft, setPendingGenerated } from './handoff';

const PAGE = 10;
const ROUTE_KINDS: ReadonlyArray<[RouteKind, string]> = [
  ['normal', 'Normal'],
  ['counterHit', 'Counter hit'],
  ['lowParry', 'Low parry'],
];
/** Default team when the guide has them (the spec's sample combo). */
const DEFAULT_TEAM = ['Kazuya', 'Nina'] as const;

interface Settings {
  point: string;
  mate: string;
  context: PieceContext;
  kinds: RouteKind[];
  starter: string;
  pointForm: string;
  partnerForm: string;
  fillerBy: Performer;
  enderBy: Performer;
  includeAdditional: boolean;
  onlyClean: boolean;
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
    kinds: ['normal', 'counterHit', 'lowParry'],
    starter: '',
    pointForm: '',
    partnerForm: '',
    fillerBy: 'partner',
    enderBy: 'point',
    includeAdditional: false,
    onlyClean: false,
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
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <Eyebrow>
          <span>Tekken Tag Tournament 2</span>
          <span aria-hidden>/</span>
          <span className="text-primary">Team combo generator</span>
        </Eyebrow>
        <PageTitle>TTT2 Combo Generator</PageTitle>
        <p className="max-w-4xl text-sm text-fg-muted">
          Build Tekken Tag Tournament 2 team combos from the bundled guide <strong className="text-fg">“{GUIDE_SOURCE.title}”</strong>: the point character’s route up
          to a Bound (B!), then Tag Assault (TA!), a TA filler and an ender.
        </p>
        <p className="flex items-center gap-2 rounded-[4px] border border-warning/50 bg-warning/5 px-3 py-2 text-sm text-warning">
          <span aria-hidden>⚠</span> Results are suggestions until tested in practice mode.
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
  const [settings, setSettings] = useState<Settings>(() =>
    remembered && names.includes(remembered.point) && names.includes(remembered.mate) ? remembered : defaultSettings(names),
  );
  const [shown, setShown] = useState(PAGE);
  useEffect(() => {
    remembered = settings;
  }, [settings]);

  const { point, mate, context, kinds, starter, pointForm, partnerForm, fillerBy, enderBy, includeAdditional, onlyClean } = settings;
  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));

  const starters = useMemo(() => {
    const kit = library.kits.find((k) => k.character === point);
    return [...new Set(kit?.pieces.filter((p) => p.role === 'route' && p.starter).map((p) => p.starter as string))];
  }, [library, point]);

  const options: GeneratorOptions = {
    point,
    partner: mate,
    context,
    routeKinds: context === 'wall' ? [...kinds, 'wall'] : kinds,
    fillerBy,
    enderBy,
    includeAdditional,
    onlyClean,
    ...(starter ? { starter } : {}),
    ...(pointForm && pointForm !== point ? { pointForm } : {}),
    ...(partnerForm && partnerForm !== mate ? { partnerForm } : {}),
  };
  const key = JSON.stringify(options);
  const sameCharacter = point === mate;
  const result = useMemo(() => (point && mate && !sameCharacter ? generateCombos(library, options) : null), [library, key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setShown(PAGE), [key]);

  const reset = () => setSettings(defaultSettings(names));

  const pointForms = formsOf(library, point);
  const partnerForms = formsOf(library, mate);
  const toggleKind = (k: RouteKind) => update({ kinds: kinds.includes(k) ? kinds.filter((x) => x !== k) : [...kinds, k] });
  const performers = [
    { value: 'point' as const, label: `Point (${point || '—'})` },
    { value: 'partner' as const, label: `Teammate (${mate || '—'})` },
  ];

  return (
    <div className="flex flex-col items-start gap-5 xl:flex-row">
      <Panel as="aside" aria-label="Generator options" className="flex w-full shrink-0 flex-col gap-4 p-4 xl:sticky xl:top-[72px] xl:max-h-[calc(100dvh-88px)] xl:w-[380px] xl:overflow-y-auto [scrollbar-width:thin] *:shrink-0">
        <PanelHeader
          title="Generator options"
          aside={
            <button type="button" className="label-md text-fg-muted underline underline-offset-4 hover:text-fg" onClick={reset}>
              Reset
            </button>
          }
        />
        <Field label="Point character" aside="Starts the combo">
          <Select
            value={point}
            onChange={(e) => update({ point: e.target.value, starter: '', pointForm: '' })}
          >
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
        <Field label="Tag-in teammate" aside="Tag Assault" hint="Only characters in the guide. Point and teammate must be different.">
          <Select
            value={mate}
            onChange={(e) => update({ mate: e.target.value, partnerForm: '' })}
          >
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

        <Group label="Player side">
          <SideToggle />
          <p className="text-xs text-fg-muted">2P mirrors forward/back arrows in the results. The notation stays the same.</p>
        </Group>

        <Field label="Starter">
          <Select value={starter} onChange={(e) => update({ starter: e.target.value })}>
            <option value="">Any starter</option>
            {starters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>

        <Group label="Starter types">
          <div role="group" aria-label="Starter types" className="flex flex-wrap gap-1.5">
            {ROUTE_KINDS.map(([k, label]) => (
              <ToggleChip key={k} active={kinds.includes(k)} onClick={() => toggleKind(k)}>
                {kinds.includes(k) && <span aria-hidden>✓ </span>}
                {label}
              </ToggleChip>
            ))}
          </div>
        </Group>

        <div className="flex flex-col gap-3 rounded-[4px] border border-line-strong bg-neutral p-3">
          <p className="label-md text-fg">After TA!</p>
          <Group label="Filler by">
            <Segmented label="Filler by" value={fillerBy} onChange={(v) => update({ fillerBy: v })} options={performers} />
          </Group>
          <Group label="Ender by">
            <Segmented label="Ender by" value={enderBy} onChange={(v) => update({ enderBy: v })} options={performers} />
          </Group>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-line-strong pt-3">
          <Checkbox label="Include conditional (“Additional”) options" checked={includeAdditional} onChange={(e) => update({ includeAdditional: e.target.checked })} />
          <Checkbox label="Only pieces without notation warnings" checked={onlyClean} onChange={(e) => update({ onlyClean: e.target.checked })} />
        </div>
      </Panel>

      <section aria-label="Generated combos" className="flex w-full min-w-0 flex-1 flex-col gap-4">
        {sameCharacter ? (
          <StateCard title="Same character chosen twice" body="Pick two different characters for the point and the tag-in teammate." tone="error" />
        ) : kinds.length === 0 && context === 'open' ? (
          <StateCard title="No starter types selected" body="Select at least one starter type: Normal, Counter hit or Low parry." />
        ) : (
          result && (
            <>
              <Panel className="flex flex-col gap-1 p-4">
                <h2 className="label-md flex items-center gap-2 text-fg">
                  <span aria-hidden className="size-2 rounded-[1px] bg-primary" /> Generated combos
                </h2>
                <p className="label-sm text-fg-muted" role="status">
                  <strong className="text-fg">{result.stats.valid}</strong> combos · {result.stats.routes} routes reaching B! × {result.stats.fillers} TA fillers ×{' '}
                  {result.stats.enders} enders
                </p>
              </Panel>
              {result.stats.valid === 0 ? (
                <StateCard
                  title="No combos for these options"
                  body={[
                    result.stats.routes === 0 && `The guide has no ${point} route reaching a Bound (B!) for these starters.`,
                    result.stats.fillers === 0 && 'No TA fillers for this side/context.',
                    result.stats.enders === 0 && 'No enders for this side/context.',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              ) : (
                <ol className="flex flex-col gap-4">
                  {result.combos.slice(0, shown).map((c, i) => (
                    <GeneratedComboItem key={c.id} combo={c} rank={i + 1} point={point} partner={mate} onUse={(combo) => onUse(combo, { point, partner: mate })} onCopy={onCopy} />
                  ))}
                </ol>
              )}
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                {shown < result.combos.length ? (
                  <Button onClick={() => setShown((n) => n + PAGE)}>Show more ({result.combos.length - shown} left)</Button>
                ) : (
                  <span />
                )}
                <p className="label-sm text-[11px] text-fg-muted sm:text-right">Source: {GUIDE_SOURCE.credits}</p>
              </div>
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
      <p className={`font-condensed text-2xl font-bold uppercase ${tone === 'error' ? 'text-danger' : 'text-fg'}`} role={tone === 'error' ? 'alert' : undefined}>
        {title}
      </p>
      {body && <p className="max-w-lg text-sm text-fg-muted">{body}</p>}
    </Panel>
  );
}
