import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe';
import { sendBookingConfirmationEmail, sendAdminNotificationEmail, BookingEmailData } from '@/lib/email';
import { createBookingEvent } from '@/lib/googleCalendar';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Create Supabase client for server-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Disable body parsing - we need raw body for signature verification
export const dynamic = 'force-dynamic';

async function getRawBody(request: NextRequest): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  const reader = request.body?.getReader();

  if (!reader) {
    throw new Error('No request body');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await getRawBody(request);
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const stripe = getServerStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;
      }

      case 'payment_intent.succeeded': {
        // Also handle payment_intent.succeeded as a backup
        console.log('Payment intent succeeded:', event.data.object);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata;

  if (!metadata) {
    console.error('No metadata in session');
    return;
  }

  // Check if this is a studio booking (has studio metadata)
  if (!metadata.studio) {
    console.log('Not a studio booking, skipping email');
    return;
  }

  try {
    // Parse booking date and time from metadata
    const formattedDate = metadata.formattedDate || metadata.bookingDate || '';
    const [datePart, timePart] = formattedDate.includes(' at ')
      ? formattedDate.split(' at ')
      : [formattedDate, ''];

    // Parse breakdown if available
    let breakdown: { item: string; price: number }[] = [];
    try {
      if (metadata.breakdown) {
        breakdown = JSON.parse(metadata.breakdown);
      }
    } catch (e) {
      console.error('Error parsing breakdown:', e);
    }

    const emailData: BookingEmailData = {
      customerName: metadata.name || 'Customer',
      customerEmail: metadata.email || session.customer_email || '',
      studioName: metadata.studioName || metadata.studio || 'Studio',
      bookingDate: datePart,
      bookingTime: timePart,
      paymentType: metadata.paymentType as 'deposit' | 'full' || 'full',
      totalAmount: parseInt(metadata.totalAmount || '0'),
      amountPaid: parseInt(metadata.amountPaid || '0'),
      remainingBalance: parseInt(metadata.remainingBalance || '0'),
      breakdown,
      phone: metadata.phone || undefined,
      comments: metadata.comments || undefined,
    };

    // Send confirmation email to customer
    const customerEmailResult = await sendBookingConfirmationEmail(emailData);
    if (customerEmailResult.success) {
      console.log('Customer confirmation email sent to:', emailData.customerEmail);
    } else {
      console.error('Failed to send customer email:', customerEmailResult.error);
    }

    // Send notification to admin
    const adminEmailResult = await sendAdminNotificationEmail(emailData);
    if (adminEmailResult.success) {
      console.log('Admin notification email sent');
    } else {
      console.error('Failed to send admin email:', adminEmailResult.error);
    }

    // Create Google Calendar event
    try {
      const studioSlug = metadata.studio;
      const bookingDateStr = metadata.bookingDate || '';

      // Parse the booking date and time
      // bookingDate format is typically "YYYY-MM-DDTHH:MM"
      const bookingDateTime = new Date(bookingDateStr);
      const startTime = bookingDateStr.split('T')[1]?.substring(0, 5) || '09:00';

      // Get duration from bookingDuration metadata (new structure)
      let duration = 2; // default 2 hours
      if (metadata.bookingDuration) {
        duration = parseInt(metadata.bookingDuration) || 2;
      } else {
        // Fallback for old booking length format
        const bookingLength = metadata.bookingLength || '';
        const hourMatch = bookingLength.match(/(\d+)/);
        if (hourMatch) {
          duration = parseInt(hourMatch[1]) || 2;
        }
      }

      // Parse equipment from metadata (new structure)
      const addons: string[] = [];
      if (metadata.equipment) {
        try {
          const equipment = JSON.parse(metadata.equipment);
          Object.entries(equipment as Record<string, number>).forEach(([id, qty]) => {
            if (qty && qty > 0) {
              addons.push(`${id}: ${qty}`);
            }
          });
        } catch (e) {
          console.error('Error parsing equipment:', e);
        }
      }
      // Fallback for old addon format
      if (metadata.cameraLens) addons.push(`Camera/Lens: ${metadata.cameraLens}`);
      if (metadata.videoSwitcher) addons.push(`Video Switcher: ${metadata.videoSwitcher}`);
      if (metadata.accessories) addons.push(`Accessories: ${metadata.accessories}`);

      // Add surcharge note if applicable
      if (metadata.hasSurcharge === 'true') {
        addons.push('Evening/Weekend Rate Applied (+15%)');
      }

      const eventId = await createBookingEvent(studioSlug, {
        name: metadata.name || 'Customer',
        email: metadata.email || session.customer_email || '',
        phone: metadata.phone || '',
        date: bookingDateTime,
        startTime,
        duration,
        addons: addons.length > 0 ? addons : undefined,
        comments: metadata.comments || undefined,
      });

      if (eventId) {
        console.log('Google Calendar event created:', eventId);
      } else {
        console.log('No calendar configured for studio, skipping event creation');
      }
    } catch (calendarError) {
      // Don't fail the webhook if calendar creation fails
      console.error('Error creating calendar event:', calendarError);
    }

    // Track discount usage if a discount was applied
    try {
      if (metadata.discountId && metadata.discountCode && metadata.discountAmount) {
        const discountAmount = parseInt(metadata.discountAmount);
        if (discountAmount > 0) {
          const originalTotal = parseInt(metadata.originalTotal || metadata.totalAmount || '0');
          const finalTotal = parseInt(metadata.totalAmount || '0');
          const bookingDateStr = metadata.bookingDate?.split('T')[0] || new Date().toISOString().split('T')[0];

          await supabase.from('discount_usage').insert({
            discount_code_id: metadata.discountId,
            customer_email: metadata.email || session.customer_email || '',
            customer_name: metadata.name || 'Customer',
            booking_date: bookingDateStr,
            studio: metadata.studioName || metadata.studio || 'Studio',
            original_amount: originalTotal,
            discount_amount: discountAmount,
            final_amount: finalTotal,
            stripe_session_id: session.id,
          });

          console.log('Discount usage recorded:', metadata.discountCode);
        }
      }
    } catch (discountError) {
      // Don't fail the webhook if discount tracking fails
      console.error('Error tracking discount usage:', discountError);
    }

  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}
