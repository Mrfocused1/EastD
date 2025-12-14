import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = 'https://fhgvnjwiasusjfevimcw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZ3ZuandpYXN1c2pmZXZpbWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTk3MzcsImV4cCI6MjA3OTU3NTczN30.jB94OamqDhz0JaXyLzpPNb1GiAWTEKcJU2KqsNUpLAg';

// Create auth-enabled client for browser use
export const supabaseAuth: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// Types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  total_bookings: number;
  total_spent: number;
  member_since: string;
  last_booking_date: string | null;
}

export interface UserBooking {
  id: string;
  user_id: string;
  stripe_session_id: string;
  studio: string;
  studio_name: string;
  booking_date: string;
  duration_hours: number;
  total_amount: number;
  amount_paid: number;
  remaining_balance: number;
  payment_type: 'full' | 'deposit';
  status: 'confirmed' | 'completed' | 'cancelled';
  discount_code: string | null;
  discount_amount: number;
  equipment: Record<string, number> | null;
  comments: string | null;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  studio_slug: string;
  studio_name: string;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  email_booking_confirmations: boolean;
  email_booking_reminders: boolean;
  email_marketing: boolean;
  email_discount_offers: boolean;
  reminder_hours_before: number;
}

export interface SavedCard {
  id: string;
  user_id: string;
  stripe_payment_method_id: string;
  card_brand: string;
  card_last_four: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
}
