import { useEffect, useRef } from 'react';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Native <dialog> confirmation (focus trap and Esc handled by the browser). */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(92vw,30rem)] rounded-xl border border-line bg-surface p-5 text-fg backdrop:bg-black/70"
    >
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-surface text-lg text-danger">
          ✕
        </span>
        <div>
          <h2 className="text-xl leading-6 font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-fg-muted">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-4">
        <Button variant="link" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
