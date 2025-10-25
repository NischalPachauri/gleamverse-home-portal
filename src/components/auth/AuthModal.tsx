import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { PasswordResetForm } from './PasswordResetForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);

  const handleToggleMode = (newMode: 'login' | 'register' | 'reset') => {
    setMode(newMode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {mode === 'login' ? 'Sign In to GleamVerse' : mode === 'register' ? 'Create Account' : 'Reset Password'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'login' 
              ? 'Sign in to access your bookmarks and reading history.' 
              : mode === 'register'
                ? 'Create a new account to start your reading journey.'
                : 'Reset your password to regain access to your account.'
            }
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          {mode === 'login' ? (
            <LoginForm 
              onToggleMode={() => handleToggleMode('register')} 
              onForgotPassword={() => handleToggleMode('reset')}
              onClose={onClose} 
            />
          ) : mode === 'register' ? (
            <RegisterForm 
              onToggleMode={() => handleToggleMode('login')} 
              onClose={onClose} 
            />
          ) : (
            <PasswordResetForm
              onBack={() => handleToggleMode('login')}
              onClose={onClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

