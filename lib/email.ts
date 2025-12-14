import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for server-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface EmailTemplate {
  subject: string;
  headerMessage: string;
  introText?: string;
  bodyText?: string;
  footerMessage: string;
}

// Fetch email templates from database
export async function getEmailTemplates(): Promise<{
  booking: EmailTemplate;
  deposit: EmailTemplate;
}> {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('key, value')
      .eq('page', 'email')
      .eq('section', 'templates');

    if (error || !data) {
      return {
        booking: DEFAULT_EMAIL_TEMPLATES.bookingConfirmation,
        deposit: DEFAULT_EMAIL_TEMPLATES.depositConfirmation,
      };
    }

    const templates: Record<string, string> = {};
    data.forEach((item: { key: string; value: string }) => {
      templates[item.key] = item.value;
    });

    return {
      booking: {
        subject: templates.booking_subject || DEFAULT_EMAIL_TEMPLATES.bookingConfirmation.subject,
        headerMessage: templates.booking_header || DEFAULT_EMAIL_TEMPLATES.bookingConfirmation.headerMessage,
        introText: templates.booking_intro || DEFAULT_EMAIL_TEMPLATES.bookingConfirmation.introText,
        bodyText: templates.booking_body || DEFAULT_EMAIL_TEMPLATES.bookingConfirmation.bodyText,
        footerMessage: templates.booking_footer || DEFAULT_EMAIL_TEMPLATES.bookingConfirmation.footerMessage,
      },
      deposit: {
        subject: templates.deposit_subject || DEFAULT_EMAIL_TEMPLATES.depositConfirmation.subject,
        headerMessage: templates.deposit_header || DEFAULT_EMAIL_TEMPLATES.depositConfirmation.headerMessage,
        introText: templates.deposit_intro || DEFAULT_EMAIL_TEMPLATES.depositConfirmation.introText,
        bodyText: templates.deposit_body || DEFAULT_EMAIL_TEMPLATES.depositConfirmation.bodyText,
        footerMessage: templates.deposit_footer || DEFAULT_EMAIL_TEMPLATES.depositConfirmation.footerMessage,
      },
    };
  } catch (err) {
    console.error('Error fetching email templates:', err);
    return {
      booking: DEFAULT_EMAIL_TEMPLATES.bookingConfirmation,
      deposit: DEFAULT_EMAIL_TEMPLATES.depositConfirmation,
    };
  }
}

// Save customer contact to database
export async function saveCustomerContact(data: {
  email: string;
  name: string;
  phone?: string;
  source: 'booking' | 'enquiry' | 'membership';
  studio?: string;
}): Promise<void> {
  try {
    await supabase
      .from('customer_contacts')
      .upsert({
        email: data.email,
        name: data.name,
        phone: data.phone,
        source: data.source,
        studio: data.studio,
        total_bookings: 1,
        last_booking_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'email',
      });
  } catch (err) {
    console.error('Error saving customer contact:', err);
  }
}

// Create Gmail SMTP transporter
function getTransporter() {
  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password,
    },
  });
}

export interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  studioName: string;
  bookingDate: string;
  bookingTime: string;
  paymentType: 'deposit' | 'full';
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  breakdown: { item: string; price: number }[];
  phone?: string;
  comments?: string;
}

// Default email templates - can be customized via admin
export const DEFAULT_EMAIL_TEMPLATES = {
  bookingConfirmation: {
    subject: 'Booking Confirmation - East Dock Studios',
    headerMessage: 'Thank you for your booking!',
    introText: "We're excited to welcome you to our studio. Below you'll find all the details for your upcoming session.",
    bodyText: "Please arrive 10 minutes before your scheduled time to allow for setup. If you have any special requirements or equipment needs, please let us know in advance.",
    footerMessage: 'We look forward to seeing you!',
  },
  depositConfirmation: {
    subject: 'Deposit Received - East Dock Studios Booking',
    headerMessage: 'Thank you for your deposit!',
    introText: "Your booking is now secured with a 50% deposit. Please remember to pay the remaining balance when you arrive at the studio.",
    bodyText: "We recommend arriving 10 minutes early to complete payment and get set up. Payment can be made by card on arrival.",
    footerMessage: 'Your booking is now confirmed. Please remember to pay the remaining balance on arrival.',
  },
};

