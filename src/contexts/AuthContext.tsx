import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, schoolName?: string, role?: string) => Promise<{ error?: any }>;
  signInWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Correct initialization order: listen first, then fetch existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('AuthContext: Auth state change:', event, newSession?.user?.id);
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log('AuthContext: Initial session loaded:', !!existingSession);
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Attempting sign in...');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('AuthContext: Sign in error:', error);
        return { error: new Error(error.message || 'Sign in failed') };
      }
      
      console.log('AuthContext: Sign in successful');
      return { error: null };
    } catch (error) {
      console.error('AuthContext: Sign in exception:', error);
      return { error: new Error('Network error during sign in. Please check your connection.') };
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName?: string, 
    lastName?: string, 
    schoolName?: string,
    role?: string
  ) => {
    try {
      console.log('AuthContext: Attempting sign up...');
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            school_name: schoolName
          }
        }
      });

      if (error) {
        console.error('AuthContext: Sign up error:', error);
        return { error: new Error(error.message || 'Sign up failed') };
      }

      // Profile creation is now handled automatically by database trigger
      if (data.user) {
        console.log('AuthContext: Sign up successful, profile will be created by trigger');
      }

      return { error: null };
    } catch (error) {
      console.error('AuthContext: Sign up exception:', error);
      return { error: new Error('Network error during sign up. Please check your connection.') };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    try {
      console.log('AuthContext: Attempting OAuth sign in with:', provider);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        }
      });
      
      if (error) {
        console.error('AuthContext: OAuth sign in error:', error);
        return { error: new Error(error.message || 'OAuth sign in failed') };
      }
      
      console.log('AuthContext: OAuth sign in initiated');
      return { error: null };
    } catch (error) {
      console.error('AuthContext: OAuth sign in exception:', error);
      return { error: new Error('Network error during OAuth sign in. Please check your connection.') };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting signout...');
      
      // Clear local state immediately to prevent UI flicker
      setUser(null);
      setSession(null);
      
      // Clear storage with error handling
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('AuthContext: Storage clear error:', storageError);
      }
      
      // Then call supabase signout
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.warn('AuthContext: Signout error (state cleared anyway):', error);
      }
      
      console.log('AuthContext: Signout completed');
    } catch (error) {
      console.error('AuthContext: Signout failed:', error);
      // Ensure state is cleared even if signout fails
      setUser(null);
      setSession(null);
    }
  };

  const providerName = (user?.app_metadata as any)?.provider as string | undefined;
  const isAnonymous = providerName === 'anon' || providerName === 'anonymous';

  const value = {
    user,
    session,
    isAuthenticated: !!user && !isAnonymous,
    isLoading,
    signIn,
    signUp,
    signInWithOAuth,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};