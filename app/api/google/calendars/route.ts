import { NextResponse } from 'next/server';
import { listCalendars, isConnected } from '@/lib/googleCalendar';

export async function GET() {
  try {
    const connected = await isConnected();

    if (!connected) {
      return NextResponse.json(
        { error: 'Not connected to Google Calendar' },
        { status: 401 }
      );
    }

    const calendars = await listCalendars();

    return NextResponse.json({
      calendars: calendars.map(cal => ({
        id: cal.id,
        summary: cal.summary,
        description: cal.description,
        primary: cal.primary,
        backgroundColor: cal.backgroundColor,
      })),
    });
  } catch (error) {
    console.error('Error listing calendars:', error);
    return NextResponse.json(
      { error: 'Failed to list calendars' },
      { status: 500 }
    );
  }
}
