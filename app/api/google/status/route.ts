import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Direct database query to debug
    const { data, error } = await supabase
      .from('google_oauth_tokens')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    console.log('Status check - data:', data ? 'found' : 'null', 'error:', error?.message);

    const connected = !!data && !error;

    return NextResponse.json({
      connected,
      expiresAt: data?.expiry_date ? new Date(data.expiry_date).toISOString() : null,
      debug: {
        hasData: !!data,
        error: error?.message || null,
      }
    });
  } catch (error) {
    console.error('Error checking status:', error);
    return NextResponse.json(
      { error: 'Failed to check connection status', details: String(error) },
      { status: 500 }
    );
  }
}
