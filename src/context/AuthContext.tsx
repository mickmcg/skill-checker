import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'; // Import useCallback
import { getCurrentUser, signIn, signOut, signUp, User } from '../lib/auth';
import { supabase } from '../lib/supabase';

// Define the type for preferences update
type UserPreferences = {
  default_num_questions: number;
  default_time_per_question: number;
  default_difficulty: 'easy' | 'medium' | 'hard';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, username: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateUserLocally: (updatedFields: Partial<User>) => void;
  // Add the new function signature
  updateUserPreferences: (prefs: UserPreferences) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- Existing useEffect for auth state changes ---
  useEffect(() => {
    // ... (existing auth listener code remains the same) ...
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

    // Store the subscription to unsubscribe later
    let authSubscription: any = null;

    // Listen for auth changes
    try {
      const { data } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          // --- Simplified Listener ---
          console.log("AuthContext: onAuthStateChange triggered. Event:", _event, "Session:", session);
          const authUser = session?.user;
          // Set only basic user info here, or null
          const basicUser = authUser ? { id: authUser.id, email: authUser.email || '' } : null;
          setUser(basicUser);
          console.log("AuthContext: Set basic user state:", basicUser);
          // Set loading false *after* the initial state is determined
          setLoading(false);
          console.log("AuthContext: Set loading to false in onAuthStateChange.");
        }
      );
      authSubscription = data.subscription; // Store the subscription object

    } catch (error) {
      console.error("Error setting up auth state change listener:", error);
      setLoading(false);
    }

    // Cleanup function for the auth listener
    return () => {
      try {
        if (authSubscription && typeof authSubscription.unsubscribe === 'function') {
          console.log("AuthContext: Unsubscribing from auth state changes.");
          authSubscription.unsubscribe();
        }
      } catch (error) {
        console.error("Error unsubscribing from auth changes:", error);
      }
    };
  }, []); // Outer useEffect runs only once on mount


  // --- Existing useEffect for Profile Fetch ---
  useEffect(() => {
    // ... (existing profile fetch code remains the same) ...
    if (user && !user.username) {
      console.log("AuthContext: Profile fetch effect triggered for user:", user.id);
        let isMounted = true; // Flag to prevent state update if component unmounts

        const fetchProfile = async () => {
          try {
            console.log("AuthContext: Fetching profile in separate effect for user:", user.id);
            // Select the new default settings fields as well
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('username, default_num_questions, default_difficulty, default_time_per_question')
              .eq('id', user.id) // Use user.id from state
              .single();

            console.log("AuthContext: Profile fetch effect response - Error:", profileError);
            console.log("AuthContext: Profile fetch effect response - Data:", profile);

            if (isMounted) { // Check if component is still mounted
              if (profileError) {
                console.error("AuthContext: Error fetching profile in effect:", profileError);
                 // Optionally update state to indicate profile error, or leave user as basic
               } else if (profile) {
                 // Update user state with the fetched profile data
                 setUser(currentUser => currentUser ? {
                   ...currentUser,
                   username: profile.username,
                   default_num_questions: profile.default_num_questions,
                   default_difficulty: profile.default_difficulty,
                   default_time_per_question: profile.default_time_per_question,
                 } : null);
                 console.log("AuthContext: Updated user state with profile data:", profile);
               }
            }
          } catch (err) {
            console.error("AuthContext: Exception fetching profile in effect:", err);
            // Handle error, maybe update state to show an error message
          }
        };

        fetchProfile();

        // Cleanup function for the effect
        return () => {
          isMounted = false;
          console.log("AuthContext: Profile fetch effect cleanup.");
        };
      }
  }, [user]); // Dependency array: run when the basic 'user' object changes

  // --- Function to update local user state ---
  const updateUserLocally = useCallback((updatedFields: Partial<User>) => {
    setUser(currentUser => currentUser ? { ...currentUser, ...updatedFields } : null);
    console.log("AuthContext: Updated user state locally:", updatedFields);
  }, []); // No dependencies needed as setUser is stable

  // --- NEW: Function to update user preferences in DB and locally ---
  const updateUserPreferences = useCallback(async (prefs: UserPreferences) => {
    if (!user) {
      throw new Error("User must be logged in to update preferences.");
    }
    console.log(`AuthContext: Updating preferences for user ${user.id}:`, prefs);
    const { error } = await supabase
      .from('profiles')
      .update(prefs)
      .eq('id', user.id);

    if (error) {
      console.error("AuthContext: Error updating user preferences:", error);
      throw error; // Re-throw the error to be caught by the caller in QuizSettings
    }

    console.log("AuthContext: Preferences updated successfully in DB. Updating locally.");
    // Update local state immediately after successful DB update
    updateUserLocally(prefs);

  }, [user, updateUserLocally]); // Depends on user (for ID) and the local update function

  // Memoize the context value
  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserLocally, // Keep existing local update function
    updateUserPreferences, // Add the new function
  }), [user, loading, updateUserLocally, updateUserPreferences]); // Add dependencies

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
