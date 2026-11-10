import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Field, Select } from '../../components/ui/Field';
import { errorMessage } from '../../hooks/useCombos';
import { generateCombos, type GeneratedCombo, type GeneratorOptions, type Performer } from '../../ttt2/generator';
import { GUIDE_SOURCE, loadGuideLibrary } from '../../ttt2/guideData';
import type { GuideLibrary, PieceContext, RouteKind } from '../../ttt2/types';
import { GeneratedComboItem } from './GeneratedComboItem';

const PAGE = 10;
const ROUTE_KINDS: ReadonlyArray<[RouteKind, string]> = [
  ['normal', 'Normal starters'],
  ['counterHit', 'Counter hit'],
  ['lowParry', 'Low parry'],
];

export interface GeneratorPanelProps {
  /** Characters currently selected in the editor (used as defaults). */
  character: string;
  partner: string;
  onUse: (combo: GeneratedCombo, team: { point: string; partner: string }) => void;
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

/** Builds TTT2 team combos from the bundled guide: route → TA! → TA filler → ender. */
export function GeneratorPanel({ character, partner, onUse }: GeneratorPanelProps) {
  const { library, error } = useGuideLibrary();
  const names = useMemo(() => library?.kits.map((k) => k.character).sort((a, b) => a.localeCompare(b)) ?? [], [library]);
  const pick = (name: string, fallback: number) => names.find((n) => n.toLowerCase() === name.trim().toLowerCase()) ?? names[fallback] ?? '';

  const [point, setPoint] = useState('');
  const [mate, setMate] = useState('');
  const [context, setContext] = useState<PieceContext>('open');
  const [kinds, setKinds] = useState<RouteKind[]>(['normal', 'counterHit', 'lowParry']);
  const [starter, setStarter] = useState('');
  const [pointForm, setPointForm] = useState('');
  const [partnerForm, setPartnerForm] = useState('');
  const [fillerBy, setFillerBy] = useState<Performer>('partner');
  const [enderBy, setEnderBy] = useState<Performer>('point');
  const [includeAdditional, setIncludeAdditional] = useState(false);
  const [onlyClean, setOnlyClean] = useState(false);
  const [shown, setShown] = useState(PAGE);

  // Default to the editor's team once the guide is loaded.
  useEffect(() => {
    if (!names.length) return;
    setPoint((p) => p || pick(character, 0));
    setMate((m) => m || pick(partner, 1));
  }, [names]); // eslint-disable-line react-hooks/exhaustive-deps

  const starters = useMemo(() => {
    const kit = library?.kits.find((k) => k.character === point);
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
  const result = useMemo(() => (library && point && mate && point !== mate ? generateCombos(library, options) : null), [library, key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setShown(PAGE), [key]);

  if (error) return <p className="text-sm text-red-300">{error}</p>;
  if (!library) return <p className="text-sm text-ink-400">Loading the combo guide…</p>;

  const performerOptions = (
    <>
      <option value="point">{point || 'Point character'}</option>
      <option value="partner">{mate || 'Partner'}</option>
    </>
  );
  const pointForms = formsOf(library, point);
  const partnerForms = formsOf(library, mate);
  const toggleKind = (k: RouteKind) => setKinds((current) => (current.includes(k) ? current.filter((x) => x !== k) : [...current, k]));

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-500">
        Builds combos from the bundled guide “{GUIDE_SOURCE.title}”: a route that reaches B!, then TA!, a TA filler and an ender.
        Only combinations that follow the guide’s rules are listed; each one is a suggestion until you test it in practice mode.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Team: point (starts the combo)">
          <Select value={point} onChange={(e) => { setPoint(e.target.value); setStarter(''); setPointForm(''); }}>
            {names.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </Field>
        <Field label="Team: tag-in teammate">
          <Select value={mate} onChange={(e) => { setMate(e.target.value); setPartnerForm(''); }}>
            {names.map((n) => <option key={n} value={n}>{n}</option>)}
          </Select>
        </Field>
        <Field label="Where">
          <Select value={context} onChange={(e) => setContext(e.target.value as PieceContext)}>
            <option value="open">Open ground (TA! / Ender)</option>
            <option value="wall">At the wall (Wall TA! / Wall Ender)</option>
          </Select>
        </Field>
        <Field label="Starter">
          <Select value={starter} onChange={(e) => setStarter(e.target.value)}>
            <option value="">Any starter</option>
            {starters.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="After TA!: filler by">
          <Select value={fillerBy} onChange={(e) => setFillerBy(e.target.value as Performer)}>{performerOptions}</Select>
        </Field>
        <Field label="After TA!: ender by">
          <Select value={enderBy} onChange={(e) => setEnderBy(e.target.value as Performer)}>{performerOptions}</Select>
        </Field>
        {pointForms.length > 0 && (
          <Field label={`${point} form`}>
            <Select value={pointForm || point} onChange={(e) => setPointForm(e.target.value)}>
              {pointForms.map((f) => <option key={f} value={f}>{f}</option>)}
            </Select>
          </Field>
        )}
        {partnerForms.length > 0 && (
          <Field label={`${mate} form`}>
            <Select value={partnerForm || mate} onChange={(e) => setPartnerForm(e.target.value)}>
              {partnerForms.map((f) => <option key={f} value={f}>{f}</option>)}
            </Select>
          </Field>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {ROUTE_KINDS.map(([k, label]) => (
          <label key={k} className="flex items-center gap-1.5">
            <input type="checkbox" className="accent-red-500" checked={kinds.includes(k)} onChange={() => toggleKind(k)} />
            {label}
          </label>
        ))}
        <label className="flex items-center gap-1.5">
          <input type="checkbox" className="accent-red-500" checked={includeAdditional} onChange={(e) => setIncludeAdditional(e.target.checked)} />
          Include conditional (“Additional”) options
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" className="accent-red-500" checked={onlyClean} onChange={(e) => setOnlyClean(e.target.checked)} />
          Only pieces without notation warnings
        </label>
      </div>

      {point === mate ? (
        <p className="text-sm text-amber-300">Pick two different characters.</p>
      ) : result && (
        <section aria-label="Generated combos" className="space-y-3">
          <p className="text-sm text-ink-400" role="status">
            <strong className="text-ink-100">{result.stats.valid}</strong> combos · {result.stats.routes} routes reaching B! ×{' '}
            {result.stats.fillers} TA fillers × {result.stats.enders} enders
          </p>
          {result.stats.valid === 0 && (
            <p className="text-sm text-amber-300">
              No combos for these options.
              {result.stats.routes === 0 && ` The guide has no ${point} route reaching a Bound (B!) for these starters.`}
              {result.stats.fillers === 0 && ' No TA fillers for this side/context.'}
              {result.stats.enders === 0 && ' No enders for this side/context.'}
            </p>
          )}
          <ol className="space-y-3">
            {result.combos.slice(0, shown).map((c, i) => (
              <GeneratedComboItem key={c.id} combo={c} rank={i + 1} point={point} partner={mate} onUse={(combo) => onUse(combo, { point, partner: mate })} />
            ))}
          </ol>
          {shown < result.combos.length && (
            <Button size="sm" onClick={() => setShown((n) => n + PAGE)}>
              Show more ({result.combos.length - shown} left)
            </Button>
          )}
        </section>
      )}
      <p className="text-xs text-ink-500">Source: {GUIDE_SOURCE.credits}</p>
    </div>
  );
}
