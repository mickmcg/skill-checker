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
    // Note: Supabase auth doesn't directly store username here,
    // we'll update the profiles table separately.
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Signup successful but no user data returned.");

  // 2. Update the corresponding row in public.profiles
  // The trigger should have already created the row with a default username.
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ username: username, updated_at: new Date().toISOString() })
    .eq('id', authData.user.id); // Match the user ID

  if (profileError) {
    console.error("Error updating profile:", profileError);
    // Decide how to handle this - maybe delete the auth user?
    // For now, we'll throw an error, but a more robust solution might be needed.
    // Consider deleting the user if profile update fails:
    // await supabase.auth.admin.deleteUser(authData.user.id); // Requires admin privileges
    throw new Error(`User created but failed to set username: ${profileError.message}`);
  }

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
