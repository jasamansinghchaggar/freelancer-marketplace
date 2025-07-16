import React, { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';

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
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await profileAPI.completeProfile(role, password);
      
      if (response.data.user) {
        updateUser(response.data.user);
      }
      
      navigate('/home');

    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to complete profile';
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
    <div className="flex items-center justify-center min-h-screen p-5 bg-background">
      <div className="w-full max-w-[40vw] p-10">
        <h2 className="text-3xl font-semibold text-center text-foreground mb-8">Complete Your Profile</h2>
        <p className="text-center text-muted-foreground mb-4 leading-relaxed">
          Welcome, {user.name}! Please select your role and set a password to complete your profile.
        </p>
        <p className="text-center text-muted-foreground text-sm mb-6 leading-relaxed italic">
          Setting a password allows you to sign in with your email if needed, in addition to Google authentication.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-muted-foreground">I want to:</label>
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
                <div className="text-lg font-medium text-foreground">Hire freelancers (Client)</div>
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
                <div className="text-lg font-medium text-foreground">Offer my services (Freelancer)</div>
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
            />
          </div>

          {error && <div className="bg-destructive/10 text-destructive px-3 py-3 rounded-lg border border-destructive/30 text-sm text-center">{error}</div>}

          <Button
            type="submit"
            disabled={loading}
            className="mt-2"
          >
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
