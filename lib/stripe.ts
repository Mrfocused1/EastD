import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

// Client-side Stripe promise
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// Types for pricing
export interface StudioPackage {
  id: string;
  label: string;
  hours: number;
  price: number;
}

export interface StudioPricing {
  id: string;
  name: string;
  packages: StudioPackage[];
}

export interface AddonPricing {
  id: string;
  category: string;
  label: string;
  price: number;
}

// Default pricing configuration (in pence) - used as fallback
export const DEFAULT_STUDIOS: StudioPricing[] = [
  {
    id: 'e16',
    name: 'Studio Dock One (E16)',
    packages: [
      { id: 'minimum2hrs', label: 'Minimum 2 Hours', hours: 2, price: 15000 },
      { id: 'halfday4hrs', label: 'Half Day (4 Hours)', hours: 4, price: 28000 },
      { id: 'fullday8hrs', label: 'Full Day (8 Hours)', hours: 8, price: 50000 },
    ],
  },
  {
    id: 'e20',
    name: 'Studio Dock Two (E20)',
    packages: [
      { id: 'minimum2hrs', label: 'Minimum 2 Hours', hours: 2, price: 15000 },
      { id: 'halfday4hrs', label: 'Half Day (4 Hours)', hours: 4, price: 28000 },
      { id: 'fullday8hrs', label: 'Full Day (8 Hours)', hours: 8, price: 50000 },
    ],
  },
  {
    id: 'lux',
    name: 'Studio Wharf (LUX)',
    packages: [
      { id: 'minimum2hrs', label: 'Minimum 2 Hours', hours: 2, price: 20000 },
      { id: 'halfday4hrs', label: 'Half Day (4 Hours)', hours: 4, price: 38000 },
      { id: 'fullday8hrs', label: 'Full Day (8 Hours)', hours: 8, price: 70000 },
    ],
  },
];

export const DEFAULT_ADDONS: AddonPricing[] = [
  { id: 'quantity2more', category: 'cameraLens', label: 'Additional Camera & Lens', price: 3000 },
  { id: 'halfday', category: 'videoSwitcher', label: 'Video Switcher Engineer - Half Day', price: 3500 },
  { id: 'fullday', category: 'videoSwitcher', label: 'Video Switcher Engineer - Full Day', price: 6000 },
  { id: 'teleprompter', category: 'accessories', label: 'Teleprompter', price: 2500 },
  { id: 'guest', category: 'guests', label: 'Additional Guest (per person)', price: 500 },
];

export type StudioType = 'e16' | 'e20' | 'lux';
export type BookingLength = string;

export function calculateBookingTotal(
  studioId: StudioType,
  bookingLengthId: BookingLength,
  addons: {
    cameraLens?: string;
    videoSwitcher?: string;
    accessories?: string;
    guestCount?: number;
  },
  studios: StudioPricing[] = DEFAULT_STUDIOS,
  addonsList: AddonPricing[] = DEFAULT_ADDONS
): { total: number; breakdown: { item: string; price: number }[] } {
  const breakdown: { item: string; price: number }[] = [];

  // Find studio and package
  const studio = studios.find(s => s.id === studioId);
  const pkg = studio?.packages.find(p => p.id === bookingLengthId);

  if (studio && pkg) {
    breakdown.push({
      item: `${studio.name} - ${pkg.label}`,
      price: pkg.price,
    });
  }

  // Add-ons
  if (addons.cameraLens) {
    const addon = addonsList.find(a => a.category === 'cameraLens' && a.id === addons.cameraLens);
    if (addon) {
      breakdown.push({ item: addon.label, price: addon.price });
    }
  }

  if (addons.videoSwitcher) {
    const addon = addonsList.find(a => a.category === 'videoSwitcher' && a.id === addons.videoSwitcher);
    if (addon) {
      breakdown.push({ item: addon.label, price: addon.price });
    }
  }

  if (addons.accessories) {
    const addon = addonsList.find(a => a.category === 'accessories' && a.id === addons.accessories);
    if (addon) {
      breakdown.push({ item: addon.label, price: addon.price });
    }
  }

  if (addons.guestCount && addons.guestCount > 0) {
    const guestAddon = addonsList.find(a => a.category === 'guests');
    const guestPrice = guestAddon?.price || 500;
    const guestTotal = addons.guestCount * guestPrice;
    breakdown.push({
      item: `Additional Guests (${addons.guestCount} x £${(guestPrice / 100).toFixed(2)})`,
      price: guestTotal,
    });
  }

  const total = breakdown.reduce((sum, item) => sum + item.price, 0);

  return { total, breakdown };
}

export function formatPrice(priceInPence: number): string {
  return `£${(priceInPence / 100).toFixed(2)}`;
}
