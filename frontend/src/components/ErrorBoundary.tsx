import React from 'react';
import Button from './Button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[60vh] flex items-center justify-center p-4">
                    <div className="max-w-md w-full card-surface p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                        <p className="text-muted text-sm mb-6">
                            We encountered an unexpected error. Please try refreshing the page or going back to the home page.
                        </p>
                        {this.state.error && (
                            <details className="text-left mb-6 p-3 bg-muted/10 rounded-lg">
                                <summary className="text-xs font-medium cursor-pointer text-muted">
                                    Error details
                                </summary>
                                <pre className="mt-2 text-xs text-red-500 overflow-auto max-h-32">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={this.handleReset} className="gap-2">
                                <RefreshCw size={16} /> Try Again
                            </Button>
                            <Button onClick={() => window.location.href = '/'} className="gap-2">
                                <Home size={16} /> Go Home
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Empty state component for lists
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {icon && (
            <div className="h-16 w-16 rounded-full bg-muted/10 text-muted flex items-center justify-center mb-4">
                {icon}
            </div>
        )}
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        {description && <p className="text-sm text-muted mb-4 max-w-sm">{description}</p>}
        {action && (
            <Button onClick={action.onClick} size="sm">
                {action.label}
            </Button>
        )}
    </div>
);

// 404 Not Found component
export const NotFound: React.FC = () => (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
            <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
            <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
            <p className="text-muted mb-6">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Button onClick={() => window.location.href = '/'} className="gap-2">
                <Home size={16} /> Back to Home
            </Button>
        </div>
    </div>
);

export default ErrorBoundary;
