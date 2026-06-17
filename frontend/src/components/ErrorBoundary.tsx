import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/** Error boundary that catches render errors and shows a fallback UI. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[ErrorBoundary]', error.message, errorInfo.componentStack);
    if (this.props.onError) this.props.onError(error, errorInfo);
  }

  handleRetry = () => this.setState({ hasError: false, error: null, errorInfo: null });

  handleCopyDetails = () => {
    const { error, errorInfo } = this.state;
    const details = [
      'Error: ' + (error?.message || 'Unknown'),
      'Stack: ' + (error?.stack || 'N/A'),
      'Component Stack: ' + (errorInfo?.componentStack || 'N/A'),
    ].join('\n\n');
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
      <div style={{ padding: '24px', margin: '16px', border: '1px solid #fecaca', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#991b1b' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '18px' }}>Something went wrong</h2>
        <p style={{ margin: '0 0 16px', fontSize: '14px' }}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={this.handleRetry} style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', backgroundColor: '#991b1b', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>Try Again</button>
          <button onClick={this.handleCopyDetails} style={{ padding: '8px 16px', border: '1px solid #991b1b', borderRadius: '6px', backgroundColor: 'transparent', color: '#991b1b', cursor: 'pointer', fontSize: '14px' }}>Copy Error Details</button>
        </div>
      </div>
    );
  }

  renderMinimal(): ReactNode {
    return <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>Something went very wrong</div>;
  }
}

export default ErrorBoundary;
