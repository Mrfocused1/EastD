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

// Check if admin is authenticated via cookie (with timeout)
async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) return false;

    // Add timeout to auth check
    const authPromise = supabaseAdmin
      .from('site_content')
      .select('value')
      .eq('page', 'admin')
      .eq('section', 'auth')
      .eq('key', 'session_token')
      .single();

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000);
    });

    const result = await Promise.race([authPromise, timeoutPromise]);

    if (!result || !('data' in result)) return false;
    return result.data?.value === sessionToken;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// GET - Load pricing data (no auth required)
export async function GET() {
  const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('[Pricing GET] Request received, using service role:', usingServiceRole);

  // Wrap entire handler in timeout to ensure it always responds
  const timeoutPromise = new Promise<Response>((resolve) => {
    setTimeout(() => {
      console.log('[Pricing GET] Timeout reached, returning defaults');
      resolve(NextResponse.json({
        studios: DEFAULT_STUDIOS,
        addons: DEFAULT_ADDONS,
        fromDefaults: true,
        timeout: true
      }));
    }, 8000);
  });

  const dataPromise = (async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from('site_content')
        .select('key, value')
        .eq('page', 'pricing')
        .eq('section', 'config');

      if (error) {
        console.error('[Pricing GET] Error loading pricing:', error);
        return NextResponse.json({ studios: DEFAULT_STUDIOS, addons: DEFAULT_ADDONS, fromDefaults: true, error: error.message });
      }

      console.log('[Pricing GET] Data fetched:', data?.length || 0, 'rows');

      const result: { studios?: unknown; addons?: unknown; fromDefaults?: boolean; usingServiceRole?: boolean } = {};

      if (data && data.length > 0) {
        data.forEach((item: { key: string; value: string }) => {
          if (item.key === 'studios') {
            try {
              result.studios = JSON.parse(item.value);
              console.log('[Pricing GET] Parsed studios:', (result.studios as unknown[])?.length || 0);
            } catch (e) {
              console.error('[Pricing GET] Error parsing studios:', e);
            }
          }
          if (item.key === 'addons') {
            try {
              result.addons = JSON.parse(item.value);
              console.log('[Pricing GET] Parsed addons:', (result.addons as unknown[])?.length || 0);
            } catch (e) {
              console.error('[Pricing GET] Error parsing addons:', e);
            }
          }
        });
      }

      if (!result.studios) result.studios = DEFAULT_STUDIOS;
      if (!result.addons) result.addons = DEFAULT_ADDONS;
      if (!data || data.length === 0) result.fromDefaults = true;
      result.usingServiceRole = usingServiceRole;

      return NextResponse.json(result);
    } catch (error) {
      console.error('[Pricing GET] Error:', error);
      return NextResponse.json({ studios: DEFAULT_STUDIOS, addons: DEFAULT_ADDONS, fromDefaults: true });
    }
  })();

  return Promise.race([dataPromise, timeoutPromise]);
}

// POST - Save pricing data (no auth required for simplicity)
export async function POST(request: Request) {
  const usingServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('[Pricing POST] Save request received');
  console.log('[Pricing POST] Using service role key:', usingServiceRole);

  try {
    const { studios, addons } = await request.json();
    console.log('[Pricing POST] Studios to save:', studios?.length || 0);
    console.log('[Pricing POST] Addons to save:', addons?.length || 0);

    const contentToSave = [
      { page: 'pricing', section: 'config', key: 'studios', value: JSON.stringify(studios), type: 'array' },
      { page: 'pricing', section: 'config', key: 'addons', value: JSON.stringify(addons), type: 'array' },
    ];

    const results = [];
    for (const item of contentToSave) {
      console.log(`[Pricing POST] Saving ${item.key}...`);
      const { data, error } = await supabaseAdmin
        .from('site_content')
        .upsert(
          {
            ...item,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'page,section,key',
          }
        )
        .select();

      if (error) {
        console.error(`[Pricing POST] Error saving ${item.key}:`, JSON.stringify(error, null, 2));
        return NextResponse.json({
          error: 'Failed to save pricing',
          details: error.message,
          code: error.code,
          hint: error.hint,
          usingServiceRole,
          key: item.key
        }, { status: 500 });
      }

      console.log(`[Pricing POST] ${item.key} saved, rows returned:`, data?.length || 0);
      results.push({ key: item.key, rowsAffected: data?.length || 0, data });
    }

    console.log('[Pricing POST] All saves completed successfully');
    return NextResponse.json({
      success: true,
      usingServiceRole,
      results
    });
  } catch (error) {
    console.error('[Pricing POST] Save error:', error);
    return NextResponse.json({
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      usingServiceRole
    }, { status: 500 });
  }
}
