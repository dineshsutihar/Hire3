import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => (
    <div className={`animate-spin rounded-full border-primary/30 border-t-primary ${sizeClasses[size]} ${className}`} />
);

// Full page loading state
export const PageLoading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted text-sm animate-pulse">{message}</p>
    </div>
);

// Skeleton loading components
export const SkeletonCard: React.FC = () => (
    <div className="card-surface p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-muted/20" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted/20 rounded w-3/4" />
                <div className="h-3 bg-muted/20 rounded w-1/2" />
            </div>
        </div>
        <div className="space-y-2">
            <div className="h-3 bg-muted/20 rounded" />
            <div className="h-3 bg-muted/20 rounded w-5/6" />
        </div>
    </div>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
        ))}
    </div>
);

export default LoadingSpinner;