// How to get to us information
export const LOCATION_INFO = {
  studioDockOne: {
    name: 'Studio Dock One (E16)',
    address: 'East Dock Studios, Royal Victoria Dock, London E16',
    directions: `
<strong>By DLR:</strong> Take the DLR to Royal Victoria station (5 min walk)
<strong>By Car:</strong> Free parking available on site. Use postcode E16 1XL for sat nav.
<strong>By Bus:</strong> Routes 473, 474 stop nearby on Victoria Dock Road
    `.trim(),
    nearestStation: 'Royal Victoria DLR',
    parking: 'Free on-site parking available',
  },
  studioDockTwo: {
    name: 'Studio Dock Two (E20)',
    address: 'East Dock Studios, Queen Elizabeth Olympic Park, London E20',
    directions: `
<strong>By Underground/Overground:</strong> Stratford station (10 min walk)
<strong>By Car:</strong> Pay & display parking in Westfield Stratford. Use postcode E20 1EJ.
<strong>By Bus:</strong> Multiple routes serve Stratford bus station
    `.trim(),
    nearestStation: 'Stratford (Underground, Overground, DLR, Elizabeth Line)',
    parking: 'Westfield Stratford car park nearby',
  },
  studioWharf: {
    name: 'Studio Wharf (LUX)',
    address: 'East Dock Studios, Canary Wharf, London E14',
    directions: `
<strong>By Underground:</strong> Canary Wharf (Jubilee Line) - 5 min walk
<strong>By DLR:</strong> Heron Quays or West India Quay stations
<strong>By Car:</strong> Underground parking available at Canary Wharf. Use postcode E14 5AB.
    `.trim(),
    nearestStation: 'Canary Wharf (Jubilee Line)',
    parking: 'Underground parking at Canary Wharf',
  },
};

