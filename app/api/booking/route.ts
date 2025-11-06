import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { name, email, phone, studio, date, time, duration } = body;

    if (!name || !email || !phone || !studio || !date || !time || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // TODO: Integrate with your email service (Resend, SendGrid, etc.)
    // For now, just log the booking
    console.log("New booking request:", body);

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
