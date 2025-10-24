import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      // Error is already handled by signIn method with toast
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signUp(registerEmail, registerPassword, registerName);
      toast.success('Account created! Please check your email to verify.');
      setShowRegister(false);
    } catch (error) {
      console.error('Register error:', error);
      // Error is already handled by signUp method with toast
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
              <form onSubmit={handleRegister} className="grid gap-3">
                <Input 
                  type="text" 
                  placeholder="Display name" 
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required 
                />
                <Input 
                  type="email" 
                  placeholder="Email" 
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required 
                />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required 
                />
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating account...' : 'Register'}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
