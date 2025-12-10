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
      paymentType = 'full', // 'deposit' or 'full'
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

    // Calculate payment amount based on payment type
    const isDeposit = paymentType === 'deposit';
    const depositAmount = Math.round(total / 2);
    const paymentAmount = isDeposit ? depositAmount : total;
    const remainingBalance = isDeposit ? total - depositAmount : 0;

    // Create line items for Stripe
    let lineItems;
    if (isDeposit) {
      // For deposit, create a single line item with deposit description
      lineItems = [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `50% Deposit - ${studioData.name}`,
            description: `Deposit to confirm booking on ${formattedDate}. Remaining balance: £${(remainingBalance / 100).toFixed(2)} due on arrival.`,
          },
          unit_amount: depositAmount,
        },
        quantity: 1,
      }];
    } else {
      // For full payment, show all line items
      lineItems = breakdown.map((item) => ({
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.item,
          },
          unit_amount: item.price,
        },
        quantity: 1,
      }));
    }

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
        studioName: studioData.name,
        bookingLength,
        bookingDate,
        formattedDate: `${formattedDate} at ${formattedTime}`,
        name,
        email,
        phone: phone || '',
        cameraLens: cameraLens || '',
        videoSwitcher: videoSwitcher || '',
        accessories: accessories || '',
        guestCount: guestCount?.toString() || '0',
        comments: comments || '',
        paymentType,
        totalAmount: total.toString(),
        amountPaid: paymentAmount.toString(),
        remainingBalance: remainingBalance.toString(),
        breakdown: JSON.stringify(breakdown),
      },
      payment_intent_data: {
        metadata: {
          studio,
          studioName: studioData.name,
          bookingDate: `${formattedDate} at ${formattedTime}`,
          customerName: name,
          customerEmail: email,
          paymentType,
          totalAmount: `£${(total / 100).toFixed(2)}`,
          amountPaid: `£${(paymentAmount / 100).toFixed(2)}`,
          remainingBalance: isDeposit ? `£${(remainingBalance / 100).toFixed(2)}` : '£0.00',
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
