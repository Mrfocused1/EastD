// Studio Configuration - Operating Hours, Cooldown, and Pricing Rules

export interface OperatingHours {
  open: number; // 24-hour format (e.g., 10 for 10am)
  close: number; // 24-hour format (e.g., 22 for 10pm)
}

export interface DaySchedule {
  [key: number]: OperatingHours; // 0 = Sunday, 1 = Monday, etc.
}

// Operating hours: 10am-10pm Mon-Sat, 4pm-10pm Sunday
export const OPERATING_HOURS: DaySchedule = {
  0: { open: 16, close: 22 }, // Sunday: 4pm - 10pm
  1: { open: 10, close: 22 }, // Monday: 10am - 10pm
  2: { open: 10, close: 22 }, // Tuesday: 10am - 10pm
  3: { open: 10, close: 22 }, // Wednesday: 10am - 10pm
  4: { open: 10, close: 22 }, // Thursday: 10am - 10pm
  5: { open: 10, close: 22 }, // Friday: 10am - 10pm
  6: { open: 10, close: 22 }, // Saturday: 10am - 10pm
};

// Session cooldown in minutes (time between end of one booking and start of next)
export const SESSION_COOLDOWN_MINUTES = 60;

// Evening/Weekend surcharge percentage (15% = 0.15)
export const EVENING_WEEKEND_SURCHARGE = 0.15;

// Evening hours start time (6pm = 18:00)
export const EVENING_START_HOUR = 18;

// Weekend days (Saturday = 6, Sunday = 0)
export const WEEKEND_DAYS = [0, 6];

// Check if a given time is during operating hours
export function isWithinOperatingHours(date: Date, durationHours: number = 1): boolean {
  const dayOfWeek = date.getDay();
  const hours = OPERATING_HOURS[dayOfWeek];

  if (!hours) return false;

  const startHour = date.getHours();
  const startMinutes = date.getMinutes();
  const startTime = startHour + startMinutes / 60;

  const endTime = startTime + durationHours;

  // Check if start is within operating hours and end doesn't exceed closing time
  return startTime >= hours.open && endTime <= hours.close;
}

// Get operating hours for a specific day
export function getOperatingHoursForDay(dayOfWeek: number): OperatingHours | null {
  return OPERATING_HOURS[dayOfWeek] || null;
}

// Check if a time slot is during evening hours
export function isEveningSlot(hour: number): boolean {
  return hour >= EVENING_START_HOUR;
}

// Check if a date is a weekend
export function isWeekend(date: Date): boolean {
  return WEEKEND_DAYS.includes(date.getDay());
}

// Check if a booking qualifies for evening/weekend surcharge
export function hasEveningWeekendSurcharge(date: Date, startHour: number): boolean {
  return isWeekend(date) || isEveningSlot(startHour);
}

// Calculate price with surcharge if applicable
export function applyEveningWeekendSurcharge(basePriceInPence: number, date: Date, startHour: number): {
  price: number;
  hasSurcharge: boolean;
  surchargeAmount: number;
} {
  const hasSurcharge = hasEveningWeekendSurcharge(date, startHour);

  if (!hasSurcharge) {
    return { price: basePriceInPence, hasSurcharge: false, surchargeAmount: 0 };
  }

  const surchargeAmount = Math.round(basePriceInPence * EVENING_WEEKEND_SURCHARGE);
  return {
    price: basePriceInPence + surchargeAmount,
    hasSurcharge: true,
    surchargeAmount,
  };
}

// Generate available time slots for a given day
export function generateTimeSlots(date: Date, intervalMinutes: number = 30): string[] {
  const dayOfWeek = date.getDay();
  const hours = OPERATING_HOURS[dayOfWeek];

  if (!hours) return [];

  const slots: string[] = [];

  for (let h = hours.open; h < hours.close; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }

  return slots;
}

// Add cooldown buffer to busy times
export function addCooldownToBusyTimes(
  busyTimes: { start: Date; end: Date }[]
): { start: Date; end: Date }[] {
  return busyTimes.map(busy => ({
    start: busy.start,
    end: new Date(busy.end.getTime() + SESSION_COOLDOWN_MINUTES * 60 * 1000),
  }));
}

// Check if a time slot is available considering cooldown
export function isSlotAvailable(
  slotStart: Date,
  durationHours: number,
  busyTimesWithCooldown: { start: Date; end: Date }[]
): boolean {
  const slotEnd = new Date(slotStart.getTime() + durationHours * 60 * 60 * 1000);

  // First check operating hours
  if (!isWithinOperatingHours(slotStart, durationHours)) {
    return false;
  }

  // Then check for conflicts with existing bookings (including cooldown)
  return !busyTimesWithCooldown.some(busy =>
    slotStart < busy.end && slotEnd > busy.start
  );
}

// Format surcharge display text
export function formatSurchargeText(): string {
  return `Evening (after ${EVENING_START_HOUR > 12 ? EVENING_START_HOUR - 12 : EVENING_START_HOUR}pm) and weekend bookings include a ${Math.round(EVENING_WEEKEND_SURCHARGE * 100)}% surcharge`;
}
