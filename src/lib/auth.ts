import { supabase } from "./supabase";

export type User = {
  id: string;
  email: string;
  username?: string;
  default_num_questions?: number;
  default_difficulty?: 'easy' | 'medium' | 'hard' | string; // Allow string for flexibility initially
  default_time_per_question?: number;
};

// Add username parameter
export async function signUp(email: string, password: string, username: string) {
  // 1. Sign up the user in auth.users
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // Pass the username in the metadata
        username: username
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Signup successful but no user data returned.");

  // 2. The trigger 'handle_new_user' now handles inserting the username
  //    into the profiles table using the metadata passed above.
  //    No need for a separate update call here.

  return authData; // Return the original auth data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
