import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendCampaignEmail } from '@/lib/email';

// Create Supabase client for server-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
}

interface CustomerContact {
  id: string;
  email: string;
  name: string;
  subscribed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, templateId, testEmail } = body;

    // Get the template
    let template: EmailTemplate | null = null;

    if (templateId) {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      template = data;
    } else if (campaignId) {
      // Get campaign and its template
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('template_id, target_audience')
        .eq('id', campaignId)
        .single();

      if (campaignError || !campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }

      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', campaign.template_id)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: 'Campaign template not found' },
          { status: 404 }
        );
      }
      template = data;
    } else {
      return NextResponse.json(
        { error: 'Either campaignId or templateId is required' },
        { status: 400 }
      );
    }

    // Type guard to satisfy TypeScript
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // If test email provided, send only to that address
    if (testEmail) {
      const result = await sendCampaignEmail(
        testEmail,
        `[TEST] ${template.subject}`,
        template.body_html,
        'Test User'
      );

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: `Test email sent to ${testEmail}`,
          sent: 1,
        });
      } else {
        return NextResponse.json(
          { error: result.error || 'Failed to send test email' },
          { status: 500 }
        );
      }
    }

    // Get all subscribed contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('customer_contacts')
      .select('id, email, name, subscribed')
      .eq('subscribed', true);

    if (contactsError) {
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscribed contacts to send to',
        sent: 0,
      });
    }

    // Send emails to all contacts
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      const result = await sendCampaignEmail(
        contact.email,
        template.subject,
        template.body_html,
        contact.name
      );

      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${contact.email}: ${result.error}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Log the campaign send
    await supabase.from('campaign_sends').insert({
      campaign_id: campaignId || null,
      template_id: templateId,
      recipients_count: contacts.length,
      sent_count: sent,
      failed_count: failed,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Campaign sent to ${sent} contacts`,
      sent,
      failed,
      total: contacts.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
    });
  } catch (error) {
    console.error('Campaign send error:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign' },
      { status: 500 }
    );
  }
}
