import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => undefined);

export function useToast(): (message: string, tone?: ToastTone) => void {
  return useContext(ToastContext);
}

const DOT: Record<ToastTone, string> = {
  success: 'bg-success',
  info: 'bg-fg-muted',
  warning: 'bg-warning',
  error: 'bg-danger',
};

/** Errors and warnings (partial success) stay until dismissed, so they cannot vanish before they are read. */
const DURATION: Record<ToastTone, number | null> = { success: 3500, info: 6000, warning: null, error: null };
/** More than this and the stack would cover the bottom of a phone screen; the oldest one goes. */
const MAX_VISIBLE = 3;

/** Bottom-center bordered surface toasts. Errors use role=alert; errors and warnings stay until dismissed. A message already on screen is not repeated. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const dismiss = useCallback((id: number) => setItems((current) => current.filter((t) => t.id !== id)), []);
  const show = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = nextId.current++;
      setItems((current) =>
        current.some((t) => t.message === message && t.tone === tone) ? current : [...current, { id, message, tone }].slice(-MAX_VISIBLE),
      );
      const duration = DURATION[tone];
      if (duration !== null) window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 sm:bottom-4 flex flex-col items-center gap-2 px-2 sm:px-4" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-lg border py-1 pr-1 pl-4 text-sm ${
              t.tone === 'error' ? 'border-danger bg-danger-surface text-fg' : t.tone === 'warning' ? 'border-warning/60 bg-surface text-fg' : 'border-line bg-surface text-fg'
            }`}
          >
            <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${DOT[t.tone]}`} />
            <span className="flex-1">{t.message}</span>
            <button type="button" aria-label="Dismiss" className="flex size-11 shrink-0 items-center justify-center rounded-lg text-lg leading-none text-fg-muted hover:bg-muted hover:text-fg" onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
