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

    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Hash the password
    const passwordHash = hashPassword(password);

    // Store password hash
    const { error } = await supabase
      .from('site_content')
      .upsert({
        page: 'admin',
        section: 'auth',
        key: 'password_hash',
        value: passwordHash,
        type: 'text',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'page,section,key'
      });

    if (error) {
      console.error('Error storing password:', error);
      return NextResponse.json({ error: 'Failed to set password' }, { status: 500 });
    }

    // Generate session token and log in
    const sessionToken = crypto.randomBytes(32).toString('hex');

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
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
