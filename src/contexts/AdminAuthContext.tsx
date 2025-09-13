// contexts/AdminAuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Profile = {
  role: "passholder" | "school_partner" | "regular_user" | string;
  first_name?: string | null;
  last_name?: string | null;
  school_id?: string | null;
  [key: string]: any;
};

type School = {
  id: string;
  name: string;
  display_name?: string | null;
  logo_url?: string | null;
  max_capacity_per_slot?: number | null;
  timezone?: string | null;
  [key: string]: any;
};

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: Profile | null;
  school: School | null;
  isPassholder: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string) => Promise<{ error?: any }>;
}

const AdminAuthContext = createContext<AdminAuthState | undefined>(undefined);

export const useAdminAuth = (): AdminAuthState => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }
  return ctx;
};

interface Props {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<Props> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchingProfile, setFetchingProfile] = useState<boolean>(false);

  const fetchProfile = useCallback(async (userId: string, retryCount = 0) => {
    // Prevent multiple concurrent fetches
    if (fetchingProfile) {
      console.log('AdminAuthContext: Already fetching profile, skipping');
      return;
    }

    setFetchingProfile(true);
    try {
      console.log('AdminAuthContext: Fetching profile for user:', userId);
      
      // Enhanced error handling for Supabase calls
      const { data: profileData, error } = await supabase
        .from("user_profiles")
        .select("role, first_name, last_name, school_id, email")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("AdminAuthContext: Profile fetch error:", error);
        
        // Retry logic for network errors
        if (retryCount < 2 && (error.message?.includes('network') || error.message?.includes('timeout'))) {
          console.log(`AdminAuthContext: Retrying profile fetch (attempt ${retryCount + 1})`);
          setTimeout(() => fetchProfile(userId, retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        
        throw new Error(`Failed to fetch profile: ${error.message}`);
      } 
      
      if (profileData) {
        console.log('AdminAuthContext: Setting profile data:', profileData);
        setProfile(profileData as Profile);
        
        // Only fetch school data for school_partner users
        if (profileData.school_id && profileData.role === 'school_partner') {
          try {
            const { data: schoolData, error: schoolError } = await supabase
              .from("schools")
              .select("*")
              .eq("id", profileData.school_id)
              .maybeSingle();
              
            if (schoolError) {
              console.warn("AdminAuthContext: School fetch error:", schoolError);
              setSchool(null);
            } else if (schoolData) {
              setSchool(schoolData as School);
            } else {
              setSchool(null);
            }
          } catch (schoolErr) {
            console.warn("AdminAuthContext: School fetch exception:", schoolErr);
            setSchool(null);
          }
        } else {
          setSchool(null);
        }
      } else {
        console.log('AdminAuthContext: No profile data found for user:', userId);
        setProfile(null);
        setSchool(null);
      }
    } catch (error) {
      console.error("AdminAuthContext: Profile fetch failed:", error);
      setProfile(null);
      setSchool(null);
      
      // Surface error to user if it's a critical failure
      if (retryCount >= 2) {
        console.error("AdminAuthContext: Max retries reached, profile fetch failed permanently");
      }
    } finally {
      setFetchingProfile(false);
    }
  }, [fetchingProfile]);

  const load = useCallback(async () => {
    if (isLoading) return; // Prevent multiple concurrent loads
    
    setIsLoading(true);
    try {
      console.log('AdminAuthContext: Loading auth session...');
      
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      console.log('AdminAuthContext: Session loaded:', !!currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
        setSchool(null);
      }
    } catch (error) {
      console.error("AdminAuthContext: Auth load error:", error);
      setSession(null);
      setUser(null);
      setProfile(null);
      setSchool(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfile]); // Keep fetchProfile dependency but use callback to prevent loops

  useEffect(() => {
    console.log('AdminAuthContext: Setting up auth listeners...');
    let mounted = true;
    
    // Only check for existing session, don't interfere with AuthContext
    const checkExistingSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('AdminAuthContext: Session loaded:', !!currentSession);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
          setSchool(null);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("AdminAuthContext: Session check error:", error);
        setSession(null);
        setUser(null);
        setProfile(null);
        setSchool(null);
        setIsLoading(false);
      }
    };

    // Set up auth state listener - only handle SIGNED_IN and SIGNED_OUT
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) {
        console.log('AdminAuthContext: Component unmounted, ignoring auth event:', event);
        return;
      }
      
      console.log('AdminAuthContext: Auth state change:', event, newSession?.user?.id);
      
      if (event === 'SIGNED_IN') {
        console.log('AdminAuthContext: User signed in, updating session and fetching profile...');
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Use setTimeout to prevent conflicts with AuthContext
          setTimeout(() => {
            if (mounted && newSession?.user) {
              fetchProfile(newSession.user.id);
            }
          }, 100);
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log('AdminAuthContext: User signed out, clearing state...');
        setSession(null);
        setUser(null);
        setProfile(null);
        setSchool(null);
        setIsLoading(false);
      }
      // Ignore INITIAL_SESSION and other events
    });

    // Check existing session
    checkExistingSession();

    return () => {
      console.log('AdminAuthContext: Cleaning up auth listeners...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to prevent re-setup

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const signOut = useCallback(async () => {
    try {
      console.log('AdminAuthContext: Starting signout...');
      
      // Clear local state immediately to prevent UI flicker
      setUser(null);
      setSession(null);
      setProfile(null);
      setSchool(null);
      
      // Clear storage
      try {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('AdminAuthContext: Storage clear error:', storageError);
      }
      
      // Then call supabase signout with error handling
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.warn("AdminAuthContext: Sign out error (state cleared anyway):", error);
      }
      
      console.log('AdminAuthContext: Signout completed');
    } catch (error) {
      console.error("AdminAuthContext: Sign out failed:", error);
      // Ensure state is cleared even if signout fails
      setUser(null);
      setSession(null);
      setProfile(null);
      setSchool(null);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        console.log('AdminAuthContext: Attempting sign in...');
        
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error('AdminAuthContext: Sign in error:', error);
          return { error: new Error(error.message || 'Sign in failed') };
        }
        
        if (data?.session) {
          console.log('AdminAuthContext: Sign in successful');
          // session change will be picked up by listener
        }
        
        return { error: null };
      } catch (error) {
        console.error('AdminAuthContext: Sign in exception:', error);
        return { error: new Error('Network error during sign in. Please check your connection.') };
      }
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });
      if (data?.user) {
        // optionally fetch profile or initialize
      }
      return { error };
    },
    []
  );

  // Computed values for role checking
  const isPassholder = profile?.role === 'passholder';

  const value: AdminAuthState = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    profile,
    school,
    isPassholder,
    refresh,
    signOut,
    signIn,
    signUp,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
