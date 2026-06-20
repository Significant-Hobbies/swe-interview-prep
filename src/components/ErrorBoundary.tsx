import { Component, type ErrorInfo, type ReactNode } from 'react';



interface Props {
  children: ReactNode;
  /** Where this boundary sits — used for monitoring + copy. */
  scope?: 'root' | 'route' | 'playground';
  /** Optional custom fallback. Receives a reset callback. */
  fallback?: (reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Top-level React error boundary. Catches render/lifecycle crashes so a single
 * broken component never blanks the whole app. Full detail goes to the console
 * + PostHog; the user only ever sees friendly copy.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    void import('../lib/foundry-monitoring').then((m) =>
      m.captureError(error, {
        scope: this.props.scope ?? 'root',
        componentStack: info.componentStack ?? undefined,
      }),
    );
  }

  reset = () => this.setState({ hasError: false });

  override render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback(this.reset);

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-8">
        <div className="max-w-md text-center">
          <h2 className="mb-3 text-xl font-bold text-white">Something went wrong</h2>
          <p className="mb-6 text-sm text-slate-400">
            An unexpected error occurred. Your progress is saved locally — try
            again, and if it keeps happening, reload the page.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={this.reset}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-900"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.assign('/')}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-900"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
