import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type Tone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => undefined);

export function useToast(): (message: string, tone?: Tone) => void {
  return useContext(ToastContext);
}

const TONES: Record<Tone, string> = {
  success: 'border-emerald-700 bg-emerald-950 text-emerald-100',
  error: 'border-red-700 bg-red-950 text-red-100',
  info: 'border-ink-700 bg-ink-850 text-ink-100',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const show = useCallback((message: string, tone: Tone = 'info') => {
    const id = nextId.current++;
    setItems((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setItems((current) => current.filter((t) => t.id !== id)), 3500);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`pointer-events-auto rounded-lg border px-4 py-2 text-sm shadow-lg ${TONES[t.tone]}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
