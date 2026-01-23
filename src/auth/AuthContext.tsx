/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ role: string } | void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored tokens and load user on mount
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const user = await authService.getCurrentUser();
          const tokensStr = localStorage.getItem('auth_tokens');
          const tokens = tokensStr ? JSON.parse(tokensStr) : null;
          
          setAuthState({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        // If loading user fails, clear auth state
        localStorage.removeItem('auth_tokens');
        setAuthState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<{ role: string } | void> => {
    try {
      const { user, tokens } = await authService.login({ email, password });
      setAuthState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
      return { role: user.role };
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignore error, clear state anyway
    }
    
    // Clear all stored tokens (both member and admin)
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    setAuthState({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<void> => {
    try {
      const { user, tokens } = await authService.register({
        email,
        password,
        password_confirm: password,
        first_name: firstName,
        last_name: lastName
      });
      setAuthState({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
