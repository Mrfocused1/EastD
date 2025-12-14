import Stripe from 'stripe';
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js';

// Lazy-loaded server-side Stripe instance (only created when needed)
let stripeInstance: Stripe | null = null;

export const getServerStripe = (): Stripe => {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2024-09-30.acacia',
    });
  }
  return stripeInstance;
};

// For backwards compatibility - but only use in server-side code!
export const stripe = typeof window === 'undefined'
  ? getServerStripe()
  : (null as unknown as Stripe);

// Client-side Stripe promise (lazy loaded)
let stripePromise: Promise<StripeJS | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.warn('STRIPE_PUBLISHABLE_KEY not configured');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
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
  maxQuantity?: number; // Maximum quantity available
  studioTypes?: string[]; // Which studios this addon applies to (empty = all)
}

// Default pricing configuration (in pence) - used as fallback
export const DEFAULT_STUDIOS: StudioPricing[] = [
  {
    id: 'studio-dock-one',
    name: 'Studio Dock One',
    packages: [
      { id: '2hrs', label: '2 Hour Hire', hours: 2, price: 15000 },
      { id: '3hrs', label: '3 Hour Hire', hours: 3, price: 21000 },
      { id: '4hrs', label: '4 Hour Hire', hours: 4, price: 26000 },
      { id: '5hrs', label: '5 Hour Hire', hours: 5, price: 30000 },
      { id: '6hrs', label: '6 Hour Hire', hours: 6, price: 34000 },
      { id: '8hrs', label: '8 Hour Hire', hours: 8, price: 38000 },
      { id: '10hrs', label: '10 Hour Hire', hours: 10, price: 42000 },
    ],
  },
  {
    id: 'studio-dock-two',
    name: 'Studio Dock Two',
    packages: [
      { id: '2hrs', label: '2 Hour Hire', hours: 2, price: 18000 },
      { id: '3hrs', label: '3 Hour Hire', hours: 3, price: 25500 },
      { id: '4hrs', label: '4 Hour Hire', hours: 4, price: 32000 },
      { id: '5hrs', label: '5 Hour Hire', hours: 5, price: 38000 },
      { id: '6hrs', label: '6 Hour Hire', hours: 6, price: 43000 },
      { id: '8hrs', label: '8 Hour Hire', hours: 8, price: 50000 },
      { id: '10hrs', label: '10 Hour Hire', hours: 10, price: 54000 },
    ],
  },
  {
    id: 'studio-wharf',
    name: 'Studio Wharf',
    packages: [
      { id: '2hrs', label: '2 Hour Hire', hours: 2, price: 20000 },
      { id: '3hrs', label: '3 Hour Hire', hours: 3, price: 28000 },
      { id: '4hrs', label: '4 Hour Hire', hours: 4, price: 36000 },
      { id: '5hrs', label: '5 Hour Hire', hours: 5, price: 43000 },
      { id: '6hrs', label: '6 Hour Hire', hours: 6, price: 50000 },
      { id: '8hrs', label: '8 Hour Hire', hours: 8, price: 58000 },
      { id: '10hrs', label: '10 Hour Hire', hours: 10, price: 62000 },
    ],
  },
  {
    id: 'photography',
    name: 'Photography Studio',
    packages: [
      { id: '2hrs', label: '2 Hour Hire', hours: 2, price: 6000 },
      { id: '3hrs', label: '3 Hour Hire', hours: 3, price: 9000 },
      { id: '4hrs', label: '4 Hour Hire', hours: 4, price: 12000 },
      { id: '5hrs', label: '5 Hour Hire', hours: 5, price: 15000 },
      { id: '6hrs', label: '6 Hour Hire', hours: 6, price: 18000 },
      { id: '8hrs', label: '8 Hour Hire', hours: 8, price: 21000 },
      { id: '10hrs', label: '10 Hour Hire', hours: 10, price: 24000 },
    ],
  },
];

// Podcast studio equipment
export const PODCAST_ADDONS: AddonPricing[] = [
  { id: 'cameraLens', category: 'equipment', label: 'Additional Camera & Lens', price: 3000, maxQuantity: 2, studioTypes: ['studio-dock-one', 'studio-dock-two', 'studio-wharf'] },
  { id: 'teleprompter', category: 'equipment', label: 'Teleprompter', price: 2500, maxQuantity: 1, studioTypes: ['studio-dock-one', 'studio-dock-two', 'studio-wharf'] },
  { id: 'rgbTubes', category: 'equipment', label: 'RGB Tubes', price: 1500, maxQuantity: 4, studioTypes: ['studio-dock-one', 'studio-dock-two', 'studio-wharf'] },
  { id: 'lavMic', category: 'equipment', label: 'Lavalier Mic', price: 1000, maxQuantity: 4, studioTypes: ['studio-dock-one', 'studio-dock-two', 'studio-wharf'] },
  { id: 'shotgunMic', category: 'equipment', label: 'Shotgun Mic', price: 1500, maxQuantity: 2, studioTypes: ['studio-dock-one', 'studio-dock-two', 'studio-wharf'] },
  { id: 'videoSwitcherHalf', category: 'services', label: 'Video Switcher Engineer - Half Day', price: 3500, maxQuantity: 1, studioTypes: ['studio-dock-one', 'studio-dock-two', 'studio-wharf'] },
  { id: 'videoSwitcherFull', category: 'services', label: 'Video Switcher Engineer - Full Day', price: 6000, maxQuantity: 1, studioTypes: ['studio-dock-one', 'studio-dock-two', 'studio-wharf'] },
];

// Photography studio equipment
export const PHOTOGRAPHY_ADDONS: AddonPricing[] = [
  { id: 'ad200', category: 'equipment', label: 'AD200 (Canon/Sony/Nikon Trigger)', price: 2500, maxQuantity: 2, studioTypes: ['photography'] },
  { id: 'reflector', category: 'equipment', label: 'Reflector', price: 500, maxQuantity: 1, studioTypes: ['photography'] },
  { id: 'lightStand', category: 'equipment', label: 'Light Stand', price: 500, maxQuantity: 4, studioTypes: ['photography'] },
  { id: 'amaran100x', category: 'equipment', label: 'Amaran 100x', price: 2000, maxQuantity: 2, studioTypes: ['photography'] },
  { id: 'parabolicDome90', category: 'equipment', label: 'Parabolic Dome 90" with Grid', price: 500, maxQuantity: 3, studioTypes: ['photography'] },
  { id: 'parabolicDome120', category: 'equipment', label: 'Parabolic Dome 120" with Grid', price: 1000, maxQuantity: 1, studioTypes: ['photography'] },
];

// Combined addons list
export const DEFAULT_ADDONS: AddonPricing[] = [
  ...PODCAST_ADDONS,
  ...PHOTOGRAPHY_ADDONS,
  { id: 'guest', category: 'guests', label: 'Additional Guest (per person)', price: 500, maxQuantity: 10 },
];

// Get addons for a specific studio type
export function getAddonsForStudio(studioId: string): AddonPricing[] {
  return DEFAULT_ADDONS.filter(addon =>
    !addon.studioTypes || addon.studioTypes.length === 0 || addon.studioTypes.includes(studioId)
  );
}

export type StudioType = 'studio-dock-one' | 'studio-dock-two' | 'studio-wharf' | 'photography';
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
