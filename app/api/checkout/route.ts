import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe, calculateBookingTotal, StudioType, BookingLength, StudioPricing, AddonPricing, DEFAULT_STUDIOS, DEFAULT_ADDONS } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

async function loadPricing(): Promise<{ studios: StudioPricing[]; addons: AddonPricing[] }> {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')
      .eq('page', 'pricing')
      .eq('section', 'config');

    if (error || !data || data.length === 0) {
      return { studios: DEFAULT_STUDIOS, addons: DEFAULT_ADDONS };
    }

    let studios = DEFAULT_STUDIOS;
    let addons = DEFAULT_ADDONS;

    data.forEach((item: { key: string; value: string }) => {
      if (item.key === 'studios') {
        try {
          studios = JSON.parse(item.value);
        } catch (e) {
          console.error('Error parsing studios:', e);
        }
      }
      if (item.key === 'addons') {
        try {
          addons = JSON.parse(item.value);
        } catch (e) {
          console.error('Error parsing addons:', e);
        }
      }
    });

    return { studios, addons };
  } catch (err) {
    console.error('Error loading pricing:', err);
    return { studios: DEFAULT_STUDIOS, addons: DEFAULT_ADDONS };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studio,
      bookingLength,
      bookingDate,
      name,
      email,
      phone,
      cameraLens,
      videoSwitcher,
      accessories,
      guestCount,
      comments,
    } = body;

    // Validate required fields
    if (!studio || !bookingLength || !bookingDate || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Load pricing from database
    const { studios, addons } = await loadPricing();

    // Validate studio exists
    const studioData = studios.find(s => s.id === studio);
    if (!studioData) {
      return NextResponse.json(
        { error: 'Invalid studio selection' },
        { status: 400 }
      );
    }

    // Calculate total with dynamic pricing
    const { total, breakdown } = calculateBookingTotal(
      studio as StudioType,
      bookingLength as BookingLength,
      { cameraLens, videoSwitcher, accessories, guestCount },
      studios,
      addons
    );

    if (total === 0) {
      return NextResponse.json(
        { error: 'Invalid booking configuration' },
        { status: 400 }
      );
    }

    // Format booking date for display
    const bookingDateObj = new Date(bookingDate);
    const formattedDate = bookingDateObj.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = bookingDateObj.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Create line items for Stripe
    const lineItems = breakdown.map((item) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: item.item,
        },
        unit_amount: item.price,
      },
      quantity: 1,
    }));

    // Create Stripe Checkout Session
    const stripe = getServerStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/booking?cancelled=true`,
      customer_email: email,
      metadata: {
        studio,
        bookingLength,
        bookingDate,
        name,
        email,
        phone: phone || '',
        cameraLens: cameraLens || '',
        videoSwitcher: videoSwitcher || '',
        accessories: accessories || '',
        guestCount: guestCount?.toString() || '0',
        comments: comments || '',
      },
      payment_intent_data: {
        metadata: {
          studio,
          bookingDate: `${formattedDate} at ${formattedTime}`,
          customerName: name,
          customerEmail: email,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
