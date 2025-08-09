import * as React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
    <div className={twMerge('rounded-lg border border-white/10 bg-neutral/60 p-6 shadow-md backdrop-blur-sm', className)} {...rest} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...rest }) => (
    <h3 className={twMerge('mb-2 text-lg font-semibold', className)} {...rest} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...rest }) => (
    <p className={twMerge('text-sm text-white/70', className)} {...rest} />
);

export default Card;
