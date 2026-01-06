import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3ZuandpYXN1c2pmZXZpbWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTk3MzcsImV4cCI6MjA3OTU3NTczN30.jB94OamqDhz0JaXyLzpPNb1GiAWTEKcJU2KqsNUpLAg';

// Use service role key if available (bypasses RLS), otherwise fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

// Custom fetch with timeout to prevent hanging requests
const fetchWithTimeout = (url: RequestInfo | URL, options?: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
};

// Create admin client - uses service role to bypass RLS when available
const supabaseAdmin = createClient(SUPABASE_URL, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: fetchWithTimeout,
  },
});

// Default pricing data to return if database is unavailable
const DEFAULT_STUDIOS = [
  {
    id: "studio-dock-one",
    name: "Studio Dock One",
    packages: [
      { id: "2hrs", label: "2 Hour Hire", hours: 2, price: 15000 },
      { id: "4hrs", label: "4 Hour Hire", hours: 4, price: 26000 },
      { id: "8hrs", label: "8 Hour Hire", hours: 8, price: 38000 },
    ],
  },
  {
    id: "studio-dock-two",
    name: "Studio Dock Two",
    packages: [
      { id: "2hrs", label: "2 Hour Hire", hours: 2, price: 18000 },
      { id: "4hrs", label: "4 Hour Hire", hours: 4, price: 32000 },
      { id: "8hrs", label: "8 Hour Hire", hours: 8, price: 50000 },
    ],
  },
  {
    id: "studio-wharf",
    name: "Studio Wharf",
    packages: [
      { id: "2hrs", label: "2 Hour Hire", hours: 2, price: 20000 },
      { id: "4hrs", label: "4 Hour Hire", hours: 4, price: 36000 },
      { id: "8hrs", label: "8 Hour Hire", hours: 8, price: 58000 },
    ],
  },
];

const DEFAULT_ADDONS = [
  { id: "cameraLens", category: "Camera & Lens", label: "Additional Camera & Lens", price: 3000, maxQuantity: 2 },
  { id: "teleprompter", category: "Camera & Lens", label: "Teleprompter", price: 2500, maxQuantity: 2 },
  { id: "rgbTubes", category: "Camera & Lens", label: "RGB Tubes", price: 1500, maxQuantity: 4 },
  { id: "lavMic", category: "Camera & Lens", label: "Lavalier Mics (Pack of 2)", price: 1000, maxQuantity: 4 },
  { id: "shotgunMic", category: "Camera & Lens", label: "Shotgun Mic", price: 1500, maxQuantity: 2 },
  { id: "videoSwitcherHalf", category: "Camera & Lens", label: "Video Switcher (upto Half Day)", price: 3500, maxQuantity: 1 },
];

// Check if admin is authenticated via cookie
async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) return false;

    const { data } = await supabaseAdmin
      .from('site_content')
      .select('value')
      .eq('page', 'admin')
      .eq('section', 'auth')
      .eq('key', 'session_token')
      .single();

    return data?.value === sessionToken;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// GET - Load pricing data
export async function GET() {
  try {
    // Check authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      // Return defaults with flag so page can still show content
      return NextResponse.json(
        { studios: DEFAULT_STUDIOS, addons: DEFAULT_ADDONS, fromDefaults: true, authRequired: true },
        { status: 200 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('site_content')
      .select('key, value')
      .eq('page', 'pricing')
      .eq('section', 'config');

    if (error) {
      console.error('Error loading pricing:', error);
      // Return defaults on error
      return NextResponse.json({ studios: DEFAULT_STUDIOS, addons: DEFAULT_ADDONS, fromDefaults: true });
    }

    const result: { studios?: unknown; addons?: unknown; fromDefaults?: boolean } = {};

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

    // If no data found, return defaults
    if (!result.studios) result.studios = DEFAULT_STUDIOS;
    if (!result.addons) result.addons = DEFAULT_ADDONS;
    if (!data || data.length === 0) result.fromDefaults = true;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    // Return defaults on any error
    return NextResponse.json({ studios: DEFAULT_STUDIOS, addons: DEFAULT_ADDONS, fromDefaults: true });
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
      const { error } = await supabaseAdmin
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
        return NextResponse.json({
          error: 'Failed to save pricing. If using anon key, ensure SUPABASE_SERVICE_ROLE_KEY is set in environment variables.',
          details: error.message
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
