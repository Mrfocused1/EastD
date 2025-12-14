import { NextRequest, NextResponse } from 'next/server';
import { getBusyTimes, checkAvailability } from '@/lib/googleCalendar';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const studioSlug = searchParams.get('studio');
  const dateStr = searchParams.get('date');
  const startTime = searchParams.get('startTime');
  const duration = searchParams.get('duration');

  if (!studioSlug) {
    return NextResponse.json(
      { error: 'Studio slug is required' },
      { status: 400 }
    );
  }

  try {
    // If checking specific time slot availability
    if (dateStr && startTime && duration) {
      const date = new Date(dateStr);
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDateTime = new Date(date);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + parseInt(duration));

      const available = await checkAvailability(studioSlug, startDateTime, endDateTime);

      return NextResponse.json({ available });
    }

    // If getting busy times for a date
    if (dateStr) {
      const date = new Date(dateStr);
      const busyTimes = await getBusyTimes(studioSlug, date);

      return NextResponse.json({
        busyTimes: busyTimes.map(bt => ({
          start: bt.start.toISOString(),
          end: bt.end.toISOString(),
        })),
      });
    }

    return NextResponse.json(
      { error: 'Date is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
