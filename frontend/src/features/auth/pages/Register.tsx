import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { syncUserWithBackend, signUpWithBackend } from '@/services/api';
import { Lock, Mail, User, Shield, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'patient' | 'admin'>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (role === 'patient') {
      try {
        const data = await signUpWithBackend({
          email,
          password,
          full_name: `${firstName} ${lastName}`.trim() || 'Patient',
          first_name: firstName,
          last_name: lastName,
        });

        if (data.access_token) {
          await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token || '',
          });
          setLoading(false);
          navigate('/');
        } else {
          setSuccess(true);
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Registration failed.');
        setLoading(false);
      }
    } else {
      const { error: signUpErr, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
          },
        },
      });

      if (signUpErr) {
        setError(signUpErr.message);
        setLoading(false);
      } else if (data?.session) {
        try {
          if (data.user) {
            await syncUserWithBackend({
              id: data.user.id,
              email: data.user.email || email,
              role: role,
              first_name: firstName,
              last_name: lastName,
            });
          }
        } catch (syncErr) {
          console.error('Failed to sync clinician during registration:', syncErr);
        }
        setLoading(false);
        navigate('/');
      } else if (data?.user) {
        setSuccess(true);
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC] dark:bg-[#0d0c18] px-4 transition-colors duration-250">
        <div className="w-full max-w-md bg-white dark:bg-charcoal-850 border border-[#E5E5E5] dark:border-charcoal-700 p-8 text-center rounded-chosen-lg shadow-chosen-lg animate-fade-in text-left">
          <div className="h-12 w-12 bg-[#141414] dark:bg-white rounded-chosen-md flex items-center justify-center text-white dark:text-[#141414] mb-5 mx-auto shadow-chosen-sm">
            <Shield className="h-6 w-6 text-[#A27B41]" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[#0D0C18] dark:text-white mb-2 text-center">Registration Successful</h1>
          <p className="text-xs text-[#525252] dark:text-[#a3a3a3] mb-6 text-center leading-relaxed">
            We have sent a confirmation email. Please verify your email before logging in.
          </p>
          <Link to="/login" className="w-full block">
            <Button variant="primary" className="w-full py-3.5">
              Proceed to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBFC] dark:bg-[#0d0c18] px-4 py-12 transition-colors duration-250">
      <div className="w-full max-w-md bg-white dark:bg-charcoal-850 border border-[#E5E5E5] dark:border-charcoal-700 p-8 rounded-chosen-lg shadow-chosen-lg animate-fade-in text-left">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <Logo size="xl" className="mb-2" />
          <p className="text-xs text-[#525252] dark:text-[#a3a3a3] mt-1">Create an account to begin tracking motion</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#F5E6E6] border border-[#F5DBDB] rounded-chosen-md text-[#D15858] text-xs flex items-start gap-3">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              type="text"
              required
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              type="text"
              required
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-chosen-text-secondary select-none">
              I am signing up as a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={role === 'patient' ? 'primary' : 'outline'}
                onClick={() => setRole('patient')}
                leftIcon={<User className="h-4 w-4" />}
                className="w-full font-bold"
              >
                Patient
              </Button>
              <Button
                type="button"
                variant={role === 'admin' ? 'primary' : 'outline'}
                onClick={() => setRole('admin')}
                leftIcon={<Shield className="h-4 w-4" />}
                className="w-full font-bold"
              >
                Clinician
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="w-full mt-4 py-3.5"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-[#525252] dark:text-[#a3a3a3]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#A27B41] hover:underline font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
