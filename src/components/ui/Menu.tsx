import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from './Button';

/** Disclosure menu: a button that shows a small list of actions; Escape or a click outside closes it. */
export function Menu({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    };
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <Button ref={trigger} aria-expanded={open} onClick={() => setOpen(!open)}>
        {label} <span aria-hidden>▾</span>
      </Button>
      {/* Hidden, not unmounted: an item's pending work (e.g. a PNG export) keeps its state after the menu closes. */}
      <div
        hidden={!open}
        className="absolute right-0 z-30 mt-1 flex min-w-44 flex-col rounded-lg border border-line-control bg-surface p-1 [&>button]:justify-start"
        onClick={() => setOpen(false)}
      >
        {children}
      </div>
    </div>
  );
}
