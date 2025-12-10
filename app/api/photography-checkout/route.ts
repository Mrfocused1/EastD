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
      paymentType = "full", // 'deposit' or 'full'
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

    // Calculate total price
    let total = lengthPricing.price;
    const breakdown: { item: string; price: number }[] = [
      { item: `Photography ${lengthPricing.label}`, price: lengthPricing.price },
    ];

    // Add equipment if selected
    if (equipmentNeeds && equipmentNeeds !== "none") {
      const equipPricing = PHOTOGRAPHY_PRICING.equipment[equipmentNeeds as keyof typeof PHOTOGRAPHY_PRICING.equipment];
      if (equipPricing && equipPricing.price > 0) {
        total += equipPricing.price;
        breakdown.push({ item: equipPricing.label, price: equipPricing.price });
      }
    }

    // Calculate payment amount based on payment type
    const isDeposit = paymentType === "deposit";
    const depositAmount = Math.round(total / 2);
    const paymentAmount = isDeposit ? depositAmount : total;
    const remainingBalance = isDeposit ? total - depositAmount : 0;

    // Create line items for Stripe
    let lineItems;
    if (isDeposit) {
      // For deposit, create a single line item
      lineItems = [{
        price_data: {
          currency: "gbp",
          product_data: {
            name: `50% Deposit - Photography Session`,
            description: `Deposit to confirm booking on ${bookingDate}. Remaining balance: £${(remainingBalance / 100).toFixed(2)} due on arrival.`,
          },
          unit_amount: depositAmount,
        },
        quantity: 1,
      }];
    } else {
      // For full payment, show all line items
      lineItems = breakdown.map((item) => ({
        price_data: {
          currency: "gbp",
          product_data: {
            name: item.item,
            description: shootType ? `${shootType} session` : undefined,
          },
          unit_amount: item.price,
        },
        quantity: 1,
      }));
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
        studioName: "Photography Studio",
        bookingLength,
        bookingDate,
        formattedDate: `${formattedDate} at ${formattedTime}`,
        shootType: shootType || "",
        numberOfPeople: numberOfPeople || "",
        equipmentNeeds: equipmentNeeds || "",
        name,
        email,
        phone: phone || "",
        comments: comments || "",
        paymentType,
        totalAmount: total.toString(),
        amountPaid: paymentAmount.toString(),
        remainingBalance: remainingBalance.toString(),
        breakdown: JSON.stringify(breakdown),
      },
      payment_intent_data: {
        metadata: {
          type: "photography",
          studioName: "Photography Studio",
          bookingDate: `${formattedDate} at ${formattedTime}`,
          customerName: name,
          customerEmail: email,
          paymentType,
          totalAmount: `£${(total / 100).toFixed(2)}`,
          amountPaid: `£${(paymentAmount / 100).toFixed(2)}`,
          remainingBalance: isDeposit ? `£${(remainingBalance / 100).toFixed(2)}` : "£0.00",
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
