
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="bg-slate-800 border-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-white">Something went wrong</AlertTitle>
              <AlertDescription className="text-slate-300 mt-2">
                {this.state.error?.message || 'An unexpected error occurred'}
              </AlertDescription>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="mt-4 w-full"
                variant="outline"
              >
                Reload Page
              </Button>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
