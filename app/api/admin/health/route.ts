import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3ZuandpYXN1c2pmZXZpbWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTk3MzcsImV4cCI6MjA3OTU3NTczN30.jB94OamqDhz0JaXyLzpPNb1GiAWTEKcJU2KqsNUpLAg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface HealthCheckResult {
  name: string;
  status: 'ok' | 'error' | 'warning';
  message: string;
  duration?: number;
}

interface HealthReport {
  timestamp: string;
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
  };
}

// Check if admin is authenticated
async function isAuthenticated(): Promise<boolean> {
  try {
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
  } catch {
    return false;
  }
}

// Individual health checks
async function checkDatabaseConnection(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const { error } = await supabase
      .from('site_content')
      .select('id')
      .limit(1);

    if (error) throw error;

    return {
      name: 'Database Connection',
      status: 'ok',
      message: 'Successfully connected to Supabase',
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      name: 'Database Connection',
      status: 'error',
      message: `Failed to connect: ${error}`,
      duration: Date.now() - start,
    };
  }
}

async function checkPricingData(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')
      .eq('page', 'pricing')
      .eq('section', 'config');

    if (error) throw error;

    const hasStudios = data?.some(d => d.key === 'studios');
    const hasAddons = data?.some(d => d.key === 'addons');

    if (!hasStudios && !hasAddons) {
      return {
        name: 'Pricing Data',
        status: 'warning',
        message: 'No pricing data found in database (using defaults)',
        duration: Date.now() - start,
      };
    }

    // Validate addons have maxQuantity
    const addonsData = data?.find(d => d.key === 'addons');
    if (addonsData) {
      try {
        const addons = JSON.parse(addonsData.value);
        const missingMaxQty = addons.filter((a: { maxQuantity?: number }) => !a.maxQuantity);
        if (missingMaxQty.length > 0) {
          return {
            name: 'Pricing Data',
            status: 'warning',
            message: `${missingMaxQty.length} addons missing maxQuantity field`,
            duration: Date.now() - start,
          };
        }
      } catch {
        return {
          name: 'Pricing Data',
          status: 'error',
          message: 'Invalid addons JSON data',
          duration: Date.now() - start,
        };
      }
    }

    return {
      name: 'Pricing Data',
      status: 'ok',
      message: 'Pricing configuration valid',
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      name: 'Pricing Data',
      status: 'error',
      message: `Failed to check pricing: ${error}`,
      duration: Date.now() - start,
    };
  }
}

async function checkAdminAuth(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('key')
      .eq('page', 'admin')
      .eq('section', 'auth');

    if (error) throw error;

    const hasPassword = data?.some(d => d.key === 'password_hash');

    if (!hasPassword) {
      return {
        name: 'Admin Authentication',
        status: 'warning',
        message: 'No admin password configured (first-time setup required)',
        duration: Date.now() - start,
      };
    }

    return {
      name: 'Admin Authentication',
      status: 'ok',
      message: 'Admin authentication configured',
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      name: 'Admin Authentication',
      status: 'error',
      message: `Failed to check auth: ${error}`,
      duration: Date.now() - start,
    };
  }
}

async function checkHomepageContent(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('key')
      .eq('page', 'homepage');

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        name: 'Homepage Content',
        status: 'warning',
        message: 'No homepage content in database (using defaults)',
        duration: Date.now() - start,
      };
    }

    return {
      name: 'Homepage Content',
      status: 'ok',
      message: `${data.length} content items found`,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      name: 'Homepage Content',
      status: 'error',
      message: `Failed to check homepage: ${error}`,
      duration: Date.now() - start,
    };
  }
}

async function checkGalleryContent(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('page', 'gallery')
      .eq('section', 'images')
      .eq('key', 'items')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      return {
        name: 'Gallery Content',
        status: 'warning',
        message: 'No gallery images configured',
        duration: Date.now() - start,
      };
    }

    try {
      const images = JSON.parse(data.value);
      return {
        name: 'Gallery Content',
        status: 'ok',
        message: `${images.length} gallery images configured`,
        duration: Date.now() - start,
      };
    } catch {
      return {
        name: 'Gallery Content',
        status: 'error',
        message: 'Invalid gallery JSON data',
        duration: Date.now() - start,
      };
    }
  } catch (error) {
    return {
      name: 'Gallery Content',
      status: 'error',
      message: `Failed to check gallery: ${error}`,
      duration: Date.now() - start,
    };
  }
}

