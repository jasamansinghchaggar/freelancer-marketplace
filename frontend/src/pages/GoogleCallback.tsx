import React, { useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const error = searchParams.get('error');
        if (error) {
          console.error('Google Auth Error:', error);
          navigate('/signin?error=google_auth_failed');
          return;
        }

        const response = await authAPI.getProfile();
        const userData = response.data;
        
        if (!userData.user.profileCompleted || userData.user.role === 'guest') {
          navigate('/complete-profile');
        } else {
          navigate('/home');
        }
      } catch (error: any) {
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
