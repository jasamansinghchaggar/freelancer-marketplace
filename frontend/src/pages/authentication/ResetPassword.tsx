import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('No reset token provided.');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successful. Please sign in.');
      navigate('/signin');
    } catch (err) {
      console.error('Reset password error', err);
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-sm p-6 bg-card rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-4 text-foreground">Reset Password</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium text-muted-foreground">New Password</label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter new password"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="confirm" className="text-sm font-medium text-muted-foreground">Confirm Password</label>
            <Input
              type="password"
              id="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Confirm new password"
            />
          </div>
          <Button type="submit" disabled={loading} className="mt-2">
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
        <p className="text-center mt-4 text-xs text-muted-foreground">
          <Link to="/signin" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
