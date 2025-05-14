
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

type User = {
  id: string;
  name: string;
  email: string;
  accountType: 'individual' | 'organization' | 'admin';
  isAdmin: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, accountType: 'individual' | 'organization' | 'admin') => Promise<void>;
  logout: () => void;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('nuevaGen_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log("Retrieved user from localStorage:", parsedUser);
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
        localStorage.removeItem('nuevaGen_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Prevent automatic navigation from login or signup pages
  useEffect(() => {
    if (!isLoading && user && (location.pathname === '/login' || location.pathname === '/signup')) {
      console.log('Redirecting after authentication:', user.isAdmin ? 'admin' : 'dashboard');
      navigate(user.isAdmin ? '/admin' : '/dashboard', { replace: true });
    }
  }, [isLoading, user, location.pathname, navigate]);

  // Mock login function - In a real app, this would call an API
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any non-empty email and password works
      if (email && password) {
        // Admin login check
        if (email === 'admin@ng.org.pa' && password === 'admin123') {
          const adminUser = {
            id: 'admin-1',
            name: 'Admin User',
            email,
            accountType: 'admin' as const,
            isAdmin: true
          };
          
          setUser(adminUser);
          localStorage.setItem('nuevaGen_user', JSON.stringify(adminUser));
          console.log('Admin login successful, redirecting to /admin');
          navigate('/admin');
        } else {
          // Regular user
          const mockUser = {
            id: Math.random().toString(36).substring(2),
            name: email.split('@')[0],
            email,
            accountType: 'individual' as const,
            isAdmin: false
          };
          
          setUser(mockUser);
          localStorage.setItem('nuevaGen_user', JSON.stringify(mockUser));
          console.log('User login successful, redirecting to /dashboard');
          navigate('/dashboard');
        }
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

  const signup = async (email: string, password: string, name: string, accountType: 'individual' | 'organization' | 'admin') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any non-empty fields work
      if (email && password && name) {
        const isAdmin = accountType === 'admin';
        
        const mockUser = {
          id: Math.random().toString(36).substring(2),
          name,
          email,
          accountType,
          isAdmin
        };
        
        setUser(mockUser);
        localStorage.setItem('nuevaGen_user', JSON.stringify(mockUser));
        
        // Redirect based on account type
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
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
    console.log('Logging out user');
    setUser(null);
    localStorage.removeItem('nuevaGen_user');
    navigate('/login');
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
