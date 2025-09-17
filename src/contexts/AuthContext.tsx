import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useOrganizationsStore } from '@/store/organizationsStore';

type User = {
  id: string;
  name: string;
  email: string;
  accountType: 'individual' | 'organization' | 'admin';
  isAdmin: boolean;
  organizationId?: string;
  profilePicture?: string;
};

type OrganizationInfo = {
  organizationId: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (
    email: string, 
    password: string, 
    name: string, 
    accountType: 'individual' | 'organization' | 'admin',
    orgInfo?: OrganizationInfo,
    description?: string
  ) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addOrganization, initializeOrganizations } = useOrganizationsStore();

  // Load user on initial render only
  useEffect(() => {
    console.log("AuthProvider: Initial load");
    try {
      const savedUser = localStorage.getItem('nuevaGen_user');
      if (savedUser) {
        console.log("AuthProvider: Found user in localStorage");
        setUser(JSON.parse(savedUser));
      }
      // Initialize organizations store
      initializeOrganizations();
    } catch (err) {
      console.error("Error loading user from localStorage:", err);
      localStorage.removeItem('nuevaGen_user');
    } finally {
      setIsLoading(false);
    }
  }, [initializeOrganizations]);

  const login = async (email: string, password: string) => {
    console.log("AuthContext: Attempting login with", email);
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
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
        console.log("AuthContext: Admin login successful");
        toast({
          title: "Login Successful",
          description: "Welcome back, Admin!",
        });
        return adminUser;
      }
      
      // Organization login check
      if (email === 'org@greenfuture.org' && password === 'org123') {
        const orgUser = {
          id: 'org-1',
          name: 'Green Future Foundation',
          email,
          accountType: 'organization' as const,
          isAdmin: false,
          organizationId: '1'
        };
        
        setUser(orgUser);
        localStorage.setItem('nuevaGen_user', JSON.stringify(orgUser));
        console.log("AuthContext: Organization login successful");
        toast({
          title: "Login Successful",
          description: "Welcome back, Green Future Foundation!",
        });
        return orgUser;
      }
      
      // Regular user login - simplified for demo
      const mockUser = {
        id: Math.random().toString(36).substring(2),
        name: email.split('@')[0],
        email,
        accountType: 'individual' as const,
        isAdmin: false
      };
      
      setUser(mockUser);
      localStorage.setItem('nuevaGen_user', JSON.stringify(mockUser));
      console.log("AuthContext: User login successful");
      toast({
        title: "Login Successful",
        description: `Welcome back, ${mockUser.name}!`,
      });
      return mockUser;
      
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'Failed to login');
      toast({
        title: "Login Failed",
        description: err.message || "Please check your credentials and try again",
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    accountType: 'individual' | 'organization' | 'admin',
    orgInfo?: OrganizationInfo,
    description?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }
      
      const isAdmin = accountType === 'admin';
      
      const mockUser = {
        id: Math.random().toString(36).substring(2),
        name,
        email,
        accountType,
        isAdmin,
        ...(orgInfo && { organizationId: orgInfo.organizationId })
      };
      
      setUser(mockUser);
      localStorage.setItem('nuevaGen_user', JSON.stringify(mockUser));
      
      // If this is an organization account, also save organization info
      if (accountType === 'organization' && description) {
        addOrganization({
          name,
          contactEmail: email,
          description,
          status: 'Activo',
          points: 0,
          members: 1
        });
      }

      const successMessage = orgInfo 
        ? "Your account has been created and you've been added to the organization!"
        : "Your account has been created successfully!";
        
      toast({
        title: "Account Created",
        description: successMessage,
      });
      
      return mockUser;
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || 'Failed to sign up');
      toast({
        title: "Signup Failed",
        description: err.message || "Please check your information and try again",
        variant: "destructive"
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('nuevaGen_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    console.log("AuthContext: Logging out");
    setUser(null);
    localStorage.removeItem('nuevaGen_user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUser, error }}>
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
