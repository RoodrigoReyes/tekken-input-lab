import { entriesForCharacter } from '../../notation/characters/dictionary';
import { Collapsible } from '../../components/ui/Collapsible';
import { EVENT_SPELLING, getDialect } from '../../notation/dialects';
import { getGame } from '../../notation/games';
import { availabilityOf, MECHANICS, MECHANIC_WORDS } from '../../notation/mechanics';
import type { GameId } from '../../types/notation';

const OPERATORS: ReadonlyArray<[string, string]> = [
  ['+', 'pressed together (df+1, 1+2)'],
  [',', 'next input'],
  ['~', 'immediately / rapid transition'],
  [':', 'just frame'],
  ['<', 'delayed (also ,<)'],
  ['*', 'hold (also uppercase direction: F, DF)'],
  ['>', 'next combo stage'],
  ['[ ]', 'optional part'],
  ['( )', 'note'],
  ['x3', 'repeat'],
  ['WS FC BT CH H.', 'state prefixes (WS4, FC df+1, H.2+3)'],
];

function mark(status: string): string {
  return status === 'yes' ? '✓' : status === 'no' ? '✗' : '!';
}

export function NotationReference({ game, dialect, characters }: { game: GameId; dialect: string; characters: readonly string[] }) {
  const d = getDialect(dialect);
  const events = Object.entries(d.events);
  const words = Object.values(MECHANIC_WORDS);
  const entries = characters.flatMap((c) => entriesForCharacter(game, c).map((e) => ({ ...e, who: c })));
  return (
    <Collapsible title={`Help & notation reference: ${getGame(game).name}`} storageKey="editor-reference" className="text-sm" bodyClassName="grid gap-5 md:grid-cols-3">
        <section>
          <h3 className="label-md mb-2 text-fg-muted">Operators</h3>
          <dl className="space-y-0.5">
            {OPERATORS.map(([op, text]) => (
              <div key={op} className="flex gap-2">
                <dt className="w-24 shrink-0 font-mono text-fg">{op}</dt>
                <dd className="text-fg-muted">{text}</dd>
              </div>
            ))}
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-mono text-fg">;</dt>
              <dd className="text-fg-muted">{d.semicolon === 'tagAssault' ? 'Tag Assault (this dialect)' : 'character section break'}</dd>
            </div>
          </dl>
        </section>
        <section>
          <h3 className="label-md mb-2 text-fg-muted">Events &amp; mechanics</h3>
          <ul className="space-y-0.5">
            {events.map(([abbr, mech]) => {
              const a = availabilityOf(mech, game);
              return (
                <li key={abbr} className={a.status === 'no' ? 'text-fg-muted line-through' : 'text-fg'} title={a.status === 'yes' ? '' : a.message}>
                  <span className="mr-1 inline-block w-4">{mark(a.status)}</span>
                  <span className="font-mono">{EVENT_SPELLING[abbr] ?? `${abbr}!`}</span> {MECHANICS[mech].label}
                </li>
              );
            })}
            {words.map((w) => {
              const a = availabilityOf(w.mechanic, game);
              return (
                <li key={w.abbr} className={a.status === 'no' ? 'text-fg-muted line-through' : 'text-fg'} title={a.status === 'yes' ? '' : a.message}>
                  <span className="mr-1 inline-block w-4">{mark(a.status)}</span>
                  <span className="font-mono">{w.abbr}</span> {MECHANICS[w.mechanic].label}
                </li>
              );
            })}
            {getGame(game).tag && (
              <li className="text-fg">
                <span className="mr-1 inline-block w-4">✓</span>
                <span className="font-mono">5</span> TAG button
              </li>
            )}
          </ul>
        </section>
        <section>
          <h3 className="label-md mb-2 text-fg-muted">Character notation</h3>
          {entries.length === 0 ? (
            <p className="text-fg-muted">Select a character to see named moves and stances.</p>
          ) : (
            <ul className="space-y-0.5">
              {entries.map((e) => (
                <li key={`${e.who}-${e.abbr}`} className="text-fg">
                  <span className="font-mono">{e.abbr}</span> {e.label}
                  <span className="text-fg-muted"> · {e.kind === 'named' ? 'move' : 'stance'}{characters.length > 1 ? ` · ${e.who}` : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
    </Collapsible>
  );
}
