import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export type ToastTone = 'success' | 'error' | 'info';
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
  error: 'bg-danger',
};

const DURATION: Record<ToastTone, number> = { success: 3500, info: 4000, error: 10000 };

/** Bottom-center bordered surface toasts. Errors use role=alert and stay longer. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const dismiss = useCallback((id: number) => setItems((current) => current.filter((t) => t.id !== id)), []);
  const show = useCallback(
    (message: string, tone: ToastTone = 'info') => {
      const id = nextId.current++;
      setItems((current) => [...current, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), DURATION[tone]);
    },
    [dismiss],
  );
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-2 sm:px-4" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            role={t.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-[4px] border px-4 py-2 text-sm ${
              t.tone === 'error' ? 'border-danger bg-danger-surface text-fg' : 'border-line bg-surface text-fg'
            }`}
          >
            <span aria-hidden className={`size-2.5 shrink-0 rounded-full ${DOT[t.tone]}`} />
            <span className="flex-1">{t.message}</span>
            <button type="button" aria-label="Dismiss" className="text-lg leading-none text-fg-muted hover:text-fg" onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
