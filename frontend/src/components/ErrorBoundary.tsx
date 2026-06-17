import React, { Component, ErrorInfo, ReactNode, useCallback } from 'react';

/**
 * ErrorBoundary props for the functional-style API.
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// Thin internal class component — required by React; not a user-facing API.
interface InternalState { hasError: boolean; error: Error | null; }
class InternalBoundary extends Component<
  ErrorBoundaryProps & { onCaught: (error: Error, info: ErrorInfo) => void },
  InternalState
> {
  state: InternalState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): InternalState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error.message);
    this.props.onCaught(error, info);
  }

  handleRetry = () => this.setState({ hasError: false, error: null });

  handleCopyDetails = () => {
    const { error } = this.state;
    const details = ;
    navigator.clipboard.writeText(details).catch(() => {});
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        try { return this.props.fallback; }
        catch { return this.renderMinimal(); }
      }
      return this.renderDefault();
    }
    return this.props.children;
  }

  renderDefault(): ReactNode {
    return (
      <div style={{
        padding: 24, margin: 16, border: '1px solid #fecaca',
        borderRadius: 8, backgroundColor: '#fef2f2', color: '#991b1b',
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Something went wrong</h2>
        <p style={{ margin: '0 0 16px', fontSize: 14 }}>
          {this.state.error?.message || 'An unexpected error occurred.'}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={this.handleRetry} style={{
            padding: '8px 16px', border: 'none', borderRadius: 6,
            backgroundColor: '#991b1b', color: '#fff', cursor: 'pointer', fontSize: 14,
          }}>Try Again</button>
          <button onClick={this.handleCopyDetails} style={{
            padding: '8px 16px', border: '1px solid #991b1b', borderRadius: 6,
            backgroundColor: 'transparent', color: '#991b1b', cursor: 'pointer', fontSize: 14,
          }}>Copy Error Details</button>
        </div>
      </div>
    );
  }

  renderMinimal(): ReactNode {
    return <div style={{ padding: 16, textAlign: 'center', color: '#666' }}>
      Something went very wrong
    </div>;
  }
}

/**
 * Functional-style error boundary. Internally uses a thin class component
 * (required by React), but exposes a clean functional API.
 *
 * Usage:
 * 
 */
export function ErrorBoundary(props: ErrorBoundaryProps): JSX.Element {
  const handleCaught = useCallback((error: Error, info: ErrorInfo) => {
    // Log to telemetry
    import('../services/telemetry').then(({ logError }) => {
      logError?.(error, { componentStack: info.componentStack ?? '' });
    }).catch(() => {});
    props.onError?.(error, info);
  }, [props.onError]);

  return <InternalBoundary {...props} onCaught={handleCaught}>{props.children}</InternalBoundary>;
}

export default ErrorBoundary;
