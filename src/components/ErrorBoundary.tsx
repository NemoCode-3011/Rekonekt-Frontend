import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("REKÒ crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-ivory px-5 text-center text-ink">
        <span aria-hidden="true" className="h-px w-12 bg-ochre" />
        <h1 className="mt-8 font-display text-heading-l leading-tight">
          Something broke on our side.
        </h1>
        <p className="mt-4 max-w-md font-sans text-body-m text-muted">
          The page hit an unexpected problem. Reloading usually fixes it.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="h-12 bg-heritage-green px-6 font-sans text-body-s font-medium text-ivory transition-colors hover:bg-deep-forest"
          >
            Reload page
          </button>
          <a
            href="/"
            className="inline-flex h-12 items-center border border-ink/40 px-6 font-sans text-body-s transition-colors hover:border-ink"
          >
            Back to home
          </a>
        </div>
      </main>
    );
  }
}