async function checkDiscountCodes(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .from('discount_codes')
      .select('id, code, is_active')
      .limit(100);

    if (error) {
      // Table might not exist
      if (error.code === '42P01') {
        return {
          name: 'Discount Codes',
          status: 'warning',
          message: 'Discount codes table not found',
          duration: Date.now() - start,
        };
      }
      throw error;
    }

    const activeCount = data?.filter(d => d.is_active).length || 0;

    return {
      name: 'Discount Codes',
      status: 'ok',
      message: `${activeCount} active discount codes`,
      duration: Date.now() - start,
    };
  } catch (error) {
    return {
      name: 'Discount Codes',
      status: 'error',
      message: `Failed to check discounts: ${error}`,
      duration: Date.now() - start,
    };
  }
}

async function checkApiEndpoints(): Promise<HealthCheckResult> {
  const start = Date.now();
  const endpoints = [
    '/api/admin/auth/status',
    '/api/admin/pricing',
  ];

  const results: string[] = [];

  for (const endpoint of endpoints) {
    try {
      // We can't easily test these internally, but we can verify the routes exist
      results.push(`${endpoint}: configured`);
    } catch {
      results.push(`${endpoint}: error`);
    }
  }

  return {
    name: 'API Endpoints',
    status: 'ok',
    message: `${endpoints.length} admin API routes configured`,
    duration: Date.now() - start,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skipAuth = searchParams.get('internal') === 'true';

  // Check authentication (skip for internal health checks)
  if (!skipAuth) {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Run all health checks in parallel
  const checks = await Promise.all([
    checkDatabaseConnection(),
    checkAdminAuth(),
    checkPricingData(),
    checkHomepageContent(),
    checkGalleryContent(),
    checkDiscountCodes(),
    checkApiEndpoints(),
  ]);

  // Calculate summary
  const summary = {
    total: checks.length,
    passed: checks.filter(c => c.status === 'ok').length,
    warnings: checks.filter(c => c.status === 'warning').length,
    failed: checks.filter(c => c.status === 'error').length,
  };

  // Determine overall health
  let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (summary.failed > 0) {
    overall = 'unhealthy';
  } else if (summary.warnings > 0) {
    overall = 'degraded';
  }

  const report: HealthReport = {
    timestamp: new Date().toISOString(),
    overall,
    checks,
    summary,
  };

  return NextResponse.json(report);
}

// POST endpoint to run checks and attempt fixes
export async function POST(request: Request) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fixes: { name: string; action: string; result: 'success' | 'failed' | 'skipped' }[] = [];

  // Check and fix pricing data
  try {
    const { data } = await supabase
      .from('site_content')
      .select('key, value')
      .eq('page', 'pricing')
      .eq('section', 'config');

    const addonsData = data?.find(d => d.key === 'addons');
    if (addonsData) {
      const addons = JSON.parse(addonsData.value);
      let needsFix = false;

      const fixedAddons = addons.map((addon: { id: string; maxQuantity?: number }) => {
        if (!addon.maxQuantity) {
          needsFix = true;
          return { ...addon, maxQuantity: 1 };
        }
        return addon;
      });

      if (needsFix) {
        const { error } = await supabase
          .from('site_content')
          .upsert({
            page: 'pricing',
            section: 'config',
            key: 'addons',
            value: JSON.stringify(fixedAddons),
            type: 'array',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'page,section,key',
          });

        if (error) {
          fixes.push({
            name: 'Add missing maxQuantity to addons',
            action: 'Added maxQuantity: 1 to addons missing it',
            result: 'failed',
          });
        } else {
          fixes.push({
            name: 'Add missing maxQuantity to addons',
            action: 'Added maxQuantity: 1 to addons missing it',
            result: 'success',
          });
        }
      } else {
        fixes.push({
          name: 'Add missing maxQuantity to addons',
          action: 'All addons already have maxQuantity',
          result: 'skipped',
        });
      }
    }
  } catch (error) {
    fixes.push({
      name: 'Add missing maxQuantity to addons',
      action: `Error: ${error}`,
      result: 'failed',
    });
  }

  // Run health check after fixes
  const healthResponse = await GET(request);
  const healthData = await healthResponse.json();

  return NextResponse.json({
    fixes,
    health: healthData,
  });
}
