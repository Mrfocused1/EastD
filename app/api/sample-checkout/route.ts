import { NextResponse } from "next/server";
import { getServerStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    const stripe = getServerStripe();

    // Create a checkout session for £1 test payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "Test Payment",
              description: "£1 test payment to verify Stripe integration",
            },
            unit_amount: 100, // £1.00 in pence
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.eastdockstudios.co.uk"}/sample/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.eastdockstudios.co.uk"}/sample`,
      customer_email: email || undefined,
      metadata: {
        type: "test_payment",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Sample checkout error:", error);
    let errorDetails = "Unknown error";
    let errorType = "unknown";

    if (error instanceof Error) {
      errorDetails = error.message;
      errorType = error.constructor.name;

      // Check for Stripe-specific error properties
      const stripeError = error as { type?: string; code?: string; statusCode?: number };
      if (stripeError.type) errorType = stripeError.type;
      if (stripeError.code) errorDetails = `${stripeError.code}: ${errorDetails}`;
    }

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: errorDetails,
        type: errorType,
        keyConfigured: !!process.env.STRIPE_SECRET_KEY,
        keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || "not set"
      },
      { status: 500 }
    );
  }
}
