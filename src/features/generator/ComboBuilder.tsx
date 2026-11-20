import { Checkbox } from '../../components/ui/Field';
import { KIND_ORDER, reachesBound, type ComboPick, type PiecePools } from '../../ttt2/generator';
import { describePiece, describeRoute, optionLabel } from '../../ttt2/pieceInfo';
import type { RouteKind } from '../../ttt2/types';
import { PhaseCard, type PhaseOption } from './PhaseCard';

const KIND_GROUP: Readonly<Record<RouteKind, string>> = { normal: 'Normal', counterHit: 'Counter hit', lowParry: 'Low parry', wall: 'Wall' };

export interface ComboBuilderProps {
  pools: PiecePools;
  pick: ComboPick;
  onPick: (patch: Partial<ComboPick>) => void;
  verified?: boolean;
  onVerify?: (verified: boolean) => void;
}

/** The three layers of a team combo: route up to B! → TA filler → ender (route only for a solo combo). */
export function ComboBuilder({ pools, pick, onPick, verified, onVerify }: ComboBuilderProps) {
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
      {route && !reachesBound(route) ? (
        <p role="note" className="rounded-lg border border-line bg-surface p-3 text-sm text-fg-muted sm:p-4 lg:col-span-2">
          This guide route has no B!, so it cannot lead into a Tag Assault: it is a solo combo for {pools.point}. Pick a route with B! to add a TA filler and an ender.
        </p>
      ) : (
        <>
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
          >
            {ender?.piece.id.includes('/suggested-ender/') && onVerify && (
              <>
                <Checkbox label="I tested this ender" checked={verified} onChange={(e) => onVerify(e.target.checked)} />
                <p className="text-sm text-fg-muted">Verify it with each filler; this mark only records the ender.</p>
              </>
            )}
          </PhaseCard>
        </>
      )}
    </div>
  );
}
