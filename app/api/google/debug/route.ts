import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  // Generate what the auth URL would look like
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId || 'MISSING');
  authUrl.searchParams.set('redirect_uri', redirectUri || 'MISSING');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');

  return NextResponse.json({
    config: {
      clientId: clientId ? `${clientId.substring(0, 20)}...` : 'MISSING',
      clientSecretSet: !!clientSecret,
      redirectUri: redirectUri || 'MISSING',
    },
    generatedAuthUrl: authUrl.toString(),
    instructions: {
      step1: 'Verify GOOGLE_CLIENT_ID matches your Google Cloud Console OAuth Client ID',
      step2: 'Verify redirect_uri EXACTLY matches what is in Google Cloud Console (including https://)',
      step3: 'Ensure OAuth Client type is "Web application" NOT "Desktop app"',
      step4: 'Ensure Google Calendar API is enabled at https://console.cloud.google.com/apis/library/calendar-json.googleapis.com',
    }
  });
}
