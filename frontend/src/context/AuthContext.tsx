import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authAPI } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName?: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('omega_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('omega_token');
      if (savedToken) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
          setToken(savedToken);
        } catch {
          // Token is expired or invalid
          localStorage.removeItem('omega_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authAPI.login({ email, password: pass });
      localStorage.setItem('omega_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.full_name || res.user.email}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const res = await authAPI.register({ email, password: pass, full_name: fullName });
      localStorage.setItem('omega_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      showToast('Registration successful! Welcome to OMEGA.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async () => {
    setIsLoading(true);
    try {
      const res = await authAPI.loginDemo();
      localStorage.setItem('omega_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
      showToast('Logged in as Demo User.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Demo login failed';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('omega_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginDemo,
        logout,
      }}
    >
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
