import { useMemo, useState } from 'react';
import { CommandSequence } from './components/arcade';
import { GAMES } from './notation/games';
import { parseNotation } from './parser';
import type { GameId } from './types/notation';

/** Temporary live-preview playground (replaced by the full app in Phase 3). */
export function App() {
  const [game, setGame] = useState<GameId>('t8');
  const [text, setText] = useState('qcf+1 > uf+2,1 B! > SSL 1~b~uf+4 > f+1,2,1+2');
  const result = useMemo(() => parseNotation(text, { game }), [text, game]);

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-6">
      <h1 className="text-xl font-bold">TekkenInputLab</h1>
      <select className="rounded bg-ink-850 p-2" value={game} onChange={(e) => setGame(e.target.value as GameId)}>
        {GAMES.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      <textarea
        className="w-full rounded bg-ink-850 p-3 font-mono"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <CommandSequence result={result} />
      <ul className="text-sm text-amber-400">
        {result.diagnostics.map((d, i) => (
          <li key={i}>{d.message}</li>
        ))}
      </ul>
    </main>
  );
}
