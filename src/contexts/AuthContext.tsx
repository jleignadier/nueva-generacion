import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Define types for our user and auth context
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthdate?: string;
  accountType: 'volunteer' | 'organization' | 'admin';
  isAdmin: boolean;
  organizationId?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (userData: SignupData) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
  error: string | null;
}

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  birthdate?: string;
  accountType: 'volunteer' | 'organization' | 'admin';
  organizationName?: string;
  joinOrganizationId?: string;
  adminKey?: string;
}

// Create the context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile data
          setTimeout(async () => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select(`
                  *,
                  user_roles!inner(role)
                `)
                .eq('id', session.user.id)
                .single();

              if (profile) {
                const userData: User = {
                  id: profile.id,
                  email: session.user.email!,
                  name: `${profile.first_name} ${profile.last_name}`.trim() || session.user.email!.split('@')[0],
                  firstName: profile.first_name,
                  lastName: profile.last_name,
                  phone: profile.phone,
                  birthdate: profile.birthdate,
                  accountType: profile.account_type,
                  isAdmin: profile.account_type === 'admin',
                  organizationId: profile.organization_id
                };
                setUser(userData);
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
              setError('Failed to load user profile');
            }
          }, 0);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("AuthContext: Attempting login for", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error('No user data returned');
      }
      
      // User data will be set via the auth state change listener
      // Return a placeholder that will be updated
      return {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.email!.split('@')[0],
        accountType: 'volunteer',
        isAdmin: false
      } as User;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      console.error("AuthContext: Login error:", err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (userData: SignupData): Promise<User> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("AuthContext: Attempting signup for", userData.email);
      
      // Validate admin key if admin account
      if (userData.accountType === 'admin' && userData.adminKey !== 'NGAdmin92025') {
        throw new Error('Invalid admin key');
      }
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            birthdate: userData.birthdate,
            account_type: userData.accountType,
            organization_name: userData.organizationName,
            join_organization_id: userData.joinOrganizationId
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user) {
        throw new Error('No user data returned');
      }
      
      // User data will be set via the auth state change listener
      return {
        id: data.user.id,
        email: data.user.email!,
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        accountType: userData.accountType,
        isAdmin: userData.accountType === 'admin'
      } as User;
      
    } catch (err: any) {
      const errorMessage = err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      console.error("AuthContext: Signup error:", err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          birthdate: userData.birthdate
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setUser({ ...user, ...userData });
      console.log("AuthContext: User updated");
    } catch (error) {
      console.error("Error updating user:", error);
      setError('Failed to update user profile');
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    console.log("AuthContext: User logged out");
  };

  // Context value
  const value: AuthContextType = {
    user,
    session,
    login,
    signup,
    logout,
    updateUser,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};