import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Client-side Stripe promise
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Pricing configuration (in pence/cents)
export const STUDIO_PRICING = {
  e16: {
    name: 'Studio Dock One (E16)',
    minimum2hrs: { price: 15000, label: 'Minimum 2 Hours', hours: 2 },
    halfday4hrs: { price: 28000, label: 'Half Day (4 Hours)', hours: 4 },
    fullday8hrs: { price: 50000, label: 'Full Day (8 Hours)', hours: 8 },
  },
  e20: {
    name: 'Studio Dock Two (E20)',
    minimum2hrs: { price: 15000, label: 'Minimum 2 Hours', hours: 2 },
    halfday4hrs: { price: 28000, label: 'Half Day (4 Hours)', hours: 4 },
    fullday8hrs: { price: 50000, label: 'Full Day (8 Hours)', hours: 8 },
  },
  lux: {
    name: 'Studio Wharf (LUX)',
    minimum2hrs: { price: 20000, label: 'Minimum 2 Hours', hours: 2 },
    halfday4hrs: { price: 38000, label: 'Half Day (4 Hours)', hours: 4 },
    fullday8hrs: { price: 70000, label: 'Full Day (8 Hours)', hours: 8 },
  },
} as const;

// Add-on pricing (in pence)
export const ADDON_PRICING = {
  cameraLens: {
    quantity2more: { price: 3000, label: 'Additional Camera & Lens (up to 2 more)' },
  },
  videoSwitcher: {
    halfday: { price: 3500, label: 'Video Switcher Engineer - Half Day' },
    fullday: { price: 6000, label: 'Video Switcher Engineer - Full Day' },
  },
  accessories: {
    teleprompter: { price: 2500, label: 'Teleprompter' },
  },
  guests: {
    perPerson: { price: 500, label: 'Additional Guest' },
  },
} as const;

export type StudioType = keyof typeof STUDIO_PRICING;
export type BookingLength = 'minimum2hrs' | 'halfday4hrs' | 'fullday8hrs';

export function calculateBookingTotal(
  studio: StudioType,
  bookingLength: BookingLength,
  addons: {
    cameraLens?: string;
    videoSwitcher?: string;
    accessories?: string;
    guestCount?: number;
  }
): { total: number; breakdown: { item: string; price: number }[] } {
  const breakdown: { item: string; price: number }[] = [];

  // Base studio price
  const studioPrice = STUDIO_PRICING[studio]?.[bookingLength];
  if (studioPrice) {
    breakdown.push({
      item: `${STUDIO_PRICING[studio].name} - ${studioPrice.label}`,
      price: studioPrice.price,
    });
  }

  // Add-ons
  if (addons.cameraLens && ADDON_PRICING.cameraLens[addons.cameraLens as keyof typeof ADDON_PRICING.cameraLens]) {
    const addon = ADDON_PRICING.cameraLens[addons.cameraLens as keyof typeof ADDON_PRICING.cameraLens];
    breakdown.push({ item: addon.label, price: addon.price });
  }

  if (addons.videoSwitcher && ADDON_PRICING.videoSwitcher[addons.videoSwitcher as keyof typeof ADDON_PRICING.videoSwitcher]) {
    const addon = ADDON_PRICING.videoSwitcher[addons.videoSwitcher as keyof typeof ADDON_PRICING.videoSwitcher];
    breakdown.push({ item: addon.label, price: addon.price });
  }

  if (addons.accessories && ADDON_PRICING.accessories[addons.accessories as keyof typeof ADDON_PRICING.accessories]) {
    const addon = ADDON_PRICING.accessories[addons.accessories as keyof typeof ADDON_PRICING.accessories];
    breakdown.push({ item: addon.label, price: addon.price });
  }

  if (addons.guestCount && addons.guestCount > 0) {
    const guestTotal = addons.guestCount * ADDON_PRICING.guests.perPerson.price;
    breakdown.push({
      item: `Additional Guests (${addons.guestCount} x £5)`,
      price: guestTotal,
    });
  }

  const total = breakdown.reduce((sum, item) => sum + item.price, 0);

  return { total, breakdown };
}

export function formatPrice(priceInPence: number): string {
  return `£${(priceInPence / 100).toFixed(2)}`;
}
