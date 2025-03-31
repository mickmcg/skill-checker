import React, { createContext, useContext, useEffect, useState, useMemo } from 'react'; // Import useMemo
import { getCurrentUser, signIn, signOut, signUp, User } from '../lib/auth';
import { supabase } from '../lib/supabase';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    // Check for existing session only once on mount
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        // No need to setUser here, onAuthStateChange will handle it
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // checkUser(); // Call checkUser, but let onAuthStateChange handle setting state

    // Listen for auth changes
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          // Simpler update: directly set user based on session
          const currentUser = session?.user;
          setUser(currentUser ? {
              id: currentUser.id,
              email: currentUser.email || '',
              username: currentUser.user_metadata?.username,
          } : null);
          setLoading(false); // Set loading false after first auth check
        }
      );

      // Safe cleanup function
      return () => {
        try {
          if (
            data &&
            data.subscription &&
            typeof data.subscription.unsubscribe === "function"
          ) {
            data.subscription.unsubscribe();
          }
        } catch (error) {
          console.error("Error unsubscribing from auth changes:", error);
        }
      };
    } catch (error) {
      console.error("Error setting up auth state change listener:", error);
      setLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Memoize the context value
  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }), [user?.id, loading]); // Dependencies: user ID and loading

  // Render children only when loading is false? Or handle loading in consumers?
  // For now, pass loading state down.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
