"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, MapPin, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import SaveButton from "@/components/admin/SaveButton";
import { supabase } from "@/lib/supabase";

export default function EmailSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Booking Confirmation Email
  const [bookingSubject, setBookingSubject] = useState("Booking Confirmation - East Dock Studios");
  const [bookingHeader, setBookingHeader] = useState("Thank you for your booking!");
  const [bookingIntro, setBookingIntro] = useState("We're excited to welcome you to our studio. Below you'll find all the details for your upcoming session.");
  const [bookingBody, setBookingBody] = useState("Please arrive 10 minutes before your scheduled time to allow for setup. If you have any special requirements or equipment needs, please let us know in advance.");
  const [bookingFooter, setBookingFooter] = useState("We look forward to seeing you!");

  // Deposit Confirmation Email
  const [depositSubject, setDepositSubject] = useState("Deposit Received - East Dock Studios Booking");
  const [depositHeader, setDepositHeader] = useState("Thank you for your deposit!");
  const [depositIntro, setDepositIntro] = useState("Your booking is now secured with a 50% deposit. Please remember to pay the remaining balance when you arrive at the studio.");
  const [depositBody, setDepositBody] = useState("We recommend arriving 10 minutes early to complete payment and get set up. Payment can be made by card on arrival.");
  const [depositFooter, setDepositFooter] = useState("Your booking is now confirmed. Please remember to pay the remaining balance on arrival.");

  // Admin Settings
  const [adminEmail, setAdminEmail] = useState("info@eastdockstudios.co.uk");
  const [fromEmail, setFromEmail] = useState("bookings@eastdockstudios.site");
  const [replyToEmail, setReplyToEmail] = useState("info@eastdockstudios.co.uk");

  // Studio E16 Location
  const [e16Address, setE16Address] = useState("East Dock Studios, Royal Victoria Dock, London E16");
  const [e16Directions, setE16Directions] = useState(`By DLR: Take the DLR to Royal Victoria station (5 min walk)
By Car: Free parking available on site. Use postcode E16 1XL for sat nav.
By Bus: Routes 473, 474 stop nearby on Victoria Dock Road`);
  const [e16Parking, setE16Parking] = useState("Free on-site parking available");
  const [e16Station, setE16Station] = useState("Royal Victoria DLR");

  // Studio E20 Location
  const [e20Address, setE20Address] = useState("East Dock Studios, Queen Elizabeth Olympic Park, London E20");
  const [e20Directions, setE20Directions] = useState(`By Underground/Overground: Stratford station (10 min walk)
By Car: Pay & display parking in Westfield Stratford. Use postcode E20 1EJ.
By Bus: Multiple routes serve Stratford bus station`);
  const [e20Parking, setE20Parking] = useState("Westfield Stratford car park nearby");
  const [e20Station, setE20Station] = useState("Stratford (Underground, Overground, DLR, Elizabeth Line)");

  // Studio LUX Location
  const [luxAddress, setLuxAddress] = useState("East Dock Studios, Canary Wharf, London E14");
  const [luxDirections, setLuxDirections] = useState(`By Underground: Canary Wharf (Jubilee Line) - 5 min walk
By DLR: Heron Quays or West India Quay stations
By Car: Underground parking available at Canary Wharf. Use postcode E14 5AB.`);
  const [luxParking, setLuxParking] = useState("Underground parking at Canary Wharf");
  const [luxStation, setLuxStation] = useState("Canary Wharf (Jubilee Line)");

  // Load settings from Supabase
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'email')
          .in('section', ['templates', 'admin', 'location_e16', 'location_e20', 'location_lux']);

        if (error) {
          console.error('Error loading email settings:', error);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          data.forEach((item: { section: string; key: string; value: string }) => {
            const { section, key, value } = item;

            // Templates
            if (section === 'templates') {
              if (key === 'booking_subject') setBookingSubject(value);
              if (key === 'booking_header') setBookingHeader(value);
              if (key === 'booking_intro') setBookingIntro(value);
              if (key === 'booking_body') setBookingBody(value);
              if (key === 'booking_footer') setBookingFooter(value);
              if (key === 'deposit_subject') setDepositSubject(value);
              if (key === 'deposit_header') setDepositHeader(value);
              if (key === 'deposit_intro') setDepositIntro(value);
              if (key === 'deposit_body') setDepositBody(value);
              if (key === 'deposit_footer') setDepositFooter(value);
            }

            // Admin
            if (section === 'admin') {
              if (key === 'admin_email') setAdminEmail(value);
              if (key === 'from_email') setFromEmail(value);
              if (key === 'reply_to_email') setReplyToEmail(value);
            }

            // Location E16
            if (section === 'location_e16') {
              if (key === 'address') setE16Address(value);
              if (key === 'directions') setE16Directions(value);
              if (key === 'parking') setE16Parking(value);
              if (key === 'station') setE16Station(value);
            }

            // Location E20
            if (section === 'location_e20') {
              if (key === 'address') setE20Address(value);
              if (key === 'directions') setE20Directions(value);
              if (key === 'parking') setE20Parking(value);
              if (key === 'station') setE20Station(value);
            }

            // Location LUX
            if (section === 'location_lux') {
              if (key === 'address') setLuxAddress(value);
              if (key === 'directions') setLuxDirections(value);
              if (key === 'parking') setLuxParking(value);
              if (key === 'station') setLuxStation(value);
            }
          });
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async () => {
    const settingsToSave = [
      // Templates
      { page: 'email', section: 'templates', key: 'booking_subject', value: bookingSubject, type: 'text' },
      { page: 'email', section: 'templates', key: 'booking_header', value: bookingHeader, type: 'text' },
      { page: 'email', section: 'templates', key: 'booking_intro', value: bookingIntro, type: 'text' },
      { page: 'email', section: 'templates', key: 'booking_body', value: bookingBody, type: 'text' },
      { page: 'email', section: 'templates', key: 'booking_footer', value: bookingFooter, type: 'text' },
      { page: 'email', section: 'templates', key: 'deposit_subject', value: depositSubject, type: 'text' },
      { page: 'email', section: 'templates', key: 'deposit_header', value: depositHeader, type: 'text' },
      { page: 'email', section: 'templates', key: 'deposit_intro', value: depositIntro, type: 'text' },
      { page: 'email', section: 'templates', key: 'deposit_body', value: depositBody, type: 'text' },
      { page: 'email', section: 'templates', key: 'deposit_footer', value: depositFooter, type: 'text' },
      // Admin
      { page: 'email', section: 'admin', key: 'admin_email', value: adminEmail, type: 'text' },
      { page: 'email', section: 'admin', key: 'from_email', value: fromEmail, type: 'text' },
      { page: 'email', section: 'admin', key: 'reply_to_email', value: replyToEmail, type: 'text' },
      // Location E16
      { page: 'email', section: 'location_e16', key: 'address', value: e16Address, type: 'text' },
      { page: 'email', section: 'location_e16', key: 'directions', value: e16Directions, type: 'text' },
      { page: 'email', section: 'location_e16', key: 'parking', value: e16Parking, type: 'text' },
      { page: 'email', section: 'location_e16', key: 'station', value: e16Station, type: 'text' },
      // Location E20
      { page: 'email', section: 'location_e20', key: 'address', value: e20Address, type: 'text' },
      { page: 'email', section: 'location_e20', key: 'directions', value: e20Directions, type: 'text' },
      { page: 'email', section: 'location_e20', key: 'parking', value: e20Parking, type: 'text' },
      { page: 'email', section: 'location_e20', key: 'station', value: e20Station, type: 'text' },
      // Location LUX
      { page: 'email', section: 'location_lux', key: 'address', value: luxAddress, type: 'text' },
      { page: 'email', section: 'location_lux', key: 'directions', value: luxDirections, type: 'text' },
      { page: 'email', section: 'location_lux', key: 'parking', value: luxParking, type: 'text' },
      { page: 'email', section: 'location_lux', key: 'station', value: luxStation, type: 'text' },
    ];

    try {
      const savePromises = settingsToSave.map(item =>
        supabase
          .from('site_content')
          .upsert(
            {
              ...item,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'page,section,key',
            }
          )
      );

      const results = await Promise.all(savePromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        console.error('Save errors:', errors);
        throw new Error(`Failed to save ${errors.length} item(s)`);
      }

      setHasChanges(false);
    } catch (err) {
      console.error('Save failed:', err);
      throw err;
    }
  };

  const markChanged = () => setHasChanges(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm tracking-[0.3em] text-black/60 mb-2">ADMIN</p>
            <h1 className="text-4xl font-light text-black">Email Settings</h1>
          </div>
          <SaveButton onSave={handleSave} hasChanges={hasChanges} />
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Admin Email Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Section title="Email Configuration" description="Email addresses for notifications">
            <div className="flex items-center gap-3 mb-6 p-4 bg-black/5 rounded-lg">
              <Mail className="w-8 h-8 text-black/40" />
              <div>
                <p className="font-medium text-black">Notification Settings</p>
                <p className="text-sm text-black/60">Configure where booking notifications are sent</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <TextInput
                label="Admin Notification Email"
                value={adminEmail}
                onChange={(v) => { setAdminEmail(v); markChanged(); }}
                placeholder="admin@example.com"
              />
              <TextInput
                label="From Email"
                value={fromEmail}
                onChange={(v) => { setFromEmail(v); markChanged(); }}
                placeholder="bookings@example.com"
              />
              <TextInput
                label="Reply-To Email"
                value={replyToEmail}
                onChange={(v) => { setReplyToEmail(v); markChanged(); }}
                placeholder="info@example.com"
              />
            </div>
          </Section>
        </motion.div>

        {/* Full Payment Email Template */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Section title="Full Payment Confirmation" description="Email template for full payment bookings">
            <div className="grid gap-6">
              <TextInput
                label="Email Subject"
                value={bookingSubject}
                onChange={(v) => { setBookingSubject(v); markChanged(); }}
                placeholder="Booking Confirmation - East Dock Studios"
              />
              <TextInput
                label="Header Message"
                value={bookingHeader}
                onChange={(v) => { setBookingHeader(v); markChanged(); }}
                placeholder="Thank you for your booking!"
              />
              <TextInput
                label="Introduction Text"
                value={bookingIntro}
                onChange={(v) => { setBookingIntro(v); markChanged(); }}
                placeholder="We're excited to welcome you..."
                multiline
                rows={2}
              />
              <TextInput
                label="Main Message Body"
                value={bookingBody}
                onChange={(v) => { setBookingBody(v); markChanged(); }}
                placeholder="Additional information, instructions, or notes for your customer..."
                multiline
                rows={4}
              />
              <TextInput
                label="Footer Message"
                value={bookingFooter}
                onChange={(v) => { setBookingFooter(v); markChanged(); }}
                placeholder="We look forward to seeing you!"
                multiline
                rows={2}
              />
            </div>
          </Section>
        </motion.div>

        {/* Deposit Email Template */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section title="Deposit Confirmation" description="Email template for deposit payment bookings">
            <div className="grid gap-6">
              <TextInput
                label="Email Subject"
                value={depositSubject}
                onChange={(v) => { setDepositSubject(v); markChanged(); }}
                placeholder="Deposit Received - East Dock Studios Booking"
              />
              <TextInput
                label="Header Message"
                value={depositHeader}
                onChange={(v) => { setDepositHeader(v); markChanged(); }}
                placeholder="Thank you for your deposit!"
              />
              <TextInput
                label="Introduction Text"
                value={depositIntro}
                onChange={(v) => { setDepositIntro(v); markChanged(); }}
                placeholder="Your booking is now secured..."
                multiline
                rows={2}
              />
              <TextInput
                label="Main Message Body"
                value={depositBody}
                onChange={(v) => { setDepositBody(v); markChanged(); }}
                placeholder="Information about remaining balance, arrival instructions..."
                multiline
                rows={4}
              />
              <TextInput
                label="Footer Message"
                value={depositFooter}
                onChange={(v) => { setDepositFooter(v); markChanged(); }}
                placeholder="Your booking is now confirmed..."
                multiline
                rows={2}
              />
            </div>
          </Section>
        </motion.div>

        {/* Studio Dock One Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Section title="Studio Dock One (E16) - Directions" description="How to find us information for E16 studio">
            <div className="flex items-center gap-3 mb-6 p-4 bg-black/5 rounded-lg">
              <MapPin className="w-8 h-8 text-black/40" />
              <div>
                <p className="font-medium text-black">Studio Dock One</p>
                <p className="text-sm text-black/60">Location info included in confirmation emails</p>
              </div>
            </div>
            <div className="grid gap-6">
              <TextInput
                label="Address"
                value={e16Address}
                onChange={(v) => { setE16Address(v); markChanged(); }}
                placeholder="Full address"
              />
              <TextInput
                label="How to Get Here"
                value={e16Directions}
                onChange={(v) => { setE16Directions(v); markChanged(); }}
                placeholder="Travel directions..."
                multiline
                rows={4}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <TextInput
                  label="Nearest Station"
                  value={e16Station}
                  onChange={(v) => { setE16Station(v); markChanged(); }}
                  placeholder="Royal Victoria DLR"
                />
                <TextInput
                  label="Parking Info"
                  value={e16Parking}
                  onChange={(v) => { setE16Parking(v); markChanged(); }}
                  placeholder="Free on-site parking available"
                />
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Studio Dock Two Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Section title="Studio Dock Two (E20) - Directions" description="How to find us information for E20 studio">
            <div className="flex items-center gap-3 mb-6 p-4 bg-black/5 rounded-lg">
              <Building2 className="w-8 h-8 text-black/40" />
              <div>
                <p className="font-medium text-black">Studio Dock Two</p>
                <p className="text-sm text-black/60">Location info included in confirmation emails</p>
              </div>
            </div>
            <div className="grid gap-6">
              <TextInput
                label="Address"
                value={e20Address}
                onChange={(v) => { setE20Address(v); markChanged(); }}
                placeholder="Full address"
              />
              <TextInput
                label="How to Get Here"
                value={e20Directions}
                onChange={(v) => { setE20Directions(v); markChanged(); }}
                placeholder="Travel directions..."
                multiline
                rows={4}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <TextInput
                  label="Nearest Station"
                  value={e20Station}
                  onChange={(v) => { setE20Station(v); markChanged(); }}
                  placeholder="Stratford"
                />
                <TextInput
                  label="Parking Info"
                  value={e20Parking}
                  onChange={(v) => { setE20Parking(v); markChanged(); }}
                  placeholder="Westfield car park"
                />
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Studio Wharf Location */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <Section title="Studio Wharf (LUX) - Directions" description="How to find us information for LUX studio">
            <div className="flex items-center gap-3 mb-6 p-4 bg-black/5 rounded-lg">
              <Building2 className="w-8 h-8 text-black/40" />
              <div>
                <p className="font-medium text-black">Studio Wharf</p>
                <p className="text-sm text-black/60">Location info included in confirmation emails</p>
              </div>
            </div>
            <div className="grid gap-6">
              <TextInput
                label="Address"
                value={luxAddress}
                onChange={(v) => { setLuxAddress(v); markChanged(); }}
                placeholder="Full address"
              />
              <TextInput
                label="How to Get Here"
                value={luxDirections}
                onChange={(v) => { setLuxDirections(v); markChanged(); }}
                placeholder="Travel directions..."
                multiline
                rows={4}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <TextInput
                  label="Nearest Station"
                  value={luxStation}
                  onChange={(v) => { setLuxStation(v); markChanged(); }}
                  placeholder="Canary Wharf"
                />
                <TextInput
                  label="Parking Info"
                  value={luxParking}
                  onChange={(v) => { setLuxParking(v); markChanged(); }}
                  placeholder="Underground parking"
                />
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Email Preview Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Email Template Info</h3>
            <p className="text-sm text-blue-700">
              Confirmation emails are automatically sent to customers after successful payment.
              They include booking details, payment summary, and the &quot;How to Find Us&quot;
              information for the specific studio they booked.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Admin notification emails are sent to the admin email address above for each new booking.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8"
        >
          <SaveButton onSave={handleSave} hasChanges={hasChanges} />
        </motion.div>
      )}
    </div>
  );
}
