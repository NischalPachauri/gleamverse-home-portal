import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

// Primary API configuration
const primarySupabaseUrl = 'https://elddklyslvhrgmrasuay.supabase.co';
const primarySupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZGRrbHlzbHZocmdtcmFzdWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjQ1NzksImV4cCI6MjA3NjkwMDU3OX0.03Bn1B5U4k7EMvMU22wzanAZ4j3S3kW3Xn47vNIlM1Y';

// Fallback API configuration for key rotation scenarios
const fallbackSupabaseKey = localStorage.getItem('supabase_fallback_key') || primarySupabaseKey;

// Function to handle key rotation
const rotateApiKey = (newKey: string) => {
  try {
    localStorage.setItem('supabase_fallback_key', newKey);
    console.log('API key rotated successfully');
    return true;
  } catch (error) {
    console.error('Failed to rotate API key:', error);
    return false;
  }
};

// Validate API key format before initialization
if (!primarySupabaseKey || primarySupabaseKey.trim() === '') {
  console.error('Supabase API key is missing or invalid');
}

// Create Supabase client with enhanced configuration
const supabase = createClient(primarySupabaseUrl, primarySupabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'gleamverse-home-portal'
    }
  }
});

// Export key rotation function for use in error recovery
export const refreshApiKey = () => {
  // In a real implementation, this would fetch a new key from a secure source
  // For this demo, we'll just use the fallback key
  return rotateApiKey(fallbackSupabaseKey);
};

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
  signOut: async () => {},
  resetPassword: async () => {},
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
      // Log authentication attempt for debugging
      console.log(`Attempting sign up for email: ${email} with API key present: ${!!primarySupabaseKey}`);
      
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
          details: error.details
        });
        throw error;
      }
      
      // Log successful registration
      console.log('Registration successful for:', email);
      toast.success('Registration successful! Please check your email to verify your account.');
      return data.user;
    } catch (error: any) {
      // Enhanced error logging with structured data
      console.error('Sign up error:', {
        message: error.message,
        description: error.error_description,
        status: error.status,
        stack: error.stack
      });
      
      // User-friendly error messages
      if (error.message?.includes('API key')) {
        toast.error('Authentication service unavailable. Please try again later.');
      } else {
        toast.error(error.error_description || error.message || 'Failed to create account');
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
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Detailed error handling with specific user messages
      if (error.status === 429) {
        toast.error('Too many sign-in attempts. Please try again later.');
      } else if (error.status >= 500) {
        toast.error('Authentication service is currently unavailable. Please try again later.');
      } else {
        toast.error(error.error_description || error.message || 'Invalid email or password');
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
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.error_description || error.message || 'Failed to sign out');
      
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
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      // Specific error messages based on error type
      if (error.status === 429) {
        toast.error('Too many password reset attempts. Please try again later.');
      } else if (error.status >= 500) {
        toast.error('Service temporarily unavailable. Please try again later.');
      } else if (error.message?.includes('User not found')) {
        // Don't reveal if email exists for security reasons
        toast.success('If your email exists in our system, you will receive reset instructions.');
      } else {
        const errorMessage = error.message || 'Error sending password reset email. Please try again.';
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
