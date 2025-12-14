import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for server-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface DiscountCode {
  id: string;
  code: string;
  description: string;
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, email, studio, bookingTotal } = body;

    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'No discount code provided' },
        { status: 400 }
      );
    }

    // Look up the discount code
    const { data: discount, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .single();

    if (error || !discount) {
      return NextResponse.json(
        { valid: false, error: 'Invalid discount code' },
        { status: 200 }
      );
    }

    const discountCode = discount as DiscountCode;

    // Check if code is active
    if (!discountCode.is_active) {
      return NextResponse.json(
        { valid: false, error: 'This discount code is no longer active' },
        { status: 200 }
      );
    }

    // Check valid_from date
    const now = new Date();
    const validFrom = new Date(discountCode.valid_from);
    if (now < validFrom) {
      return NextResponse.json(
        { valid: false, error: 'This discount code is not yet active' },
        { status: 200 }
      );
    }

    // Check valid_until date
    if (discountCode.valid_until) {
      const validUntil = new Date(discountCode.valid_until);
      if (now > validUntil) {
        return NextResponse.json(
          { valid: false, error: 'This discount code has expired' },
          { status: 200 }
        );
      }
    }

    // Check usage limit
    if (discountCode.usage_limit && discountCode.usage_count >= discountCode.usage_limit) {
      return NextResponse.json(
        { valid: false, error: 'This discount code has reached its usage limit' },
        { status: 200 }
      );
    }

    // Check exclusive email
    if (discountCode.exclusive_email && email) {
      if (discountCode.exclusive_email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { valid: false, error: 'This discount code is not available for your email' },
          { status: 200 }
        );
      }
    }

    // Check if studio is applicable
    if (discountCode.applicable_studios && discountCode.applicable_studios.length > 0 && studio) {
      if (!discountCode.applicable_studios.includes(studio)) {
        return NextResponse.json(
          { valid: false, error: 'This discount code is not valid for the selected studio' },
          { status: 200 }
        );
      }
    }

    // Check minimum booking value
    if (discountCode.min_booking_value && bookingTotal) {
      if (bookingTotal < discountCode.min_booking_value) {
        const minValue = (discountCode.min_booking_value / 100).toFixed(2);
        return NextResponse.json(
          { valid: false, error: `Minimum booking value of £${minValue} required for this code` },
          { status: 200 }
        );
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (bookingTotal) {
      if (discountCode.discount_type === 'percentage') {
        discountAmount = Math.round(bookingTotal * (discountCode.discount_value / 100));
      } else {
        // Fixed amount (stored in pounds, need to convert to pence)
        discountAmount = Math.round(discountCode.discount_value * 100);
      }

      // Apply max discount cap if set
      if (discountCode.max_discount_amount) {
        discountAmount = Math.min(discountAmount, discountCode.max_discount_amount);
      }

      // Ensure discount doesn't exceed total
      discountAmount = Math.min(discountAmount, bookingTotal);
    }

    return NextResponse.json({
      valid: true,
      discount: {
        id: discountCode.id,
        code: discountCode.code,
        type: discountCode.discount_type,
        value: discountCode.discount_value,
        discountAmount,
        description: discountCode.discount_type === 'percentage'
          ? `${discountCode.discount_value}% off`
          : `£${discountCode.discount_value.toFixed(2)} off`,
      },
    });
  } catch (error) {
    console.error('Discount validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate discount code' },
      { status: 500 }
    );
  }
}
