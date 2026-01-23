import { createClient } from '@supabase/supabase-js';

// Safe way to get env vars in Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "https://bxjsxbastdsmvqmeopcj.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anN4YmFzdGRzbXZxbWVvcGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTAxNDYsImV4cCI6MjA4NDY2NjE0Nn0.bDm8CAZ2vwVyDhgQHmTjSSVsF5AOXsEWsGJ_dPTfeyE";

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Supabase Credentials might be missing. Using defaults if available.");
} else {
  console.log("✅ Supabase Credentials loaded", { url: supabaseUrl });
}

export const supabase = createClient(supabaseUrl, supabaseKey);