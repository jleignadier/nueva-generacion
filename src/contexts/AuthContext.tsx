
import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  accountType: 'individual' | 'organization';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, accountType: 'individual' | 'organization') => Promise<void>;
  logout: () => void;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('nuevaGen_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login function - In a real app, this would call an API
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any non-empty email and password works
      if (email && password) {
        const mockUser = {
          id: Math.random().toString(36).substring(2),
          name: email.split('@')[0],
          email,
          accountType: 'individual' as const
        };
        
        setUser(mockUser);
        localStorage.setItem('nuevaGen_user', JSON.stringify(mockUser));
      } else {
        throw new Error('Email and password are required');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, accountType: 'individual' | 'organization') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any non-empty fields work
      if (email && password && name) {
        const mockUser = {
          id: Math.random().toString(36).substring(2),
          name,
          email,
          accountType
        };
        
        setUser(mockUser);
        localStorage.setItem('nuevaGen_user', JSON.stringify(mockUser));
      } else {
        throw new Error('All fields are required');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nuevaGen_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
