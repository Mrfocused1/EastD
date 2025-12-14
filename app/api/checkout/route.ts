import { NextRequest, NextResponse } from 'next/server';
import { getServerStripe, StudioType, BookingLength, StudioPricing, AddonPricing, DEFAULT_STUDIOS, DEFAULT_ADDONS, getAddonsForStudio, formatPrice } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';
import { hasEveningWeekendSurcharge, EVENING_WEEKEND_SURCHARGE } from '@/lib/studioConfig';

interface DiscountCode {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_booking_value: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  exclusive_email: string | null;
  valid_from: string;
  valid_until: string | null;
  applicable_studios: string[] | null;
  is_active: boolean;
}

async function validateAndGetDiscount(
  code: string,
  email: string,
  studio: string,
  bookingTotal: number
): Promise<{ valid: boolean; discount?: DiscountCode; discountAmount?: number; error?: string }> {
  if (!code) return { valid: false };

  const { data: discount, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single();

  if (error || !discount) {
    return { valid: false, error: 'Invalid discount code' };
  }

  const discountCode = discount as DiscountCode;

  // Validate the discount
  if (!discountCode.is_active) {
    return { valid: false, error: 'Discount code is no longer active' };
  }

  const now = new Date();
  const validFrom = new Date(discountCode.valid_from);
  if (now < validFrom) {
    return { valid: false, error: 'Discount code is not yet active' };
  }

  if (discountCode.valid_until) {
    const validUntil = new Date(discountCode.valid_until);
    if (now > validUntil) {
      return { valid: false, error: 'Discount code has expired' };
    }
  }

  if (discountCode.usage_limit && discountCode.usage_count >= discountCode.usage_limit) {
    return { valid: false, error: 'Discount code has reached its usage limit' };
  }

  if (discountCode.exclusive_email && email) {
    if (discountCode.exclusive_email.toLowerCase() !== email.toLowerCase()) {
      return { valid: false, error: 'Discount code is not available for this email' };
    }
  }

  if (discountCode.applicable_studios && discountCode.applicable_studios.length > 0) {
    if (!discountCode.applicable_studios.includes(studio)) {
      return { valid: false, error: 'Discount code is not valid for this studio' };
    }
  }

  if (discountCode.min_booking_value && bookingTotal < discountCode.min_booking_value) {
    return { valid: false, error: `Minimum booking value of £${(discountCode.min_booking_value / 100).toFixed(2)} required` };
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (discountCode.discount_type === 'percentage') {
    discountAmount = Math.round(bookingTotal * (discountCode.discount_value / 100));
  } else {
    discountAmount = Math.round(discountCode.discount_value * 100);
  }

  if (discountCode.max_discount_amount) {
    discountAmount = Math.min(discountAmount, discountCode.max_discount_amount);
  }

  discountAmount = Math.min(discountAmount, bookingTotal);

  return { valid: true, discount: discountCode, discountAmount };
}

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
      equipment = {}, // New equipment quantities object
      hasSurcharge = false,
      comments,
      paymentType = 'full', // 'deposit' or 'full'
      discountCode = null,
      discountId = null,
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

    // Find selected package
    const pkg = studioData.packages.find(p => p.id === bookingLength);
    if (!pkg) {
      return NextResponse.json(
        { error: 'Invalid booking length' },
        { status: 400 }
      );
    }

    // Calculate total with new equipment structure
    const breakdown: { item: string; price: number }[] = [];

    // Add studio package
    breakdown.push({
      item: `${studioData.name} - ${pkg.label}`,
      price: pkg.price,
    });

    // Add equipment costs
    const studioAddons = getAddonsForStudio(studio);
    Object.entries(equipment as Record<string, number>).forEach(([addonId, quantity]) => {
      if (quantity > 0) {
        const addon = studioAddons.find(a => a.id === addonId);
        if (addon) {
          const itemTotal = addon.price * quantity;
          breakdown.push({
            item: quantity > 1 ? `${addon.label} x${quantity}` : addon.label,
            price: itemTotal,
          });
        }
      }
    });

    let total = breakdown.reduce((sum, item) => sum + item.price, 0);

    // Apply evening/weekend surcharge if applicable
    const bookingDateObj = new Date(bookingDate);
    const bookingHour = bookingDateObj.getHours();
    const shouldApplySurcharge = hasEveningWeekendSurcharge(bookingDateObj, bookingHour);

    if (shouldApplySurcharge) {
      const surchargeAmount = Math.round(total * EVENING_WEEKEND_SURCHARGE);
      breakdown.push({ item: 'Evening/Weekend Surcharge (15%)', price: surchargeAmount });
      total += surchargeAmount;
    }

    // Validate and apply discount code
    let appliedDiscount: DiscountCode | null = null;
    let discountAmount = 0;
    if (discountCode) {
      const discountResult = await validateAndGetDiscount(discountCode, email, studio, total);
      if (discountResult.valid && discountResult.discount && discountResult.discountAmount) {
        appliedDiscount = discountResult.discount;
        discountAmount = discountResult.discountAmount;
        breakdown.push({ item: `Discount (${appliedDiscount.code})`, price: -discountAmount });
        total -= discountAmount;
      } else if (discountResult.error) {
        return NextResponse.json(
          { error: discountResult.error },
          { status: 400 }
        );
      }
    }

    if (total === 0) {
      return NextResponse.json(
        { error: 'Invalid booking configuration' },
        { status: 400 }
      );
    }

    // Format booking date for display
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
        bookingDuration: pkg.hours.toString(),
        bookingDate,
        formattedDate: `${formattedDate} at ${formattedTime}`,
        name,
        email,
        phone: phone || '',
        equipment: JSON.stringify(equipment),
        hasSurcharge: shouldApplySurcharge ? 'true' : 'false',
        comments: comments || '',
        paymentType,
        totalAmount: total.toString(),
        amountPaid: paymentAmount.toString(),
        remainingBalance: remainingBalance.toString(),
        breakdown: JSON.stringify(breakdown),
        discountCode: appliedDiscount?.code || '',
        discountId: appliedDiscount?.id || '',
        discountAmount: discountAmount.toString(),
        originalTotal: (total + discountAmount).toString(),
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
