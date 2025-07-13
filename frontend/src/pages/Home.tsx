import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signout();
    navigate('/signin');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-5 py-5 flex justify-between items-center">
          <h1 className="text-gray-800 text-2xl font-bold">Freelancer Marketplace</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-gray-700 block">Welcome, {user.name}!</span>
              <span className="text-gray-500 text-sm">Role: {user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white border-none px-4 py-2 rounded-md cursor-pointer font-medium transition-all duration-200 hover:bg-red-600 hover:transform hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Home;
