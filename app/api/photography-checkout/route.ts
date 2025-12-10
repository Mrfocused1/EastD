import { NextRequest, NextResponse } from "next/server";
import { getServerStripe } from "@/lib/stripe";

// Photography pricing in pence
const PHOTOGRAPHY_PRICING = {
  bookingLength: {
    "1hr": { label: "1 Hour Session", price: 7500 },
    "2hrs": { label: "2 Hour Session", price: 12500 },
    "halfday": { label: "Half Day (4 Hours)", price: 20000 },
    "fullday": { label: "Full Day (8 Hours)", price: 35000 },
  },
  equipment: {
    "none": { label: "No additional equipment", price: 0 },
    "lighting": { label: "Additional Lighting", price: 2500 },
    "backdrops": { label: "Extra Backdrops", price: 1500 },
    "props": { label: "Props Package", price: 3000 },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      bookingDate,
      shootType,
      bookingLength,
      numberOfPeople,
      equipmentNeeds,
      comments,
    } = body;

    // Validate required fields
    if (!name || !email || !bookingLength || !bookingDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate pricing
    const lengthPricing = PHOTOGRAPHY_PRICING.bookingLength[bookingLength as keyof typeof PHOTOGRAPHY_PRICING.bookingLength];
    if (!lengthPricing) {
      return NextResponse.json(
        { error: "Invalid booking length" },
        { status: 400 }
      );
    }

    const lineItems = [];

    // Add base session price
    lineItems.push({
      price_data: {
        currency: "gbp",
        product_data: {
          name: `Photography ${lengthPricing.label}`,
          description: `${shootType || "Photography"} session`,
        },
        unit_amount: lengthPricing.price,
      },
      quantity: 1,
    });

    // Add equipment if selected
    if (equipmentNeeds && equipmentNeeds !== "none") {
      const equipPricing = PHOTOGRAPHY_PRICING.equipment[equipmentNeeds as keyof typeof PHOTOGRAPHY_PRICING.equipment];
      if (equipPricing && equipPricing.price > 0) {
        lineItems.push({
          price_data: {
            currency: "gbp",
            product_data: {
              name: equipPricing.label,
            },
            unit_amount: equipPricing.price,
          },
          quantity: 1,
        });
      }
    }

    // Format booking date for display
    const bookingDateObj = new Date(bookingDate);
    const formattedDate = bookingDateObj.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const formattedTime = bookingDateObj.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const stripe = getServerStripe();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${request.headers.get("origin")}/booking/success?session_id={CHECKOUT_SESSION_ID}&type=photography`,
      cancel_url: `${request.headers.get("origin")}/booking?studio=photography&cancelled=true`,
      customer_email: email,
      metadata: {
        type: "photography",
        bookingLength,
        bookingDate,
        shootType: shootType || "",
        numberOfPeople: numberOfPeople || "",
        equipmentNeeds: equipmentNeeds || "",
        name,
        email,
        phone: phone || "",
        comments: comments || "",
      },
      payment_intent_data: {
        metadata: {
          type: "photography",
          bookingDate: `${formattedDate} at ${formattedTime}`,
          customerName: name,
          customerEmail: email,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Photography checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
