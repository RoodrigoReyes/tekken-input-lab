import type { GameId } from '../../types/notation';
import type { DialectId } from '../dialects';
import type { MechanicId } from '../mechanics';

export interface GameConfig {
  id: GameId;
  name: string;
  shortName: string;
  /** Playable characters (alphabetical). Users may still type characters not listed. */
  roster: readonly string[];
  defaultDialect: DialectId;
  /** The juggle extender used by this game (at most one per combo). */
  extender: MechanicId;
  /** Two-character team game. */
  tag: boolean;
}
