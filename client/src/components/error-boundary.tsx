import React from "react";
import { APIError } from "@/components/api-error";
import { ErrorRecovery } from "@/components/error-recovery";
import { useErrorHandling } from "@/hooks/use-error-handling";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  handleRetry = async () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 space-y-4">
          <APIError 
            error={this.state.error!} 
            onRetry={this.handleRetry}
          />
          {this.props.autoRetry && (
            <ErrorRecovery
              error={this.state.error!}
              onRetry={this.handleRetry}
              maxAttempts={this.props.maxRetries}
              retryDelay={this.props.retryDelay}
            />
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook wrapper voor functionele componenten
export function useErrorBoundary(options: {
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
} = {}) {
  const { autoRetry = false, maxRetries, retryDelay } = options;
  
  const { error, handleError, reset } = useErrorHandling({
    autoRetry,
    maxRetries,
    retryDelay,
    onError: (error) => {
      console.error("Error caught by error boundary:", error);
    },
  });

  const handleRetry = async () => {
    reset();
    window.location.reload();
  };

  return {
    error,
    handleError,
    reset,
    ErrorDisplay: error ? (
      <div className="p-4 space-y-4">
        <APIError 
          error={error} 
          onRetry={handleRetry}
        />
        {autoRetry && (
          <ErrorRecovery
            error={error}
            onRetry={handleRetry}
            maxAttempts={maxRetries}
            retryDelay={retryDelay}
          />
        )}
      </div>
    ) : null,
  };
} 