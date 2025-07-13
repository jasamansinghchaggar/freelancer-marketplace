import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profileCompleted?: boolean;
}

interface AuthContextType {
  user: User | null;
  signin: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  loginWithGoogle: () => void;
  signout: () => void;
  updateUser: (userData: User) => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      let response;
      try {
        response = await authAPI.getProfile();
        setUser(response.data.user);
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.signIn(email, password);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('signin error:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, role: string): Promise<boolean> => {
    try {
      const response = await authAPI.signUp(name, email, password, role);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const signout = async () => {
    try {
      await authAPI.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.user);
    } catch (error) {
      console.error('Refresh user failed:', error);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const loginWithGoogle = () => {
    // Redirect to backend Google Auth endpoint
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const value = {
    user,
    signin,
    signup,
    loginWithGoogle,
    signout,
    updateUser,
    refreshUser,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
