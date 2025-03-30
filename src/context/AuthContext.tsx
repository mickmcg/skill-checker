import React, { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, signIn, signOut, signUp, User } from "../lib/auth";
import { supabase } from "../lib/supabase";

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
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || "",
            username: currentUser.user_metadata?.username,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
              username: session.user.user_metadata?.username,
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        },
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
  }, []);

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
