import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

// Validation schema for photography bookings
const photographyBookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  bookingDate: z.string().optional(),
  shootType: z.string().optional(),
  bookingLength: z.string().optional(),
  numberOfPeople: z.string().optional(),
  equipmentNeeds: z.string().optional(),
  comments: z.string().max(1000, "Comments too long").optional(),
  formType: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate and sanitize input
    const validationResult = photographyBookingSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // TODO: Integrate with your email service (Resend, SendGrid, etc.)
    // For now, just log the booking
    console.log("New photography booking request:", validatedData);

    // Example with Resend (uncomment when you have API key):
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'bookings@eastdocstudios.com',
      to: 'your-email@example.com',
      subject: `New Photography Booking Request`,
      html: `
        <h2>New Photography Booking Request</h2>
        <p><strong>Name:</strong> ${validatedData.name}</p>
        <p><strong>Email:</strong> ${validatedData.email}</p>
        <p><strong>Phone:</strong> ${validatedData.phone}</p>
        <p><strong>Date:</strong> ${validatedData.bookingDate}</p>
        <p><strong>Type of Shoot:</strong> ${validatedData.shootType}</p>
        <p><strong>Booking Length:</strong> ${validatedData.bookingLength}</p>
        <p><strong>Number of People:</strong> ${validatedData.numberOfPeople}</p>
        <p><strong>Equipment Needs:</strong> ${validatedData.equipmentNeeds}</p>
        ${validatedData.comments ? `<p><strong>Comments:</strong> ${validatedData.comments}</p>` : ''}
      `,
    });
    */

    return NextResponse.json(
      { message: "Photography booking request received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Photography booking error:", error);
    return NextResponse.json(
      { error: "Failed to process photography booking" },
      { status: 500 }
    );
  }
}