export function generateBookingEmailHTML(data: BookingEmailData, template: EmailTemplate): string {
  const isDeposit = data.paymentType === 'deposit';
  const studioKey = data.studioName.toLowerCase().includes('dock one') || data.studioName.toLowerCase().includes('studio-dock-one') ? 'studioDockOne'
    : data.studioName.toLowerCase().includes('dock two') || data.studioName.toLowerCase().includes('studio-dock-two') ? 'studioDockTwo'
    : 'studioWharf';
  const location = LOCATION_INFO[studioKey];

  const breakdownHTML = data.breakdown.map(item =>
    `<tr>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.item}</td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">£${(item.price / 100).toFixed(2)}</td>
    </tr>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">

  <!-- Header -->
  <div style="background: #1a1a1a; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">East Dock Studios</h1>
    <p style="margin: 10px 0 0; opacity: 0.9;">${template.headerMessage}</p>
  </div>

  <!-- Main Content -->
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">

    <p style="margin-top: 0;">Hi ${data.customerName},</p>

    ${template.introText ? `<p style="margin: 15px 0; color: #333;">${template.introText}</p>` : ''}

    ${isDeposit ? `
    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <strong>Deposit Payment Received</strong><br>
      Your booking is confirmed! Please pay the remaining balance of <strong>£${(data.remainingBalance / 100).toFixed(2)}</strong> on arrival.
    </div>
    ` : `
    <div style="background: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <strong>Payment Complete</strong><br>
      Your booking is fully paid and confirmed!
    </div>
    `}

    ${template.bodyText ? `<p style="margin: 15px 0; color: #555; line-height: 1.6;">${template.bodyText}</p>` : ''}

    <!-- Booking Details -->
    <h2 style="font-size: 18px; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Booking Details</h2>

    <table style="width: 100%; margin: 20px 0;">
      <tr>
        <td style="padding: 8px 0; color: #666;">Studio:</td>
        <td style="padding: 8px 0; font-weight: 600;">${data.studioName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Date:</td>
        <td style="padding: 8px 0; font-weight: 600;">${data.bookingDate}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #666;">Time:</td>
        <td style="padding: 8px 0; font-weight: 600;">${data.bookingTime}</td>
      </tr>
      ${data.phone ? `
      <tr>
        <td style="padding: 8px 0; color: #666;">Contact Phone:</td>
        <td style="padding: 8px 0;">${data.phone}</td>
      </tr>
      ` : ''}
    </table>

    <!-- Price Breakdown -->
    <h3 style="font-size: 16px; margin-top: 30px;">Price Breakdown</h3>
    <table style="width: 100%; border-collapse: collapse;">
      ${breakdownHTML}
      <tr style="font-weight: bold;">
        <td style="padding: 12px 0; border-top: 2px solid #1a1a1a;">Total</td>
        <td style="padding: 12px 0; border-top: 2px solid #1a1a1a; text-align: right;">£${(data.totalAmount / 100).toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: ${isDeposit ? '#28a745' : '#333'};">Amount Paid</td>
        <td style="padding: 8px 0; text-align: right; color: ${isDeposit ? '#28a745' : '#333'};">£${(data.amountPaid / 100).toFixed(2)}</td>
      </tr>
      ${isDeposit ? `
      <tr>
        <td style="padding: 8px 0; color: #dc3545; font-weight: 600;">Remaining Balance (due on arrival)</td>
        <td style="padding: 8px 0; text-align: right; color: #dc3545; font-weight: 600;">£${(data.remainingBalance / 100).toFixed(2)}</td>
      </tr>
      ` : ''}
    </table>

    ${data.comments ? `
    <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
      <strong>Your Comments:</strong><br>
      ${data.comments}
    </div>
    ` : ''}

    <!-- How to Get Here -->
    <div style="margin-top: 30px; padding: 20px; background: #f0f7ff; border-radius: 8px; border-left: 4px solid #0066cc;">
      <h3 style="margin-top: 0; color: #0066cc;">How to Find Us</h3>

      <p style="margin: 10px 0;"><strong>${location.name}</strong></p>
      <p style="margin: 5px 0; color: #666;">${location.address}</p>

      <div style="margin-top: 15px;">
        ${location.directions}
      </div>

      <p style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #cce0ff;">
        <strong>Parking:</strong> ${location.parking}
      </p>
    </div>

    <!-- Footer Message -->
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666;">
      ${template.footerMessage}
    </p>

    <p style="color: #666;">
      If you have any questions, please don't hesitate to contact us.<br>
      <a href="mailto:admin@eastdockstudios.co.uk" style="color: #0066cc;">admin@eastdockstudios.co.uk</a>
    </p>

  </div>

  <!-- Footer -->
  <div style="background: #f8f9fa; padding: 20px; text-align: center; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="margin: 0; font-size: 14px; color: #666;">
      East Dock Studios<br>
      <a href="https://www.eastdockstudios.co.uk" style="color: #0066cc;">www.eastdockstudios.co.uk</a>
    </p>
  </div>

</body>
</html>
  `.trim();
}

export async function sendBookingConfirmationEmail(data: BookingEmailData, customTemplate?: typeof DEFAULT_EMAIL_TEMPLATES.bookingConfirmation): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      console.warn('SMTP not configured, skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    const isDeposit = data.paymentType === 'deposit';
    const template = customTemplate || (isDeposit ? DEFAULT_EMAIL_TEMPLATES.depositConfirmation : DEFAULT_EMAIL_TEMPLATES.bookingConfirmation);

    const html = generateBookingEmailHTML(data, template);

    await transporter.sendMail({
      from: `"East Dock Studios" <${process.env.SMTP_EMAIL}>`,
      to: data.customerEmail,
      subject: template.subject,
      html,
      replyTo: process.env.SMTP_EMAIL,
    });

    console.log('Customer confirmation email sent to:', data.customerEmail);
    return { success: true };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// Send notification to admin/studio about new booking
export async function sendAdminNotificationEmail(data: BookingEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    const adminEmail = process.env.SMTP_EMAIL || 'admin@eastdockstudios.co.uk';
    const isDeposit = data.paymentType === 'deposit';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Booking</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <h1 style="color: #1a1a1a;">New Booking Received</h1>

  <div style="background: ${isDeposit ? '#fff3cd' : '#d4edda'}; padding: 15px; border-radius: 6px; margin: 20px 0;">
    <strong>${isDeposit ? '50% Deposit Paid' : 'Full Payment Received'}</strong>
  </div>

  <h2>Customer Details</h2>
  <ul>
    <li><strong>Name:</strong> ${data.customerName}</li>
    <li><strong>Email:</strong> ${data.customerEmail}</li>
    <li><strong>Phone:</strong> ${data.phone || 'Not provided'}</li>
  </ul>

  <h2>Booking Details</h2>
  <ul>
    <li><strong>Studio:</strong> ${data.studioName}</li>
    <li><strong>Date:</strong> ${data.bookingDate}</li>
    <li><strong>Time:</strong> ${data.bookingTime}</li>
  </ul>

  <h2>Payment</h2>
  <ul>
    <li><strong>Total:</strong> £${(data.totalAmount / 100).toFixed(2)}</li>
    <li><strong>Paid:</strong> £${(data.amountPaid / 100).toFixed(2)}</li>
    ${isDeposit ? `<li><strong>Remaining Balance:</strong> £${(data.remainingBalance / 100).toFixed(2)}</li>` : ''}
  </ul>

  ${data.comments ? `
  <h2>Customer Comments</h2>
  <p style="background: #f5f5f5; padding: 15px; border-radius: 4px;">${data.comments}</p>
  ` : ''}

</body>
</html>
    `.trim();

    await transporter.sendMail({
      from: `"East Dock Studios Bookings" <${process.env.SMTP_EMAIL}>`,
      to: adminEmail,
      subject: `New Booking: ${data.studioName} - ${data.bookingDate}`,
      html,
    });

    console.log('Admin notification email sent');
    return { success: true };
  } catch (err) {
    console.error('Admin email error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
