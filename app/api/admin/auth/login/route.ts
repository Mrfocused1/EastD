import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3ZuandpYXN1c2pmZXZpbWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTk3MzcsImV4cCI6MjA3OTU3NTczN30.jB94OamqDhz0JaXyLzpPNb1GiAWTEKcJU2KqsNUpLAg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    // Get stored password hash
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('page', 'admin')
      .eq('section', 'auth')
      .eq('key', 'password_hash')
      .single();

    if (error || !data?.value) {
      return NextResponse.json({ error: 'Admin not set up. Please set up a password first.' }, { status: 400 });
    }

    // Verify password
    const inputHash = hashPassword(password);
    if (inputHash !== data.value) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    // Store session token
    await supabase
      .from('site_content')
      .upsert({
        page: 'admin',
        section: 'auth',
        key: 'session_token',
        value: sessionToken,
        type: 'text',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'page,section,key'
      });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
