import { google, calendar_v3 } from 'googleapis';
import { supabaseServer as supabase } from './supabase-server';

// OAuth2 client configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes required for calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events',
];

// Types
export interface StoredTokens {
  id: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expiry_date: number;
  scope: string;
}

export interface StudioCalendar {
  id: string;
  studio_slug: string;
  studio_name: string;
  calendar_id: string | null;
  calendar_name: string | null;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

// Generate OAuth URL for admin to connect Google account
export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent to always get refresh token
  });
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string): Promise<StoredTokens | null> {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      console.error('Missing tokens in response');
      return null;
    }

    // Store tokens in database
    const { data, error } = await supabase
      .from('google_oauth_tokens')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001', // Single row for the account
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type || 'Bearer',
        expiry_date: tokens.expiry_date || Date.now() + 3600000,
        scope: tokens.scope || SCOPES.join(' '),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing tokens:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    return null;
  }
}

// Get stored tokens from database
export async function getStoredTokens(): Promise<StoredTokens | null> {
  const { data, error } = await supabase
    .from('google_oauth_tokens')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

// Get authenticated OAuth client with valid tokens
async function getAuthenticatedClient(): Promise<typeof oauth2Client | null> {
  const tokens = await getStoredTokens();

  if (!tokens) {
    return null;
  }

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: tokens.token_type,
    expiry_date: tokens.expiry_date,
  });

  // Check if token needs refresh (5 min buffer)
  if (tokens.expiry_date < Date.now() + 300000) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();

      // Update stored tokens
      await supabase
        .from('google_oauth_tokens')
        .update({
          access_token: credentials.access_token,
          expiry_date: credentials.expiry_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      oauth2Client.setCredentials(credentials);
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  return oauth2Client;
}

// Check if Google account is connected
export async function isConnected(): Promise<boolean> {
  const tokens = await getStoredTokens();
  return tokens !== null;
}

// Disconnect Google account
export async function disconnect(): Promise<boolean> {
  const { error } = await supabase
    .from('google_oauth_tokens')
    .delete()
    .eq('id', '00000000-0000-0000-0000-000000000001');

  if (error) {
    console.error('Error disconnecting:', error);
    return false;
  }

  // Also clear calendar mappings
  await supabase
    .from('studio_calendars')
    .update({ calendar_id: null, calendar_name: null })
    .neq('id', '');

  return true;
}

// List all calendars from connected Google account
export async function listCalendars(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return [];
  }

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const response = await calendar.calendarList.list();
    return response.data.items || [];
  } catch (error) {
    console.error('Error listing calendars:', error);
    return [];
  }
}

// Get studio calendar mappings
export async function getStudioCalendars(): Promise<StudioCalendar[]> {
  const { data, error } = await supabase
    .from('studio_calendars')
    .select('*')
    .order('studio_name');

  if (error) {
    console.error('Error fetching studio calendars:', error);
    return [];
  }

  return data || [];
}

// Update studio calendar mapping
export async function updateStudioCalendar(
  studioSlug: string,
  calendarId: string | null,
  calendarName: string | null
): Promise<boolean> {
  const { error } = await supabase
    .from('studio_calendars')
    .update({
      calendar_id: calendarId,
      calendar_name: calendarName,
      updated_at: new Date().toISOString(),
    })
    .eq('studio_slug', studioSlug);

  if (error) {
    console.error('Error updating studio calendar:', error);
    return false;
  }

  return true;
}

// Get calendar ID for a studio
export async function getCalendarIdForStudio(studioSlug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('studio_calendars')
    .select('calendar_id')
    .eq('studio_slug', studioSlug)
    .single();

  if (error || !data) {
    return null;
  }

  return data.calendar_id;
}

// Check availability for a specific time range
export async function checkAvailability(
  studioSlug: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const calendarId = await getCalendarIdForStudio(studioSlug);
  if (!calendarId) {
    // No calendar configured, assume available
    return true;
  }

  const auth = await getAuthenticatedClient();
  if (!auth) {
    // Can't check, assume available
    return true;
  }

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: true,
    });

    const events = response.data.items || [];
    // If there are any events in this time range, it's not available
    return events.length === 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    // On error, assume available
    return true;
  }
}

// Get busy times for a studio on a specific date
export async function getBusyTimes(
  studioSlug: string,
  date: Date
): Promise<{ start: Date; end: Date }[]> {
  const calendarId = await getCalendarIdForStudio(studioSlug);
  if (!calendarId) {
    return [];
  }

  const auth = await getAuthenticatedClient();
  if (!auth) {
    return [];
  }

  const calendar = google.calendar({ version: 'v3', auth });

  // Get start and end of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  try {
    const response = await calendar.events.list({
      calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    return events
      .filter(event => (event.start?.dateTime && event.end?.dateTime) || (event.start?.date && event.end?.date))
      .map(event => {
        // Handle all-day events (they have date instead of dateTime)
        if (event.start?.date && event.end?.date) {
          const startDate = new Date(event.start.date);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(event.end.date);
          endDate.setHours(23, 59, 59, 999);
          return { start: startDate, end: endDate };
        }
        // Regular timed events
        return {
          start: new Date(event.start!.dateTime!),
          end: new Date(event.end!.dateTime!),
        };
      });
  } catch (error) {
    console.error('Error getting busy times:', error);
    return [];
  }
}

// Create a calendar event for a booking
export async function createBookingEvent(
  studioSlug: string,
  booking: {
    name: string;
    email: string;
    phone: string;
    date: Date;
    startTime: string; // HH:MM format
    duration: number; // hours
    addons?: string[];
    comments?: string;
  }
): Promise<string | null> {
  const calendarId = await getCalendarIdForStudio(studioSlug);
  if (!calendarId) {
    console.log('No calendar configured for studio:', studioSlug);
    return null;
  }

  const auth = await getAuthenticatedClient();
  if (!auth) {
    console.error('Not authenticated with Google');
    return null;
  }

  const calendar = google.calendar({ version: 'v3', auth });

  // Parse start time
  const [hours, minutes] = booking.startTime.split(':').map(Number);
  const startDateTime = new Date(booking.date);
  startDateTime.setHours(hours, minutes, 0, 0);

  const endDateTime = new Date(startDateTime);
  endDateTime.setHours(endDateTime.getHours() + booking.duration);

  // Get studio display name
  const studioNames: Record<string, string> = {
    'studio-dock-one': 'Studio Dock One',
    'studio-dock-two': 'Studio Dock Two',
    'studio-wharf': 'Studio Wharf',
  };
  const studioName = studioNames[studioSlug] || studioSlug;

  // Build description
  let description = `Booking for ${booking.name}\n`;
  description += `Email: ${booking.email}\n`;
  description += `Phone: ${booking.phone}\n`;
  description += `Duration: ${booking.duration} hours\n`;

  if (booking.addons && booking.addons.length > 0) {
    description += `\nAdd-ons:\n${booking.addons.map(a => `- ${a}`).join('\n')}\n`;
  }

  if (booking.comments) {
    description += `\nComments: ${booking.comments}`;
  }

  try {
    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `${studioName} - ${booking.name}`,
        description,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'Europe/London',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'Europe/London',
        },
        colorId: '9', // Blue color
      },
    });

    return response.data.id || null;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}

// Delete a calendar event
export async function deleteBookingEvent(
  studioSlug: string,
  eventId: string
): Promise<boolean> {
  const calendarId = await getCalendarIdForStudio(studioSlug);
  if (!calendarId) {
    return false;
  }

  const auth = await getAuthenticatedClient();
  if (!auth) {
    return false;
  }

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    });
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
}
