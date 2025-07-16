import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
// ...existing imports...
// import ComboboxDemo from '@/components/combobox-demo';
import { RiArrowLeftLine } from '@remixicon/react';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const success = await signup(name, email, password, role);
      if (success) {
        navigate('/home');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <p className="text-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-background">
      <div className="w-full max-w-[40vw] p-10">
        <h2 className="text-3xl font-semibold text-center text-foreground mb-8">Sign Up</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-muted-foreground">Full Name</label>
              <Input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 col-span-1 md:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setRole('client')}
                  className={`relative p-6 border rounded-lg cursor-pointer flex items-center justify-center
                    ${role === 'client' ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                >
                  {role === 'client' && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="text-lg font-medium text-foreground">I am a client</div>
                </div>
                <div
                  onClick={() => setRole('freelancer')}
                  className={`relative p-6 border rounded-lg cursor-pointer flex items-center justify-center
                    ${role === 'freelancer' ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
                >
                  {role === 'freelancer' && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="text-lg font-medium text-foreground">I'm a freelancer</div>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="bg-destructive/10 text-destructive px-3 py-3 rounded-lg border border-destructive/30 text-sm text-center">{error}</div>}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="relative text-center my-5">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border"></div>
          <span className="relative bg-card px-4 text-muted-foreground text-sm">or</span>
        </div>

        <GoogleSignInButton />

        <p className="text-center mt-5 text-muted-foreground">
          Already have an account? <Link to="/signin" className="text-primary font-medium hover:underline">Sign In</Link>
        </p>
      </div>
      <Link to={"/"} className='flex items-center gap-2 text-muted-foreground underline underline-offset-2'> <RiArrowLeftLine size={20} /> Go Home</Link>
    </div>
  );
};

export default SignUp;
