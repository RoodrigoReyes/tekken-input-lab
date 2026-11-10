import { getGame } from '../../notation/games';
import type { GameId } from '../../types/notation';

const COLORS: Record<GameId, string> = {
  t6: 'bg-sky-950 text-sky-200 border-sky-800',
  ttt2: 'bg-emerald-950 text-emerald-200 border-emerald-800',
  t7: 'bg-violet-950 text-violet-200 border-violet-800',
  t8: 'bg-orange-950 text-orange-200 border-orange-800',
};

export function GameBadge({ game }: { game: GameId }) {
  return (
    <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[11px] font-bold tracking-wide ${COLORS[game]}`} title={getGame(game).name}>
      {getGame(game).shortName}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const tone =
    difficulty === 'advanced' ? 'text-red-300' : difficulty === 'intermediate' ? 'text-amber-300' : 'text-emerald-300';
  return <span className={`text-xs font-semibold capitalize ${tone}`}>{difficulty}</span>;
}
