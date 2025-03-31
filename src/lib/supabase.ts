import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase"; // Import the generated Database type

// Check if environment variables are available, otherwise use placeholder values for development
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://placeholder-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Only create the client if we have valid values
const createSupabaseClient = (): SupabaseClient<Database> => {
  if (
    !supabaseUrl || supabaseUrl === "https://placeholder-project.supabase.co" ||
    !supabaseAnonKey || supabaseAnonKey === "placeholder-anon-key"
  ) {
    // Throw an error if environment variables are not set correctly
    throw new Error("Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. Please check your .env file.");
  }

  // Pass the Database type to createClient
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Create and export the Supabase client
export const supabase = createSupabaseClient();
