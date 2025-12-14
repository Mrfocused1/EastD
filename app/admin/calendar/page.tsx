"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Check, X, Loader2, Link2, Unlink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Section from "@/components/admin/Section";

interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
}

interface StudioCalendar {
  id: string;
  studio_slug: string;
  studio_name: string;
  calendar_id: string | null;
  calendar_name: string | null;
}

// Wrapper component to handle Suspense
export default function CalendarSettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
      </div>
    }>
      <CalendarSettingsContent />
    </Suspense>
  );
}

function CalendarSettingsContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [studios, setStudios] = useState<StudioCalendar[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check for URL params (success/error from OAuth callback)
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'connected') {
      setMessage({ type: 'success', text: 'Google Calendar connected successfully!' });
    } else if (error) {
      const errorMessages: Record<string, string> = {
        access_denied: 'Access was denied. Please try again.',
        no_code: 'No authorization code received.',
        token_exchange_failed: 'Failed to connect. Please try again.',
        unknown: 'An error occurred. Please try again.',
      };
      setMessage({ type: 'error', text: errorMessages[error] || 'An error occurred.' });
    }
  }, [searchParams]);

  // Load connection status and data
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      // Check connection status
      const statusRes = await fetch('/api/google/status');
      const statusData = await statusRes.json();
      setIsConnected(statusData.connected);

      // Load studio mappings
      const studiosRes = await fetch('/api/google/studios');
      const studiosData = await studiosRes.json();
      setStudios(studiosData.studios || []);

      // If connected, load calendars
      if (statusData.connected) {
        const calendarsRes = await fetch('/api/google/calendars');
        const calendarsData = await calendarsRes.json();
        setCalendars(calendarsData.calendars || []);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConnect() {
    window.location.href = '/api/google/auth';
  }

  async function handleDisconnect() {
    if (!confirm('Are you sure you want to disconnect Google Calendar? This will remove all calendar mappings.')) {
      return;
    }

    try {
      const res = await fetch('/api/google/disconnect', { method: 'POST' });
      if (res.ok) {
        setIsConnected(false);
        setCalendars([]);
        setStudios(studios.map(s => ({ ...s, calendar_id: null, calendar_name: null })));
        setMessage({ type: 'success', text: 'Google Calendar disconnected.' });
      }
    } catch (err) {
      console.error('Error disconnecting:', err);
      setMessage({ type: 'error', text: 'Failed to disconnect.' });
    }
  }

  async function handleCalendarSelect(studioSlug: string, calendarId: string | null) {
    setSaving(studioSlug);
    try {
      const calendar = calendars.find(c => c.id === calendarId);
      const res = await fetch('/api/google/studios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioSlug,
          calendarId,
          calendarName: calendar?.summary || null,
        }),
      });

      if (res.ok) {
        setStudios(studios.map(s =>
          s.studio_slug === studioSlug
            ? { ...s, calendar_id: calendarId, calendar_name: calendar?.summary || null }
            : s
        ));
        setMessage({ type: 'success', text: 'Calendar updated!' });
      }
    } catch (err) {
      console.error('Error updating calendar:', err);
      setMessage({ type: 'error', text: 'Failed to update calendar.' });
    } finally {
      setSaving(null);
    }
  }

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
            <h1 className="text-4xl font-light text-black">Google Calendar</h1>
          </div>
          <button
            onClick={loadData}
            className="p-2 text-black/40 hover:text-black transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Message Toast */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <X className="w-5 h-5 text-red-600" />
          )}
          <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </span>
        </motion.div>
      )}

      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6"
      >
        <Section title="Connection Status" description="Connect your Google account to sync calendars">
          <div className="flex items-center justify-between p-6 bg-black/5 rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isConnected ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Calendar className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="font-medium text-black">
                  {isConnected ? 'Connected to Google Calendar' : 'Not Connected'}
                </p>
                <p className="text-sm text-black/60">
                  {isConnected
                    ? `${calendars.length} calendar${calendars.length !== 1 ? 's' : ''} available`
                    : 'Connect to sync bookings with your calendar'}
                </p>
              </div>
            </div>
            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Unlink className="w-4 h-4" />
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-black/80 rounded-lg transition-colors"
              >
                <Link2 className="w-4 h-4" />
                Connect Google Calendar
              </button>
            )}
          </div>
        </Section>
      </motion.div>

      {/* Studio Calendar Mappings */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section
            title="Studio Calendars"
            description="Select which calendar to use for each studio's bookings"
          >
            <div className="space-y-4">
              {studios.map((studio) => (
                <div
                  key={studio.studio_slug}
                  className="flex items-center justify-between p-4 border border-black/10 rounded-lg hover:border-black/20 transition-colors"
                >
                  <div>
                    <p className="font-medium text-black">{studio.studio_name}</p>
                    {studio.calendar_name && (
                      <p className="text-sm text-black/60">
                        Linked to: {studio.calendar_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {saving === studio.studio_slug && (
                      <Loader2 className="w-4 h-4 animate-spin text-black/40" />
                    )}
                    <select
                      value={studio.calendar_id || ''}
                      onChange={(e) => handleCalendarSelect(studio.studio_slug, e.target.value || null)}
                      disabled={saving === studio.studio_slug}
                      className="px-4 py-2 border border-black/20 rounded-lg bg-white text-black focus:outline-none focus:border-black min-w-[200px]"
                    >
                      <option value="">Select a calendar...</option>
                      {calendars.map((cal) => (
                        <option key={cal.id} value={cal.id}>
                          {cal.summary} {cal.primary ? '(Primary)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6"
      >
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• <strong>Availability checking:</strong> The booking form will check the linked calendar for conflicts before allowing a booking</li>
            <li>• <strong>Auto-sync:</strong> When a booking is confirmed, an event is automatically created in the linked calendar</li>
            <li>• <strong>Calendar events:</strong> Events include customer name, email, phone, and any add-ons or comments</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
