import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

// Validation schema for membership enquiries
const membershipSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional(),
  creatorType: z.string().min(1, "Creator type is required"),
  productionNeeds: z.string().max(2000, "Production needs too long").optional(),
  membershipType: z.string().min(1, "Membership type is required"),
  budgetRange: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate and sanitize input
    const validationResult = membershipSchema.safeParse(body);

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
    // For now, just log the enquiry
    console.log("New membership enquiry:", validatedData);

    // Example with Resend (uncomment when you have API key):
    /*
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send notification to team
    await resend.emails.send({
      from: 'membership@eastdocstudios.com',
      to: 'your-email@example.com',
      subject: `New Membership Enquiry from ${validatedData.name}`,
      html: `
        <h2>New Membership Enquiry</h2>
        <p><strong>Name:</strong> ${validatedData.name}</p>
        <p><strong>Email:</strong> ${validatedData.email}</p>
        <p><strong>Phone:</strong> ${validatedData.phone || 'Not provided'}</p>
        <p><strong>Creator Type:</strong> ${validatedData.creatorType}</p>
        <p><strong>Membership Type:</strong> ${validatedData.membershipType}</p>
        <p><strong>Budget Range:</strong> ${validatedData.budgetRange || 'Not specified'}</p>
        ${validatedData.productionNeeds ? `<p><strong>Production Needs:</strong> ${validatedData.productionNeeds}</p>` : ''}
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: 'membership@eastdocstudios.com',
      to: validatedData.email,
      subject: 'Thank you for your membership enquiry - East Dock Studios',
      html: `
        <h2>Thank you for your interest in East Dock Studios membership!</h2>
        <p>Hi ${validatedData.name},</p>
        <p>We've received your membership enquiry and our team will be in touch shortly to discuss your needs and create a tailored membership plan for you.</p>
        <p>In the meantime, feel free to browse our studios and services at eastdockstudios.co.uk</p>
        <p>Best regards,<br>The East Dock Studios Team</p>
      `,
    });
    */

    return NextResponse.json(
      { message: "Membership enquiry received successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Membership enquiry error:", error);
    return NextResponse.json(
      { error: "Failed to process membership enquiry" },
      { status: 500 }
    );
  }
}
