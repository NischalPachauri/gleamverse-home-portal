import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

const AuthErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription>
        {error?.message || 'An error occurred during authentication. Please try again.'}
      </AlertDescription>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={resetErrorBoundary}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </Alert>
  );
};

const AuthErrorBoundary = ({ children, onReset }: AuthErrorBoundaryProps) => {
  return (
    <ErrorBoundary
      name="AuthComponent"
      onReset={onReset}
      fallback={({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
        <AuthErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AuthErrorBoundary;