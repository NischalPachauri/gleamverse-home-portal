import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const auth = useAuth();
  const { verifyOtp } = auth;
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const verifyToken = async () => {
      console.log('Starting token verification');
      const query = new URLSearchParams(location.search);
      const token = query.get('token');
      const email = query.get('email');

      console.log('Token:', token);
      console.log('Email:', email);

      if (!token || !email) {
        console.error('Invalid verification link: missing token or email');
        if (isMounted) {
          setError('Invalid verification link');
          setLoading(false);
        }
        return;
      }

      try {
        console.log('Calling verifyOtp with:', { email, token });
        await verifyOtp(email, token);
        console.log('verifyOtp completed without error');
        if (isMounted) {
          console.log('Setting timeout for navigation');
          setTimeout(() => navigate('/profile'), 2000);
        }
      } catch (error) {
        console.error('OTP verification failed:', error);
        if (isMounted) {
          setError('Failed to verify email. Please try again.');
        }
      } finally {
        console.log('Finishing verification process');
        if (isMounted) setLoading(false);
      }
    };

    verifyToken();
    return () => { isMounted = false; };
  }, [verifyOtp, navigate, location.search]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        {loading ? (
          <p>Verifying...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <p>Verification successful! Redirecting...</p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
