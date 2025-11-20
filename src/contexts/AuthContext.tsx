import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Use centralized Supabase client configured via environment variables

interface SupabaseError extends Error {
  error_description?: string;
  status?: number;
}

// Key rotation is not managed client-side; use environment config

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  verifyOtp: (email: string, token: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  signUp: async () => null,
  signIn: async () => null,
  verifyOtp: async () => null,
  signOut: async () => { },
  resetPassword: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this effect runs only once

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      // Validate inputs before submission
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        // Detailed error logging
        console.error('Sign up API error:', {
          status: error.status,
          name: error.name,
          message: error.message,
          details: (error as { details?: string })?.details
        });
        throw error;
      }

      // Log successful registration
      console.log('Registration successful for:', email);
      toast.success('Registration successful! Please check your email to verify your account.');
      return data.user;
    } catch (error: unknown) {
      const supabaseError = error as SupabaseError;
      // Enhanced error logging with structured data
      console.error('Sign up error:', {
        message: supabaseError.message,
        description: supabaseError.error_description,
        status: supabaseError.status,
        stack: supabaseError.stack
      });

      // User-friendly error messages
      if (supabaseError.message?.includes('API key')) {
        toast.error('Authentication service unavailable. Please try again later.');
      } else {
        toast.error(supabaseError.error_description || supabaseError.message || 'Failed to create account');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    console.log('Verifying OTP for email:', email, 'with token:', token);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      console.log('verifyOtp full response:', { data, error });

      if (error) throw error;

      setUser(data.user || null);
      return data.user;
    } catch (error) {
      console.error('OTP verification failed:', error);
      let message = 'An unknown error occurred';
      if (error instanceof Error) message = error.message;
      else if (typeof error === 'string') message = error;
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Validate inputs
      if (!email || !password) {
        toast.error('Email and password are required');
        return null;
      }

      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          toast.error('Please verify your email before signing in');
        } else if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          throw error;
        }
        return null;
      }

      // Store authentication in localStorage as fallback
      try {
        localStorage.setItem('auth_fallback_user', JSON.stringify(data.user));
      } catch (storageError) {
        console.warn('Failed to store auth data in localStorage:', storageError);
      }

      toast.success('Signed in successfully!');
      setUser(data.user);
      return data.user;
    } catch (error: unknown) {
      const supabaseError = error as SupabaseError;
      console.error('Sign in error:', supabaseError);

      // Detailed error handling with specific user messages
      if (supabaseError.status === 429) {
        toast.error('Too many sign-in attempts. Please try again later.');
      } else if (supabaseError.status >= 500) {
        toast.error('Authentication service is currently unavailable. Please try again later.');
      } else {
        toast.error(supabaseError.error_description || supabaseError.message || 'Invalid email or password');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any local auth data
      try {
        localStorage.removeItem('auth_fallback_user');
      } catch (storageError) {
        console.warn('Failed to clear local auth data:', storageError);
      }

      setUser(null);
      toast.success('Signed out successfully');
    } catch (error: unknown) {
      const supabaseError = error as SupabaseError;
      console.error('Sign out error:', supabaseError);
      toast.error(supabaseError.error_description || supabaseError.message || 'Failed to sign out');

      // Force sign out on client side even if API call fails
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);

      // Validate email
      if (!email || !email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: unknown) {
      const supabaseError = error as SupabaseError;
      console.error('Password reset error:', supabaseError);

      // Specific error messages based on error type
      if (supabaseError.status === 429) {
        toast.error('Too many password reset attempts. Please try again later.');
      } else if (supabaseError.status >= 500) {
        toast.error('Service temporarily unavailable. Please try again later.');
      } else if (supabaseError.message?.includes('User not found')) {
        // Don't reveal if email exists for security reasons
        toast.success('If your email exists in our system, you will receive reset instructions.');
      } else {
        const errorMessage = supabaseError.message || 'Error sending password reset email. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signUp,
    verifyOtp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
