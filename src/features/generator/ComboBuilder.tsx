import { KIND_ORDER, type ComboPick, type PiecePools } from '../../ttt2/generator';
import { describePiece, describeRoute, optionLabel } from '../../ttt2/pieceInfo';
import type { RouteKind } from '../../ttt2/types';
import { PhaseCard, type PhaseOption } from './PhaseCard';

const KIND_GROUP: Readonly<Record<RouteKind, string>> = { normal: 'Normal', counterHit: 'Counter hit', lowParry: 'Low parry', wall: 'Wall' };

export interface ComboBuilderProps {
  pools: PiecePools;
  pick: ComboPick;
  onPick: (patch: Partial<ComboPick>) => void;
}

/** The three layers of a team combo: route up to B! → TA filler → ender. */
export function ComboBuilder({ pools, pick, onPick }: ComboBuilderProps) {
  const routes = [...pools.routes].sort((a, b) => KIND_ORDER[a.piece.routeKind ?? 'normal'] - KIND_ORDER[b.piece.routeKind ?? 'normal']);
  const routeOptions: PhaseOption[] = routes.map((r) => ({ id: r.piece.id, label: optionLabel(r), group: KIND_GROUP[r.piece.routeKind ?? 'normal'] }));
  const route = pools.routes.find((r) => r.piece.id === pick.routeId);
  const filler = pools.fillers.find((f) => f.piece.id === pick.fillerId);
  const ender = pools.enders.find((e) => e.piece.id === pick.enderId);

  return (
    <div role="group" aria-label="Combo builder" className="grid gap-3 lg:grid-cols-3">
      <PhaseCard
        step={1}
        title="Route"
        performer={pools.point}
        options={routeOptions}
        value={pick.routeId}
        onChange={(routeId) => onPick({ routeId })}
        info={route ? describeRoute(route) : []}
      />
      <PhaseCard
        step={2}
        title="TA filler"
        performer={pools.fillerCharacter}
        options={pools.fillers.map((f) => ({ id: f.piece.id, label: optionLabel(f) }))}
        value={pick.fillerId}
        onChange={(fillerId) => onPick({ fillerId })}
        info={filler ? describePiece(filler, pools.fillerCharacter) : []}
      />
      <PhaseCard
        step={3}
        title="Ender"
        performer={pools.enderCharacter}
        options={pools.enders.map((e) => ({ id: e.piece.id, label: optionLabel(e) }))}
        value={pick.enderId}
        onChange={(enderId) => onPick({ enderId })}
        info={ender ? describePiece(ender, pools.enderCharacter) : []}
      />
    </div>
  );
}
