import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, LinkButton } from './ui/Button';
import { Panel } from './ui/Panel';

interface ErrorBoundaryProps {
  /** What failed, e.g. "the generator". */
  what: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Keeps a failed lazy page (e.g. chunk load error offline) from unmounting the whole app. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`Failed to render ${this.props.what}`, error, info.componentStack);
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <Panel className="flex flex-col items-center gap-3 px-6 py-[58px] text-center">
        <p role="alert" className="text-2xl font-bold text-danger uppercase">
          Could not load {this.props.what}
        </p>
        <p className="max-w-md text-sm text-fg-muted">{this.state.error.message}. Check your connection and reload the page.</p>
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload
          </Button>
          <LinkButton href="#/">Back to home</LinkButton>
        </div>
      </Panel>
    );
  }
}
