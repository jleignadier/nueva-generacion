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
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (userData: SignupData) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  resendConfirmation: (email: string) => Promise<void>;
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
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching with setTimeout to prevent deadlocks
          setTimeout(async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, phone, birthdate, account_type, organization_id, avatar_url')
                .eq('id', session.user.id)
                .single();

              if (profileError) {
                console.error('Error fetching profile:', profileError);
                setError('Failed to load user profile');
                setIsLoading(false);
                return;
              }

              if (profile) {
                const isAdmin = profile.account_type === 'admin';
                const userData: User = {
                  id: profile.id,
                  email: session.user.email!,
                  name: `${profile.first_name} ${profile.last_name}`.trim() || session.user.email!.split('@')[0],
                  firstName: profile.first_name,
                  lastName: profile.last_name,
                  phone: profile.phone,
                  birthdate: profile.birthdate,
                  accountType: profile.account_type,
                  isAdmin: isAdmin,
                  organizationId: profile.organization_id,
                  avatarUrl: profile.avatar_url
                };
                setUser(userData);
                console.log('✅ User profile loaded:', userData.email, 'isAdmin:', isAdmin);
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
              setError('Failed to load user profile');
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
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
        // Handle specific error cases
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Por favor confirma tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');
        }
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
      
      // Validate admin key securely if admin account
      if (userData.accountType === 'admin' && userData.adminKey) {
        try {
          const response = await supabase.functions.invoke('validate-admin', {
            body: { adminKey: userData.adminKey }
          });
          
          if (response.error) {
            throw new Error('Admin validation failed');
          }
          
          if (!response.data?.valid) {
            throw new Error('Invalid admin key');
          }
        } catch (error) {
          throw new Error('Invalid admin key');
        }
      }
      
      const redirectUrl = window.location.origin;
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone || '',
            birthdate: userData.birthdate || null, // Convert empty string to null for database
            account_type: userData.accountType,
            organization_name: userData.organizationName,
            join_organization_id: userData.joinOrganizationId
          }
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('Este correo ya está registrado. Intenta iniciar sesión.');
        }
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
      const updateData: any = {};
      
      if (userData.firstName !== undefined) updateData.first_name = userData.firstName;
      if (userData.lastName !== undefined) updateData.last_name = userData.lastName;
      if (userData.phone !== undefined) updateData.phone = userData.phone;
      if (userData.birthdate !== undefined) updateData.birthdate = userData.birthdate;
      if (userData.avatarUrl !== undefined) updateData.avatar_url = userData.avatarUrl;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local user state
      const updatedUser = {
        ...user,
        ...userData,
        name: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}`.trim()
          : user.name
      };
      setUser(updatedUser);
      console.log("AuthContext: User updated");
    } catch (error) {
      console.error("Error updating user:", error);
      setError('Failed to update user profile');
      throw error;
    }
  };

  // Resend confirmation email function
  const resendConfirmation = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        throw error;
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to resend confirmation email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    
    // Clear remember-me preference
    sessionStorage.removeItem('auth-remember-me');
    
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
    resendConfirmation,
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