import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from 'lucide-react';
import { RiArrowLeftLine } from '@remixicon/react';
import { toast } from 'sonner';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  React.useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  React.useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      switch (urlError) {
        case 'google_auth_failed':
          toast.error('Google authentication failed. Please try again.');
          break;
        case 'auth_failed':
          toast.error('Authentication failed. Please try again.');
          break;
        case 'callback_failed':
          toast.error('Authentication callback failed. Please try again.');
          break;
        default:
          toast.error('An error occurred during authentication.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await signin(email, password);
      if (success) {
        toast.success('Signed in successfully!');
        navigate('/home');
      } else {
        toast.error('Invalid email or password');
        setError('Invalid email or password');
      }
    } catch (err) {
      toast.error('An error occurred during login');
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-border border-t-foreground rounded-full animate-spin"></div>
          <p className="text-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md p-6 sm:p-8 lg:p-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-foreground mb-6 sm:mb-8">Sign In</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="text-sm sm:text-base"
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
                className="text-sm sm:text-base pr-10"
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

          {error && (
            <div className="bg-destructive/10 text-destructive px-3 py-3 rounded-lg border border-destructive/30 text-xs sm:text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 text-sm sm:text-base"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative text-center my-4 sm:my-5">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border"></div>
          <span className="relative bg-card px-4 text-muted-foreground text-xs sm:text-sm">or</span>
        </div>

        <GoogleSignInButton />

        <p className="text-center mt-4 sm:mt-5 text-xs sm:text-sm text-muted-foreground">
          Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign Up</Link>
        </p>
      </div>
      <Link to={"/"} className='flex items-center gap-2 text-muted-foreground underline underline-offset-2 text-sm sm:text-base'> 
        <RiArrowLeftLine size={20}/> Go Home
      </Link>
    </div>
  );
};

export default SignIn;
