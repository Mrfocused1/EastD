import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = "admin@eastdockstudios.co.uk";
const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';

// This endpoint deletes the admin user so a new one can be created
// It requires the service role key which should be in your Vercel environment variables
export async function POST(request: Request) {
  try {
    // Get the secret key from request body for security
    const body = await request.json();
    const { secretKey } = body;

    // Simple security check - must provide secret key
    if (secretKey !== "RESET_ADMIN_2024") {
      return NextResponse.json({ error: "Invalid secret key" }, { status: 401 });
    }

    // Get service role key from environment
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json({
        error: "SUPABASE_SERVICE_ROLE_KEY not configured in environment variables",
        instructions: "Add SUPABASE_SERVICE_ROLE_KEY to your Vercel environment variables. Find it in Supabase Dashboard > Settings > API > service_role key"
      }, { status: 500 });
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(SUPABASE_URL, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // List users and find admin
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 });
    }

    const adminUser = users?.find(u => u.email === ADMIN_EMAIL);

    if (!adminUser) {
      return NextResponse.json({
        success: true,
        message: "Admin user not found - you can create a new account now"
      });
    }

    // Delete the admin user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(adminUser.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Admin user deleted successfully. Go to /admin/login and click 'Setup new password' to create a new account."
    });

  } catch (error) {
    return NextResponse.json({
      error: "An error occurred",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// GET endpoint to check status
export async function GET() {
  return NextResponse.json({
    instructions: "POST to this endpoint with { secretKey: 'RESET_ADMIN_2024' } to delete the admin user and create a fresh account",
    warning: "Make sure you have SUPABASE_SERVICE_ROLE_KEY in your Vercel environment variables"
  });
}
