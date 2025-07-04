import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { auth } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in with session validation
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        const currentUser = await auth.getCurrentUser();
        
        if (currentUser && auth.validateSession()) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Session invalid, clear state
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Set up periodic session validation
    const sessionCheckInterval = setInterval(() => {
      if (isAuthenticated && !auth.validateSession()) {
        console.log('Session expired, logging out...');
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(sessionCheckInterval);
  }, [isAuthenticated]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userData = await auth.login(email, password);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userData = await auth.register(email, password);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration failed', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await auth.logout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUserPreferences = async (preferences: Partial<User['preferences']>): Promise<void> => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      const updatedUser = await auth.updateUserPreferences(user.id, preferences);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update preferences', error);
      throw error;
    }
  };

  const validateSession = (): boolean => {
    return auth.validateSession();
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUserPreferences,
    validateSession,
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