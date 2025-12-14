import { NextRequest, NextResponse } from 'next/server';
import { getStudioCalendars, updateStudioCalendar } from '@/lib/googleCalendar';

// Get studio calendar mappings
export async function GET() {
  try {
    const studios = await getStudioCalendars();
    return NextResponse.json({ studios });
  } catch (error) {
    console.error('Error fetching studio calendars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch studio calendars' },
      { status: 500 }
    );
  }
}

// Update studio calendar mapping
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studioSlug, calendarId, calendarName } = body;

    if (!studioSlug) {
      return NextResponse.json(
        { error: 'Studio slug is required' },
        { status: 400 }
      );
    }

    const success = await updateStudioCalendar(studioSlug, calendarId, calendarName);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update studio calendar' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating studio calendar:', error);
    return NextResponse.json(
      { error: 'Failed to update studio calendar' },
      { status: 500 }
    );
  }
}
