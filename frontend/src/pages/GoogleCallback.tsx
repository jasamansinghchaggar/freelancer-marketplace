import React, { useEffect } from 'react';
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        <p className="text-white font-medium">Completing Google Sign In...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
