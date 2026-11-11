import { usePlayerSide } from '../../hooks/usePlayerSide';
import type { Side } from '../../render/side';
import { Segmented } from '../ui/Chip';

const OPTIONS: ReadonlyArray<{ value: Side; label: string }> = [
  { value: 'left', label: '1P · Left' },
  { value: 'right', label: '2P · Right' },
];

/** Player side for every arcade display; 2P mirrors forward/back arrows. Notation is unchanged. */
export function SideToggle({ className = '' }: { className?: string }) {
  const [side, setSide] = usePlayerSide();
  return <Segmented label="Player side" value={side} onChange={setSide} options={OPTIONS} className={className} />;
}
