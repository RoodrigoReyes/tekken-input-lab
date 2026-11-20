import { useId } from 'react';
import { Chip, ToggleChip } from '../../components/ui/Chip';
import { Field, Select } from '../../components/ui/Field';
import { matchesMove, moveKey, type CharacterPatterns, type MoveCount } from '../../ttt2/movePatterns';

export interface MovePatternsProps {
  character: string;
  patterns: CharacterPatterns;
  move: string;
  onMove: (move: string) => void;
}

const TOP = 8;

/** Search routes by a move landed on the fly, and the character's habits before B! to pick one from. */
export function MovePatterns({ character, patterns, move, onMove }: MovePatternsProps) {
  const id = useId();
  const query = moveKey(move);
  const chips = (label: string, list: readonly MoveCount[]) =>
    list.length > 0 && (
      <div className="flex flex-col gap-1.5">
        <span className="label-sm text-fg-muted">{label}</span>
        <div className="flex flex-wrap gap-1.5">
          {list.slice(0, TOP).map((m) => (
            <ToggleChip key={m.key} active={query !== '' && matchesMove(m.key, query)} onClick={() => onMove(query === m.key ? '' : m.move)} className="font-mono normal-case">
              {m.move} ×{m.count}
            </ToggleChip>
          ))}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      <Field label="Move landed" aside="Optional" hint={`Only ${character}'s routes that use this move before B!, from that move onward.`}>
        <Select
          id={id}
          value={patterns.moves.find((m) => query !== '' && matchesMove(m.key, query))?.move ?? ''}
          onChange={(e) => onMove(e.target.value)}
          className="font-mono"
        >
          <option value="">Any move</option>
          {patterns.moves.map((m) => (
            <option key={m.key} value={m.move}>
              {m.move} ×{m.count}
            </option>
          ))}
        </Select>
      </Field>
      {chips('Starters', patterns.starters)}
      {chips('Bound with', patterns.bounds)}
      {patterns.juggles.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="label-sm text-fg-muted">Juggles into B! used by several starters</span>
          <div className="flex flex-wrap gap-1.5">
            {patterns.juggles.slice(0, TOP).map((j) => (
              <Chip key={j.key} className="font-mono normal-case">
                {j.move} ×{j.count}
              </Chip>
            ))}
          </div>
        </div>
      )}
      {patterns.starters.length === 0 && <p className="text-sm text-fg-muted">No {character} route in the guide reaches B!.</p>}
    </div>
  );
}
