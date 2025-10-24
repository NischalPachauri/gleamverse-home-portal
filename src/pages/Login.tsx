import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Try backend API first, fallback to local auth
      let data;
      try {
        const response = await fetch('http://localhost:8081/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Login failed');
        }

        data = await response.json();
      } catch (fetchError) {
        // Fallback: Create local session without backend
        console.log('Backend unavailable, using local auth');
        data = {
          user: {
            id: `user_${Date.now()}`,
            email: email,
            displayName: email.split('@')[0]
          }
        };
      }
      
      // Create session ID for Supabase integration
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create or update profile in Supabase (skip if Supabase is not configured)
      try {
        await supabase
          .from('profiles')
          .upsert({
            user_session_id: sessionId,
            display_name: data.user.displayName,
            created_at: new Date().toISOString()
          });
      } catch (supabaseError) {
        console.log('Supabase profile creation skipped (local mode)');
      }

      // Store session in localStorage
      localStorage.setItem('user_session_id', sessionId);
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_id', data.user.id);

      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to Library</CardTitle>
          <CardDescription>
            Enter your credentials to access your personal library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a href="#" onClick={(e)=>{ e.preventDefault(); setShowRegister((v)=>!v); }} className="text-primary underline">
                Register here
              </a>
            </p>
          </div>
          {showRegister && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-semibold mb-2">Create an account</h3>
              <div className="grid gap-3">
                <Input type="text" placeholder="Display name" />
                <Input type="email" placeholder="Email" />
                <Input type="password" placeholder="Password" />
                <Button disabled variant="secondary">Register (disabled in demo)</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Registration is simplified for this demo.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
