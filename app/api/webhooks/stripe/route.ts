import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe } from '@/lib/stripe';
import { sendBookingConfirmationEmail, sendAdminNotificationEmail, BookingEmailData } from '@/lib/email';
import Stripe from 'stripe';

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

  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}
