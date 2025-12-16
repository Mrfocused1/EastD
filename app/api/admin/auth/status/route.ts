import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3ZuandpYXN1c2pmZXZpbWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTk3MzcsImV4cCI6MjA3OTU3NTczN30.jB94OamqDhz0JaXyLzpPNb1GiAWTEKcJU2KqsNUpLAg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    // Check if password hash exists in database
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('page', 'admin')
      .eq('section', 'auth')
      .eq('key', 'password_hash')
      .single();

    const hasPassword = !error && data?.value;

    // Check if session is valid
    let authenticated = false;
    if (sessionToken && hasPassword) {
      const { data: sessionData } = await supabase
        .from('site_content')
        .select('value')
        .eq('page', 'admin')
        .eq('section', 'auth')
        .eq('key', 'session_token')
        .single();

      authenticated = sessionData?.value === sessionToken;
    }

    return NextResponse.json({ authenticated, hasPassword });
  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json({ authenticated: false, hasPassword: false });
  }
}
