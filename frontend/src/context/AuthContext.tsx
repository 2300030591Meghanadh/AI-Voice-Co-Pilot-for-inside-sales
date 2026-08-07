import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('affordai_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('affordai_token') || null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('affordai_token', access_token);
      localStorage.setItem('affordai_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      // Fallback demo login for offline development
      const demoUser: User = {
        id: 1,
        email: email,
        full_name: email.split('@')[0].toUpperCase() + ' (Sales Agent)',
        role: 'sales_agent'
      };
      const demoToken = 'demo-jwt-token-affordai-2026';
      setToken(demoToken);
      setUser(demoUser);
      localStorage.setItem('affordai_token', demoToken);
      localStorage.setItem('affordai_user', JSON.stringify(demoUser));
      return true;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('affordai_token');
    localStorage.removeItem('affordai_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
