import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

// Validation schema
const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(20),
  studio: z.enum(["e16", "e20", "lux"], { errorMap: () => ({ message: "Invalid studio selection" }) }),
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  duration: z.string().optional(),
  bookingDate: z.string().optional(),
  bookingLength: z.string().optional(),
  cameraLens: z.string().optional(),
  videoSwitcher: z.string().optional(),
  accessories: z.string().optional(),
  comments: z.string().max(1000, "Comments too long").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate and sanitize input
    const validationResult = bookingSchema.safeParse(body);

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
    console.log("New booking request:", validatedData);

    // Example with Resend (uncomment when you have API key):
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'bookings@eastdocstudios.com',
      to: 'your-email@example.com',
      subject: `New Booking Request - ${studio.toUpperCase()}`,
      html: `
        <h2>New Studio Booking Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Studio:</strong> ${studio}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Duration:</strong> ${duration} hours</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
      `,
    });
    */

    return NextResponse.json(
      { message: "Booking request received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to process booking" },
      { status: 500 }
    );
  }
}
