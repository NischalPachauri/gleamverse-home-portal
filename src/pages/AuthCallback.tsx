import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setMessage('Failed to verify your account. Please try again.');
          return;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Account verified successfully! Welcome to GleamVerse.');
          
          // Redirect to home page after 2 seconds
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('No session found. Please try signing in again.');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleRetry = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
            <h1 className="text-2xl font-bold text-foreground">Verifying Account</h1>
            <p className="text-muted-foreground">
              Please wait while we verify your account...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Account Verified!</h1>
            <p className="text-muted-foreground">
              {message}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the home page...
            </p>
            <Button onClick={handleGoHome} className="mt-4">
              Go to Home
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
            <p className="text-muted-foreground">
              {message}
            </p>
            <div className="space-y-2">
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="w-full">
                Go to Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

