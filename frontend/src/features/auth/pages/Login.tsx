import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { loginWithBackend } from '@/services/api';
import { Lock, Mail, AlertCircle, User, Shield } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

const Login: React.FC = () => {
  const { signInMock } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginWithBackend({ email, password });
      if (data.access_token) {
        await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token || '',
        });
        navigate('/');
      } else {
        setError('Login failed. No session token returned.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Use Sandbox Mode below.');
      setLoading(false);
    }
  };

  const handleSandboxLogin = async (role: 'admin' | 'patient') => {
    if (role === 'admin') {
      await signInMock('admin', 'demo.clinician@chosenmotion.com', 'Marcus', 'Aurelius');
    } else {
      await signInMock('patient', 'demo.patient@chosenmotion.com', 'Sarah', 'Connor');
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC] dark:bg-[#0d0c18] px-4 transition-colors duration-250">
      <div className="w-full max-w-md bg-white dark:bg-charcoal-850 border border-[#E5E5E5] dark:border-charcoal-700 p-8 rounded-chosen-lg shadow-chosen-lg animate-fade-in text-left">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <Logo size="xl" className="mb-2" />
          <p className="text-xs text-[#525252] dark:text-[#a3a3a3] mt-1">Sign in to your patient or clinician account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#F5E6E6] border border-[#F5DBDB] rounded-chosen-md text-[#D15858] text-xs flex items-start gap-3">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4 text-charcoal-400" />}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4 text-charcoal-400" />}
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="w-full mt-2 py-3.5"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-[#525252] dark:text-[#a3a3a3]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#A27B41] hover:underline font-bold transition-colors">
            Create an Account
          </Link>
        </div>

        {/* Sandbox Dev Mode Bypass */}
        <div className="mt-6 pt-6 border-t border-[#E5E5E5] dark:border-charcoal-800">
          <div className="text-center text-[10px] font-bold tracking-widest text-[#a3a3a3] uppercase mb-4">
            Sandbox / Demo Mode
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSandboxLogin('patient')}
              leftIcon={<User className="h-3.5 w-3.5 text-[#A27B41]" />}
              className="w-full py-2.5 font-bold"
            >
              Demo Patient
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSandboxLogin('admin')}
              leftIcon={<Shield className="h-3.5 w-3.5 text-[#A27B41]" />}
              className="w-full py-2.5 font-bold"
            >
              Demo Clinician
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
