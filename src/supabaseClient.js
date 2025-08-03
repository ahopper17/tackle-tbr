import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fhyqdatkbxtrvnytfyug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoeXFkYXRrYnh0cnZueXRmeXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1Mzk4MDIsImV4cCI6MjA2OTExNTgwMn0.4wvo2lV63Bs5HpGbEHVEXgpxpCAbFvpictGEYHMz06E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});
