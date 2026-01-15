import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, Info, X, AlertTriangle } from 'lucide-react';

export interface ToastMessage {
    id: string;
    type?: 'success' | 'error' | 'info' | 'warning';
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

const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50 dark:bg-green-900/30',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        titleColor: 'text-green-800 dark:text-green-200',
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-50 dark:bg-red-900/30',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        titleColor: 'text-red-800 dark:text-red-200',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-amber-50 dark:bg-amber-900/30',
        borderColor: 'border-amber-200 dark:border-amber-800',
        iconColor: 'text-amber-600 dark:text-amber-400',
        titleColor: 'text-amber-800 dark:text-amber-200',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-50 dark:bg-blue-900/30',
        borderColor: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400',
        titleColor: 'text-blue-800 dark:text-blue-200',
    },
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
        const duration = msg.duration ?? 4000;
        const toast: ToastMessage = { id, ...msg, duration };
        setToasts(t => [...t.slice(-4), toast]);
        if (duration > 0) timers.current[id] = window.setTimeout(() => remove(id), duration);
    }, [remove]);

    React.useEffect(() => () => { Object.values(timers.current).forEach(clearTimeout); }, []);

    return (
        <ToastContext.Provider value={{ notify }}>
            {children}
            {createPortal(
                <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 items-end">
                    {toasts.map((t, index) => {
                        const config = toastConfig[t.type || 'info'];
                        const Icon = config.icon;
                        return (
                            <div
                                key={t.id}
                                role="alert"
                                aria-live="polite"
                                style={{
                                    animation: 'toast-slide-in 0.3s ease-out forwards',
                                    animationDelay: `${index * 50}ms`,
                                }}
                                className={`pointer-events-auto w-full rounded-xl border ${config.bgColor} ${config.borderColor} px-4 py-3 shadow-lg backdrop-blur-sm transform transition-all duration-300 hover:scale-[1.02]`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`flex-shrink-0 mt-0.5 ${config.iconColor}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold ${config.titleColor}`}>{t.title}</p>
                                        {t.description && (
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => remove(t.id)}
                                        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                        aria-label="Dismiss notification"
                                    >
                                        <X className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                </div>
                                {/* Progress bar */}
                                {t.duration && t.duration > 0 && (
                                    <div className="mt-2 h-1 w-full bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${config.iconColor.replace('text-', 'bg-')} rounded-full`}
                                            style={{
                                                animation: `toast-progress ${t.duration}ms linear forwards`,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>,
                document.body
            )}
            <style>{`
                @keyframes toast-slide-in {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes toast-progress {
                    from {
                        width: 100%;
                    }
                    to {
                        width: 0%;
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
