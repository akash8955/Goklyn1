import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * ErrorBoundary component that catches JavaScript errors in child components,
 * logs them, and displays a fallback UI.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error: error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  renderErrorDetails() {
    const { error, errorInfo } = this.state;
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-md text-xs overflow-auto max-h-60">
        <h4 className="font-bold mb-2">Error Details:</h4>
        <p className="text-red-600 font-mono mb-2">{error?.toString()}</p>
        <div className="text-gray-600">
          <p>Component Stack:</p>
          <pre className="whitespace-pre-wrap mt-1 p-2 bg-gray-100 rounded">
            {errorInfo?.componentStack}
          </pre>
        </div>
      </div>
    );
  }

  render() {
    const { hasError, showDetails } = this.state;
    const { children, fallback: Fallback } = this.props;
    const isDev = process.env.NODE_ENV === 'development';

    // Log the error to console in development
    if (isDev && hasError) {
      console.error('ErrorBoundary caught an error:', this.state.error);
      console.error('Component stack:', this.state.errorInfo?.componentStack);
    }

    if (hasError) {
      // If a fallback component is provided, use it
      if (Fallback) {
        return <Fallback error={this.state.error} errorInfo={this.state.errorInfo} />;
      }

      // Default error UI - Make sure this is always visible
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" style={{ minHeight: '100vh' }}>
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">
                Oops! Something went wrong
              </h2>
              <p className="mt-2 text-gray-600">
                We&apos;re sorry, but an unexpected error occurred. Our team has been notified.
              </p>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reload Page
                </button>
                
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Home
                </Link>
                
                {isDev && (
                  <button
                    type="button"
                    onClick={this.toggleDetails}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                )}
              </div>
              
              {showDetails && this.renderErrorDetails()}
              
              <p className="mt-4 text-sm text-gray-500">
                If the problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
};

export default ErrorBoundary;
