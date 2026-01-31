import { createClient } from '@supabase/supabase-js';

// Hardcoded for extension (since env vars in extension are tricky without proper build setup)
// In production, these should be handled more securely or via build args.
const supabaseUrl = "https://bxjsxbastdsmvqmeopcj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anN4YmFzdGRzbXZxbWVvcGNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTAxNDYsImV4cCI6MjA4NDY2NjE0Nn0.bDm8CAZ2vwVyDhgQHmTjSSVsF5AOXsEWsGJ_dPTfeyE";

export const supabase = createClient(supabaseUrl, supabaseKey);
