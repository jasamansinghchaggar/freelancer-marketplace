import React from 'react';
import { useAuth } from '../context/AuthContext';
import { RiGoogleFill } from "@remixicon/react";


const GoogleSignInButton: React.FC = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <button
      type="button"
      onClick={loginWithGoogle}
      className="flex items-center justify-center gap-3 w-full px-6 py-3 bg-white border-2 border-gray-200 rounded-lg text-base font-medium text-gray-700 cursor-pointer transition-all duration-200 mb-5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/20 hover:transform hover:-translate-y-0.5"
    >
      <RiGoogleFill />
      Continue with Google
    </button>
  );
};

export default GoogleSignInButton;
