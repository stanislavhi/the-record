import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (
                <div className="w-full h-screen flex items-center justify-center p-8 bg-void text-ink-low font-mono">
                    <div className="max-w-md text-center space-y-4">
                        <h1 className="text-2xl tracking-[0.3em]">RECORD CORRUPTED</h1>
                        <p className="text-xs text-ink-high/70">
                            The Void encountered an error and could not render.
                        </p>
                        <pre className="text-[10px] text-left bg-black/40 p-3 rounded border border-ink-low/30 overflow-auto max-h-48">
                            {this.state.error?.message ?? 'unknown error'}
                        </pre>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-1.5 text-xs uppercase tracking-widest border border-ink-high/40 hover:bg-ink-high/10 transition-colors rounded"
                        >
                            Reload
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
