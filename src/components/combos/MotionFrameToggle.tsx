import { useMotionFrame } from '../../hooks/useMotionFrame';

/** Tiny preview of the setting: two forward arrows, with or without the frame. */
function FramePreview({ framed }: { framed: boolean }) {
  const arrow = 'M0 -2.2 H4 V-4.6 L8 0 L4 4.6 V2.2 H0 Z';
  return (
    <svg width={30} height={16} viewBox="0 0 30 16" aria-hidden className="shrink-0">
      {framed && <rect x={0.75} y={0.75} width={28.5} height={14.5} rx={3.5} fill="none" stroke="currentColor" strokeWidth={1.5} />}
      <path d={arrow} transform="translate(5 8)" fill="currentColor" />
      <path d={arrow} transform="translate(16 8)" fill="currentColor" />
    </svg>
  );
}

/** Toggle button for the shared "frame motions" preference (qcf, cd, ff, … drawn inside a box). */
export function MotionFrameToggle({ className = '' }: { className?: string }) {
  const [framed, setFramed] = useMotionFrame();
  return (
    <button
      type="button"
      aria-pressed={framed}
      aria-label="Frame motions"
      title={framed ? 'Motions are framed — click to show bare arrows' : 'Motions are bare arrows — click to frame them'}
      onClick={() => setFramed(!framed)}
      className={`label-md flex h-[42px] items-center gap-2 rounded-[4px] border px-3 whitespace-nowrap transition-colors ${
        framed ? 'border-primary bg-primary text-on-primary' : 'border-line bg-neutral text-fg-muted hover:text-fg'
      } ${className}`}
    >
      <FramePreview framed={framed} />
      Frame motions
    </button>
  );
}
