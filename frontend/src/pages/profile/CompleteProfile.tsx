import React, { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { profileAPI } from '@/services/api';
import { toast } from 'sonner';

const CompleteProfile: React.FC = () => {
  const [role, setRole] = useState('client');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!password) {
      toast.error('Password is required');
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await profileAPI.completeProfile(role, password);
      
      if (response.data.user) {
        updateUser(response.data.user);
      }
      
      toast.success('Profile completed successfully!');
      navigate('/home');

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to complete profile';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
      <div className="w-full max-w-xs sm:max-w-lg lg:max-w-2xl p-6 sm:p-8 lg:p-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-foreground mb-6 sm:mb-8">Complete Your Profile</h2>
        <p className="text-center text-muted-foreground mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
          Welcome, {user.name}! Please select your role and set a password to complete your profile.
        </p>
        <p className="text-center text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed italic">
          Setting a password allows you to sign in with your email if needed, in addition to Google authentication.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">I want to:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div
                onClick={() => setRole('client')}
                className={`relative p-4 sm:p-6 border rounded-lg cursor-pointer flex items-center justify-center transition-all duration-200
                  ${role === 'client' ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
              >
                {role === 'client' && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="text-sm sm:text-base lg:text-lg font-medium text-foreground text-center">Hire freelancers (Client)</div>
              </div>
              <div
                onClick={() => setRole('freelancer')}
                className={`relative p-4 sm:p-6 border rounded-lg cursor-pointer flex items-center justify-center transition-all duration-200
                  ${role === 'freelancer' ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
              >
                {role === 'freelancer' && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="text-sm sm:text-base lg:text-lg font-medium text-foreground text-center">Offer my services (Freelancer)</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-muted-foreground">Set Password</label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={6}
              className="text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-muted-foreground">Confirm Password</label>
            <Input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your password"
              minLength={6}
              className="text-sm sm:text-base"
            />
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
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
