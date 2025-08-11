import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none ring-offset-neutral',
    {
        variants: {
            variant: {
                default: 'bg-primary hover:bg-primary/90 text-white',
                secondary: 'bg-secondary hover:bg-secondary/90 text-white',
                outline: 'border border-primary text-primary hover:bg-primary/10 dark:bg-neutral-900 dark:text-primary dark:border-primary dark:hover:bg-primary/20',
                ghost: 'hover:bg-white/10 text-white'
            },
            size: {
                sm: 'h-8 px-3',
                md: 'h-10 px-4',
                lg: 'h-12 px-6 text-base'
            }
        },
        defaultVariants: { variant: 'default', size: 'md' }
    }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={twMerge(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export default Button;
