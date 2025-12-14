import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/googleCalendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('OAuth callback received:', {
    hasCode: !!code,
    error,
    errorDescription,
    url: request.url
  });

  // Handle user denying access
  if (error) {
    console.error('OAuth error from Google:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/admin/calendar?error=${error}&desc=${encodeURIComponent(errorDescription || '')}`, request.url)
    );
  }

  if (!code) {
    console.error('No code received in callback');
    return NextResponse.redirect(
      new URL('/admin/calendar?error=no_code', request.url)
    );
  }

  try {
    console.log('Exchanging code for tokens...');
    const tokens = await getTokensFromCode(code);

    if (!tokens) {
      console.error('Token exchange returned null');
      return NextResponse.redirect(
        new URL('/admin/calendar?error=token_exchange_failed', request.url)
      );
    }

    console.log('Tokens stored successfully');
    // Success - redirect to admin calendar page
    return NextResponse.redirect(
      new URL('/admin/calendar?success=connected', request.url)
    );
  } catch (err) {
    console.error('OAuth callback error:', err);
    const errorMessage = err instanceof Error ? err.message : 'unknown';
    return NextResponse.redirect(
      new URL(`/admin/calendar?error=exception&msg=${encodeURIComponent(errorMessage)}`, request.url)
    );
  }
}
