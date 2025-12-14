import { NextResponse } from 'next/server';
import { disconnect } from '@/lib/googleCalendar';

export async function POST() {
  try {
    const success = await disconnect();

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to disconnect' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
