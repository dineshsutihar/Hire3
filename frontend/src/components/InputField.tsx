import * as React from 'react';
import { twMerge } from 'tailwind-merge';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, Props>(
    ({ label, error, hint, className, disabled, required, ...rest }, ref) => {
        const base = 'h-11 w-full rounded-md border bg-white text-foreground placeholder:text-muted/60 dark:bg-white/5 dark:text-foreground dark:placeholder:text-muted/50 px-3 text-sm focus:outline-none transition shadow-sm';
        const state = error
            ? 'border-red-300 dark:border-red-500 focus:ring-2 focus:ring-red-500/60 focus:border-red-500'
            : 'border-border focus:ring-2 focus:ring-primary/60 focus:border-primary';
        const disabledCls = disabled ? 'opacity-60 cursor-not-allowed' : '';
        return (
            <label className="flex flex-col gap-1 text-sm font-medium">
                {label && (
                    <span className="text-foreground/90 dark:text-foreground/90">
                        {label}{required && <span className="ml-0.5 text-red-500" aria-hidden>*</span>}
                    </span>
                )}
                <input
                    ref={ref}
                    aria-required={required || undefined}
                    aria-invalid={!!error || undefined}
                    aria-describedby={error ? `${rest.name}-error` : hint ? `${rest.name}-hint` : undefined}
                    className={twMerge(base, state, disabledCls, className)}
                    disabled={disabled}
                    
                    {...rest}
                />
                {error ? (
                    <span id={`${rest.name}-error`} className="text-xs font-normal text-red-500 dark:text-red-400">{error}</span>
                ) : hint ? (
                    <span id={`${rest.name}-hint`} className="text-xs font-normal text-muted">{hint}</span>
                ) : null}
            </label>
        );
    }
);
InputField.displayName = 'InputField';

export default InputField;
