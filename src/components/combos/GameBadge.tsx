import { getGame } from '../../notation/games';
import type { GameId } from '../../types/notation';

/** Game badge: border-strong fill, 2px radius, mono label (chrome stays neutral; no per-game colors). */
export function GameBadge({ game }: { game: GameId }) {
  return (
    <span className="label-sm inline-flex rounded-sm border border-line bg-line-strong px-1.5 py-0.5 text-fg" title={getGame(game).name}>
      {getGame(game).shortName}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return <span className="label-sm rounded-sm bg-muted px-1.5 py-0.5 text-fg-muted uppercase">{difficulty}</span>;
}
