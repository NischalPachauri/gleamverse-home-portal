import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginFormProps {
  onToggleMode: () => void;
  onForgotPassword: () => void;
  onClose: () => void;
}

export function LoginForm({ onToggleMode, onForgotPassword, onClose }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string; general?: string}>({});
  const { signIn, resetPassword } = useAuth();

  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signIn(email, password);
      onClose();
    } catch (error: any) {
      // Even though errors are handled by the auth context, we can provide more specific UI feedback
      setErrors({
        general: error.message || 'Failed to sign in. Please check your credentials.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onForgotPassword();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
        <p className="text-muted-foreground mt-2">Sign in to your account</p>
      </div>

      {errors.general && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({...errors, email: undefined});
            }}
            className={errors.email ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({...errors, password: undefined});
              }}
              className={errors.password ? "border-red-500" : ""}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <Button
          variant="link"
          onClick={handleForgotPassword}
          disabled={isLoading}
          className="text-sm"
        >
          Forgot your password?
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Button
            variant="link"
            onClick={onToggleMode}
            disabled={isLoading}
            className="p-0 h-auto text-sm"
          >
            Sign up
          </Button>
        </div>
      </div>
    </div>
  );
}

