import React, { useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '@/services/api';
import { toast } from 'sonner';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Dismiss the loading toast from GoogleSignInButton
        toast.dismiss('google-signin');
        
        const error = searchParams.get('error');
        if (error) {
          console.error('Google Auth Error:', error);
          navigate('/signin?error=google_auth_failed');
          return;
        }

        const response = await authAPI.getProfile();
        const userData = response.data;
        
        if (!userData.user.profileCompleted || userData.user.role === 'guest') {
          toast.success('Signed in successfully! Please complete your profile.');
          navigate('/complete-profile');
        } else {
          toast.success('Signed in successfully!');
          navigate('/home');
        }
      } catch (error: any) {
        // Dismiss the loading toast in case of error too
        toast.dismiss('google-signin');
        console.error('Callback handling error:', error);
        if (error.response?.status === 401) {
          navigate('/signin?error=auth_failed');
        } else {
          navigate('/signin?error=callback_failed');
        }
      }
    };

    handleGoogleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <p className="text-foreground font-medium">Completing Google Sign In...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
