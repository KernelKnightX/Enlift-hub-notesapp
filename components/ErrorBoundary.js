import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log to console in development, to monitoring service in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    } else {
      // TODO: Send to error monitoring service (Sentry, etc.)
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <div className="text-center p-4 bg-white rounded shadow-sm" style={{ maxWidth: '500px' }}>
            <div className="display-1 text-danger mb-3">⚠️</div>
            <h2 className="h4 mb-3">Something went wrong</h2>
            <p className="text-muted mb-4">
              We apologize for the inconvenience. Please refresh the page or contact support if the problem persists.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                🔄 Refresh Page
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              >
                Try Again
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-start">
                <summary className="text-muted small">Error Details (Development)</summary>
                <pre className="mt-2 small text-danger" style={{ fontSize: '10px', overflow: 'auto' }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;