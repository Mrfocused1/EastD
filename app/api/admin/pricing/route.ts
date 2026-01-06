import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3ZuandpYXN1c2pmZXZpbWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTk3MzcsImV4cCI6MjA3OTU3NTczN30.jB94OamqDhz0JaXyLzpPNb1GiAWTEKcJU2KqsNUpLAg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if admin is authenticated
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!sessionToken) return false;

  const { data } = await supabase
    .from('site_content')
    .select('value')
    .eq('page', 'admin')
    .eq('section', 'auth')
    .eq('key', 'session_token')
    .single();

  return data?.value === sessionToken;
}

// GET - Load pricing data
export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')
      .eq('page', 'pricing')
      .eq('section', 'config');

    if (error) {
      console.error('Error loading pricing:', error);
      return NextResponse.json({ error: 'Failed to load pricing' }, { status: 500 });
    }

    const result: { studios?: unknown; addons?: unknown } = {};

    if (data && data.length > 0) {
      data.forEach((item: { key: string; value: string }) => {
        if (item.key === 'studios') {
          try {
            result.studios = JSON.parse(item.value);
          } catch (e) {
            console.error('Error parsing studios:', e);
          }
        }
        if (item.key === 'addons') {
          try {
            result.addons = JSON.parse(item.value);
          } catch (e) {
            console.error('Error parsing addons:', e);
          }
        }
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST - Save pricing data
export async function POST(request: Request) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studios, addons } = await request.json();

    const contentToSave = [
      { page: 'pricing', section: 'config', key: 'studios', value: JSON.stringify(studios), type: 'array' },
      { page: 'pricing', section: 'config', key: 'addons', value: JSON.stringify(addons), type: 'array' },
    ];

    for (const item of contentToSave) {
      const { error } = await supabase
        .from('site_content')
        .upsert(
          {
            ...item,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'page,section,key',
          }
        );

      if (error) {
        console.error('Error saving:', error);
        return NextResponse.json({ error: 'Failed to save pricing' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
