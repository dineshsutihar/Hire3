import React from 'react';
import { createPortal } from 'react-dom';

export interface ToastMessage {
    id: string;
    type?: 'success' | 'error' | 'info';
    title: string;
    description?: string;
    duration?: number;
}

interface ToastContextValue { notify: (msg: Omit<ToastMessage, 'id'>) => void; }

const ToastContext = React.createContext<ToastContextValue | null>(null);
export const useToast = () => {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
    const timers = React.useRef<Record<string, number>>({});

    const remove = React.useCallback((id: string) => {
        setToasts(t => t.filter(x => x.id !== id));
        if (timers.current[id]) { clearTimeout(timers.current[id]); delete timers.current[id]; }
    }, []);

    const notify: ToastContextValue['notify'] = React.useCallback(msg => {
        const id = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
        const duration = msg.duration ?? 3500;
        const toast: ToastMessage = { id, ...msg, duration };
        setToasts(t => [...t.slice(-4), toast]);
        if (duration > 0) timers.current[id] = window.setTimeout(() => remove(id), duration);
    }, [remove]);

    React.useEffect(() => () => { Object.values(timers.current).forEach(clearTimeout); }, []);

    return (
        <ToastContext.Provider value={{ notify }}>
            {children}
            {createPortal(
                <div className="pointer-events-none fixed top-16 right-4 z-[100] flex w-full max-w-sm flex-col gap-3 items-end">
                    {toasts.map(t => (
                        <div key={t.id} role="status" aria-live="polite" className="pointer-events-auto rounded-md border border-border/60 bg-background/90 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/75 animate-fade-in slide-in-left">
                            <div className="flex items-start gap-3">
                                <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-primary'}`}></div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">{t.title}</p>
                                    {t.description && <p className="text-xs text-muted leading-relaxed">{t.description}</p>}
                                </div>
                                <button onClick={() => remove(t.id)} className="text-muted hover:text-foreground transition" aria-label="Dismiss">×</button>
                            </div>
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

// Minimal toast system; extend as needed.
