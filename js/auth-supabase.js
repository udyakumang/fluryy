
// Placeholder wiring for Supabase auth (email OTP or magic link).
// 1) Include <script type="module" src="/js/auth-supabase.js"></script> AFTER main.js on pages that need real auth.
// 2) Fill in SUPABASE_URL and SUPABASE_ANON_KEY below.
// 3) Replace client-side demo auth in main.js with calls here.
/*
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function signInWithEmail(email){
  const { data, error } = await supabase.auth.signInWithOtp({ email, options:{ emailRedirectTo: window.location.origin + '/dashboard.html' } });
  if(error) throw error;
  alert('Check your email for a login link.');
}

export async function signOut(){ await supabase.auth.signOut(); location.href='/'; }
*/
