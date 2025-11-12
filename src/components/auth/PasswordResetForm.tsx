import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PasswordResetFormProps {
  onBack: () => void;
  onClose: () => void;
}

export function PasswordResetForm({ onBack, onClose }: PasswordResetFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{email?: string; general?: string}>({});
  const { resetPassword } = useAuth();

  const validateForm = () => {
    const newErrors: {email?: string} = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
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
      await resetPassword(email);
      setIsSuccess(true);
      setErrors({});
    } catch (error: unknown) {
      setErrors({
        general: (error as Error).message || 'Failed to send reset email. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          className="mr-2" 
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
      </div>

      {isSuccess ? (
        <div className="space-y-4">
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Password reset email sent! Check your inbox for instructions.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground">
            If you don't see the email, please check your spam folder.
          </p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}