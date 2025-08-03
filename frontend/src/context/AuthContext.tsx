import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI, profileAPI } from '../services/api';
import { generateKeyPair, loadKeyPair, saveKeyPair } from '../utils/crypto';

const backendUrl = import.meta.env.VITE_API_BASE_URL

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
    window.location.href = `${backendUrl}/auth/google`;
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

  useEffect(() => {
    if (!loading && user) {
      const existing = loadKeyPair();
      const uploadKey = async (publicKey: string) => {
        try {
          await profileAPI.setPublicKey(publicKey);
        } catch (err) {
          console.error('Failed to set public key:', err);
        }
      };
      if (!existing) {
        const { publicKey, secretKey } = generateKeyPair();
        saveKeyPair({ publicKey, secretKey });
        if (user.profileCompleted) uploadKey(publicKey);
      }
    }
  }, [loading, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
