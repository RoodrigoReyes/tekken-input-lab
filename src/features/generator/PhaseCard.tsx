import { useId, useState, type ReactNode } from 'react';
import { Select } from '../../components/ui/Field';
import type { InfoLine } from '../../ttt2/pieceInfo';

export interface PhaseOption {
  id: string;
  label: string;
  /** Options sharing a group are shown under one <optgroup>. */
  group?: string;
}

export interface PhaseCardProps {
  step: number;
  /** Phase name, also the dropdown's accessible name ("Route", "TA filler", "Ender"). */
  title: string;
  /** Who performs this phase. */
  performer: string;
  options: readonly PhaseOption[];
  value: string;
  onChange: (id: string) => void;
  info: readonly InfoLine[];
  children?: ReactNode;
}

function groupsOf(options: readonly PhaseOption[]): Array<{ group?: string; options: PhaseOption[] }> {
  return options.reduce<Array<{ group?: string; options: PhaseOption[] }>>((acc, option) => {
    const last = acc[acc.length - 1];
    return last && last.group === option.group
      ? [...acc.slice(0, -1), { ...last, options: [...last.options, option] }]
      : [...acc, { group: option.group, options: [option] }];
  }, []);
}

const STEP_BUTTON = 'label-md flex size-11 shrink-0 items-center justify-center rounded-lg border border-line-control bg-muted text-fg hover:bg-line-strong active:bg-neutral disabled:cursor-not-allowed disabled:opacity-40';

/** One layer of a team combo: pick a piece from a dropdown (or step through them) and read what it is. */
export function PhaseCard({ step, title, performer, options, value, onChange, info, children }: PhaseCardProps) {
  const selectId = useId();
  const infoId = useId();
  const [more, setMore] = useState(false);
  const warned = info.some((line) => line.tone === 'warning');
  const index = options.findIndex((o) => o.id === value);
  const go = (delta: number) => {
    const next = options[(index + delta + options.length) % options.length];
    if (next) onChange(next.id);
  };
  const single = options.length < 2;
  return (
    <section aria-label={`Phase ${step}: ${title}`} className="flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:p-4">
      <header className="flex items-baseline justify-between gap-2">
        <h3 className="label-md flex items-center gap-2 text-fg">
          <span className="flex size-6 items-center justify-center rounded-sm border border-line-control bg-muted text-sm font-bold text-fg">{step}</span>
          <label htmlFor={selectId}>{title}</label>
        </h3>
        <span className="label-sm text-fg-muted">
          {performer} · {index + 1}/{options.length}
        </span>
      </header>
      <div className="flex items-center gap-1.5">
        <button type="button" className={STEP_BUTTON} onClick={() => go(-1)} disabled={single} aria-label={`Previous ${title.toLowerCase()}`}>
          ‹
        </button>
        <Select id={selectId} value={value} onChange={(e) => onChange(e.target.value)} className="min-w-0 font-mono text-sm">
          {groupsOf(options).map((g, i) =>
            g.group ? (
              <optgroup key={g.group} label={g.group}>
                {g.options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ) : (
              g.options.map((o) => (
                <option key={`${i}-${o.id}`} value={o.id}>
                  {o.label}
                </option>
              ))
            ),
          )}
        </Select>
        <button type="button" className={STEP_BUTTON} onClick={() => go(1)} disabled={single} aria-label={`Next ${title.toLowerCase()}`}>
          ›
        </button>
      </div>
      {children}
      {/* Phones: one summary line that unfolds the sheet; from sm up the sheet is always shown. */}
      {info.length > 0 && (
        <button
          type="button"
          aria-expanded={more}
          aria-controls={infoId}
          onClick={() => setMore(!more)}
          className={`flex min-h-11 items-center gap-2 text-left text-sm sm:hidden ${warned ? 'text-warning' : 'text-fg-muted'}`}
        >
          <span className="min-w-0 flex-1 truncate">
            {warned && '⚠ '}
            {info.map((line) => line.value).join(' · ')}
          </span>
          <span aria-hidden>{more ? '▴' : '▾'}</span>
        </button>
      )}
      <dl id={infoId} aria-label={`About this ${title.toLowerCase()}`} className={`${more ? 'grid' : 'hidden'} grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm sm:grid`}>
        {info.map((line, i) => (
          <div key={`${line.label}-${i}`} className="contents">
            <dt className={`label-sm leading-5 ${line.tone === 'warning' ? 'text-warning' : 'text-fg-muted'}`}>
              {line.tone === 'warning' && <span aria-hidden>⚠ </span>}
              {line.label}
            </dt>
            <dd className={`break-words ${line.tone === 'warning' ? 'text-warning' : 'text-fg'}`}>{line.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
