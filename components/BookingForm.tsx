"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, ChevronLeft, ChevronRight, CreditCard, Loader2, Tag, Check, X, User } from "lucide-react";
import { calculateBookingTotal, formatPrice, StudioType, BookingLength, StudioPricing, AddonPricing, DEFAULT_STUDIOS, DEFAULT_ADDONS } from "@/lib/stripe";
import {
  OPERATING_HOURS,
  SESSION_COOLDOWN_MINUTES,
  generateTimeSlots,
  addCooldownToBusyTimes,
  isWithinOperatingHours,
  hasEveningWeekendSurcharge,
  applyEveningWeekendSurcharge,
  formatSurchargeText,
  EVENING_WEEKEND_SURCHARGE,
} from "@/lib/studioConfig";

interface DropdownOption {
  value: string;
  label: string;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "datetime" | "select" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: DropdownOption[];
  order: number;
}

const defaultFields: FormField[] = [
  {
    id: "studio",
    name: "studio",
    label: "Studios",
    type: "select",
    required: true,
    options: [
      { value: "studio-dock-one", label: "Studio Dock One" },
      { value: "studio-dock-two", label: "Studio Dock Two" },
      { value: "studio-wharf", label: "Studio Wharf" },
      { value: "photography", label: "Photography Studio" },
    ],
    order: 1,
  },
  {
    id: "name",
    name: "name",
    label: "NAME",
    type: "text",
    required: true,
    placeholder: "Enter your name",
    order: 2,
  },
  {
    id: "bookingDate",
    name: "bookingDate",
    label: "DATE & TIME OF ENQUIRED BOOKING",
    type: "datetime",
    required: true,
    order: 3,
  },
  {
    id: "email",
    name: "email",
    label: "EMAIL",
    type: "email",
    required: true,
    placeholder: "Enter your email",
    order: 4,
  },
  {
    id: "phone",
    name: "phone",
    label: "NUMBER",
    type: "tel",
    required: true,
    placeholder: "Enter your phone number",
    order: 5,
  },
  {
    id: "bookingLength",
    name: "bookingLength",
    label: "BOOKING LENGTH",
    type: "select",
    required: true,
    options: [], // Options loaded dynamically based on selected studio
    order: 6,
  },
  {
    id: "comments",
    name: "comments",
    label: "COMMENTS",
    type: "textarea",
    required: false,
    placeholder: "Enter any additional comments (optional)",
    order: 7,
  },
];

interface BookingFormProps {
  preselectedStudio?: string;
}

// Date/Time Picker Component
function DateTimePicker({
  value,
  onChange,
  label,
  required,
  studioSlug,
  bookingDuration,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required: boolean;
  studioSlug?: string;
  bookingDuration?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [selectedTime, setSelectedTime] = useState(value ? value.split("T")[1]?.substring(0, 5) || "09:00" : "09:00");
  const pickerRef = useRef<HTMLDivElement>(null);
  const [busyTimes, setBusyTimes] = useState<{ start: Date; end: Date }[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch busy times when date or studio changes
  useEffect(() => {
    async function fetchBusyTimes() {
      if (!selectedDate || !studioSlug) {
        setBusyTimes([]);
        return;
      }

      setLoadingAvailability(true);
      try {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const res = await fetch(`/api/google/availability?studio=${studioSlug}&date=${dateStr}`);
        const data = await res.json();

        if (data.busyTimes) {
          setBusyTimes(
            data.busyTimes.map((bt: { start: string; end: string }) => ({
              start: new Date(bt.start),
              end: new Date(bt.end),
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
        setBusyTimes([]);
      } finally {
        setLoadingAvailability(false);
      }
    }

    fetchBusyTimes();
  }, [selectedDate, studioSlug]);

  // Add cooldown to busy times
  const busyTimesWithCooldown = addCooldownToBusyTimes(busyTimes);

  // Check if a time slot conflicts with busy times (including cooldown)
  const isTimeSlotBusy = (time: string) => {
    if (!selectedDate) return false;

    const [hours, minutes] = time.split(":").map(Number);
    const slotStart = new Date(selectedDate);
    slotStart.setHours(hours, minutes, 0, 0);

    const duration = bookingDuration || 2; // Default 2 hours
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotEnd.getHours() + duration);

    // First check if the slot fits within operating hours
    if (!isWithinOperatingHours(slotStart, duration)) {
      return true; // Outside operating hours = not available
    }

    // Check if this slot overlaps with any busy time (including cooldown buffer)
    if (busyTimesWithCooldown.length > 0) {
      return busyTimesWithCooldown.some((busy) => {
        return slotStart < busy.end && slotEnd > busy.start;
      });
    }

    return false;
  };

  // Check if time slot is evening/weekend (for display purposes)
  const isEveningOrWeekend = (time: string) => {
    if (!selectedDate) return false;
    const [hours] = time.split(":").map(Number);
    return hasEveningWeekendSurcharge(selectedDate, hours);
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate time slots based on operating hours for the selected day
  const timeSlots = selectedDate
    ? generateTimeSlots(selectedDate, 30)
    : generateTimeSlots(new Date(), 30); // Default to today's schedule

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    updateValue(newDate, selectedTime);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      updateValue(selectedDate, time);
    }
  };

  const updateValue = (date: Date, time: string) => {
    const dateStr = date.toISOString().split("T")[0];
    onChange(`${dateStr}T${time}`);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return checkDate < today;
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return "";
    const dateStr = selectedDate.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${dateStr} at ${selectedTime}`;
  };

  return (
    <div className="relative" ref={pickerRef}>
      <label className="block text-sm text-black font-medium mb-2">
        {label} {required && "*"}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors cursor-pointer flex items-center justify-between"
      >
        <span className={selectedDate ? "text-black" : "text-gray-400"}>
          {selectedDate ? formatDisplayValue() : "Select date and time"}
        </span>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 shadow-xl z-50"
        >
          <div className="flex">
            {/* Calendar */}
            <div className="p-4 border-r border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-medium">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-xs text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const past = isPastDate(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => !past && handleDateSelect(day)}
                      disabled={past}
                      className={`w-8 h-8 text-sm rounded-full flex items-center justify-center transition-colors
                        ${isSelected(day) ? "bg-black text-white" : ""}
                        ${isToday(day) && !isSelected(day) ? "border border-black" : ""}
                        ${past ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Picker */}
            <div className="p-4 w-32">
              <p className="text-sm font-medium mb-3">Time</p>
              {loadingAvailability && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              )}
              <div className="h-64 overflow-y-auto space-y-1">
                {timeSlots.map((time) => {
                  const isBusy = isTimeSlotBusy(time);
                  const isPremium = isEveningOrWeekend(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => !isBusy && handleTimeSelect(time)}
                      disabled={isBusy}
                      className={`w-full text-left px-3 py-2 text-sm rounded transition-colors
                        ${selectedTime === time && !isBusy ? "bg-black text-white" : ""}
                        ${isBusy ? "bg-red-50 text-red-300 cursor-not-allowed line-through" : "hover:bg-gray-100"}
                        ${isPremium && !isBusy && selectedTime !== time ? "bg-amber-50" : ""}
                      `}
                      title={isBusy ? "This time slot is not available" : isPremium ? "+15% evening/weekend rate" : ""}
                    >
                      {time}
                      {isBusy && <span className="ml-1 text-xs">(booked)</span>}
                      {isPremium && !isBusy && <span className="ml-1 text-xs text-amber-600">+15%</span>}
                    </button>
                  );
                })}
              </div>
              {/* Operating hours info */}
              <p className="text-xs text-gray-400 mt-2 pt-2 border-t">
                {selectedDate && selectedDate.getDay() === 0 ? "Sun: 4pm-10pm" : "Mon-Sat: 10am-10pm"}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 p-3 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function BookingForm({ preselectedStudio }: BookingFormProps = {}) {
  const { user, profile } = useAuth();
  const [fields, setFields] = useState<FormField[]>(defaultFields);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [studioTitles, setStudioTitles] = useState({
    studioDockOne: "Studio Dock One",
    studioDockTwo: "Studio Dock Two",
    studioWharf: "Studio Wharf",
  });

  // Equipment quantities state (addonId -> quantity)
  const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>({});

  // Discount code state
  const [discountCode, setDiscountCode] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    discountAmount: number;
    description: string;
  } | null>(null);
  const [discountError, setDiscountError] = useState("");

  // Pricing state
  const [pricingStudios, setPricingStudios] = useState<StudioPricing[]>(DEFAULT_STUDIOS);
  const [pricingAddons, setPricingAddons] = useState<AddonPricing[]>(DEFAULT_ADDONS);

  // Get available addons for the selected studio (filter from database-loaded addons)
  const availableAddons = formData.studio
    ? pricingAddons.filter(addon =>
        !addon.studioTypes || addon.studioTypes.length === 0 || addon.studioTypes.includes(formData.studio)
      )
    : [];

  useEffect(() => {
    loadFormConfig();
    loadStudioTitles();
    loadPricing();
  }, []);

  useEffect(() => {
    if (preselectedStudio) {
      setFormData((prev) => ({ ...prev, studio: preselectedStudio }));
    }
  }, [preselectedStudio]);

  // Auto-fill user data when logged in
  useEffect(() => {
    if (user && profile) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || profile.full_name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || profile.phone || "",
      }));
    }
  }, [user, profile]);

  async function loadFormConfig() {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("page", "booking")
        .eq("section", "form")
        .eq("key", "fields")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading form config:", error);
        return;
      }

      if (data?.value) {
        try {
          const parsedFields = JSON.parse(data.value);
          setFields(parsedFields);
        } catch (e) {
          console.error("Error parsing form config:", e);
        }
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function loadStudioTitles() {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("key, value")
        .eq("page", "global")
        .eq("section", "settings")
        .in("key", ["studio_dock_one_title", "studio_dock_two_title", "studio_wharf_title"]);

      if (error) {
        console.error("Error loading studio titles:", error);
        return;
      }

      if (data && data.length > 0) {
        const newTitles = { studioDockOne: "Studio Dock One", studioDockTwo: "Studio Dock Two", studioWharf: "Studio Wharf" };
        data.forEach((item: { key: string; value: string }) => {
          if (item.key === "studio_dock_one_title") newTitles.studioDockOne = item.value;
          if (item.key === "studio_dock_two_title") newTitles.studioDockTwo = item.value;
          if (item.key === "studio_wharf_title") newTitles.studioWharf = item.value;
        });
        setStudioTitles(newTitles);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function loadPricing() {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("key, value")
        .eq("page", "pricing")
        .eq("section", "config");

      if (error) {
        console.error("Error loading pricing:", error);
        return;
      }

      if (data && data.length > 0) {
        data.forEach((item: { key: string; value: string }) => {
          if (item.key === "studios") {
            try {
              setPricingStudios(JSON.parse(item.value));
            } catch (e) {
              console.error("Error parsing studios:", e);
            }
          }
          if (item.key === "addons") {
            try {
              setPricingAddons(JSON.parse(item.value));
            } catch (e) {
              console.error("Error parsing addons:", e);
            }
          }
        });
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  // Validate discount code
  const validateDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountError("Please enter a discount code");
      return;
    }

    setDiscountLoading(true);
    setDiscountError("");

    try {
      const response = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode,
          email: formData.email,
          studio: formData.studio,
          bookingTotal: bookingTotal?.total || 0,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedDiscount(data.discount);
        setDiscountError("");
      } else {
        setDiscountError(data.error || "Invalid discount code");
        setAppliedDiscount(null);
      }
    } catch (error) {
      setDiscountError("Failed to validate discount code");
      setAppliedDiscount(null);
    } finally {
      setDiscountLoading(false);
    }
  };

  // Remove discount
  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  const handleChange = (name: string, value: string) => {
    // Clear booking length and equipment when studio changes (packages/equipment differ per studio)
    if (name === "studio") {
      setFormData((prev) => ({ ...prev, [name]: value, bookingLength: "" }));
      setEquipmentQuantities({}); // Clear equipment selections
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle equipment quantity change
  const handleEquipmentChange = (addonId: string, quantity: number, maxQuantity: number) => {
    if (quantity < 0) quantity = 0;
    if (quantity > maxQuantity) quantity = maxQuantity;
    setEquipmentQuantities((prev) => ({
      ...prev,
      [addonId]: quantity,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }

      if (field.type === "email" && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = "Invalid email address";
        }
      }

      if (field.type === "tel" && formData[field.name]) {
        if (formData[field.name].length < 10) {
          newErrors[field.name] = "Please enter a valid phone number";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          equipment: equipmentQuantities,
          hasSurcharge: bookingTotal?.hasSurcharge || false,
          discountCode: appliedDiscount?.code || null,
          discountId: appliedDiscount?.id || null,
          userId: user?.id || null, // Link booking to user account
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        console.error("Checkout error:", data.error);
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate current booking total with evening/weekend surcharge and equipment
  const getBookingTotal = () => {
    const studio = formData.studio as StudioType;
    const bookingLength = formData.bookingLength as BookingLength;

    if (!studio || !bookingLength) {
      return null;
    }

    const breakdown: { item: string; price: number }[] = [];

    // Find studio and package
    const studioData = pricingStudios.find(s => s.id === studio);
    const pkg = studioData?.packages.find(p => p.id === bookingLength);

    if (studioData && pkg) {
      breakdown.push({
        item: `${studioData.name} - ${pkg.label}`,
        price: pkg.price,
      });
    }

    // Add equipment costs
    Object.entries(equipmentQuantities).forEach(([addonId, quantity]) => {
      if (quantity > 0) {
        const addon = availableAddons.find(a => a.id === addonId);
        if (addon) {
          const itemTotal = addon.price * quantity;
          breakdown.push({
            item: quantity > 1 ? `${addon.label} x${quantity}` : addon.label,
            price: itemTotal,
          });
        }
      }
    });

    let total = breakdown.reduce((sum, item) => sum + item.price, 0);
    let hasSurcharge = false;

    // Check if evening/weekend surcharge applies
    if (formData.bookingDate) {
      const bookingDate = new Date(formData.bookingDate);
      const bookingHour = bookingDate.getHours();

      if (hasEveningWeekendSurcharge(bookingDate, bookingHour)) {
        const surchargeAmount = Math.round(total * EVENING_WEEKEND_SURCHARGE);
        breakdown.push({ item: "Evening/Weekend Surcharge (15%)", price: surchargeAmount });
        total += surchargeAmount;
        hasSurcharge = true;
      }
    }

    // Apply discount if valid
    let discountAmount = 0;
    if (appliedDiscount) {
      if (appliedDiscount.type === 'percentage') {
        discountAmount = Math.round(total * (appliedDiscount.value / 100));
      } else {
        discountAmount = Math.round(appliedDiscount.value * 100);
      }
      // Ensure discount doesn't exceed total
      discountAmount = Math.min(discountAmount, total);
      breakdown.push({ item: `Discount (${appliedDiscount.code})`, price: -discountAmount });
      total -= discountAmount;
    }

    return { total, breakdown, hasSurcharge, discountAmount };
  };

  const bookingTotal = getBookingTotal();

  const getStudioOptions = (field: FormField) => {
    if (field.name === "studio") {
      return [
        { value: "studio-dock-one", label: studioTitles.studioDockOne },
        { value: "studio-dock-two", label: studioTitles.studioDockTwo },
        { value: "studio-wharf", label: studioTitles.studioWharf },
        { value: "photography", label: "Photography Studio" },
      ];
    }
    // Dynamic booking length options based on selected studio
    if (field.name === "bookingLength") {
      const selectedStudio = pricingStudios.find(s => s.id === formData.studio);
      if (selectedStudio) {
        return selectedStudio.packages.map(pkg => ({
          value: pkg.id,
          label: `${pkg.label} - ${formatPrice(pkg.price)}`,
        }));
      }
      // Fallback to first studio's packages if none selected
      if (pricingStudios.length > 0) {
        return pricingStudios[0].packages.map(pkg => ({
          value: pkg.id,
          label: `${pkg.label} - ${formatPrice(pkg.price)}`,
        }));
      }
    }
    return field.options || [];
  };

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 1rem center",
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "select":
        return (
          <div key={field.id}>
            <label className="block text-sm text-black font-medium mb-2">
              {field.label} {field.required && "*"}
            </label>
            <select
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
              style={selectStyle}
            >
              <option value="">Select {field.label}</option>
              {getStudioOptions(field).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors[field.name] && (
              <p className="text-red-600 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        );

      case "datetime":
        // Get booking duration from the selected studio package
        const getDurationHours = () => {
          const selectedStudio = pricingStudios.find(s => s.id === formData.studio);
          if (selectedStudio && formData.bookingLength) {
            const pkg = selectedStudio.packages.find(p => p.id === formData.bookingLength);
            if (pkg) return pkg.hours;
          }
          return 2; // Default 2 hours
        };
        return (
          <DateTimePicker
            key={field.id}
            value={formData[field.name] || ""}
            onChange={(value) => handleChange(field.name, value)}
            label={field.label}
            required={field.required}
            studioSlug={formData.studio}
            bookingDuration={getDurationHours()}
          />
        );

      case "date":
        return (
          <div key={field.id}>
            <label className="block text-sm text-black font-medium mb-2">
              {field.label} {field.required && "*"}
            </label>
            <input
              type="date"
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors"
            />
            {errors[field.name] && (
              <p className="text-red-600 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        );

      case "textarea":
        return (
          <div key={field.id}>
            <label className="block text-sm text-black font-medium mb-2">
              {field.label} {field.required && "*"}
            </label>
            <textarea
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className="w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors resize-none"
            />
            {errors[field.name] && (
              <p className="text-red-600 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id}>
            <label className="block text-sm text-black font-medium mb-2">
              {field.label} {field.required && "*"}
            </label>
            <input
              type={field.type}
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
            />
            {errors[field.name] && (
              <p className="text-red-600 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        );
    }
  };

  // Group fields for layout (first two fields side by side, then alternate)
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return (
    <section id="booking" className="py-24 bg-[#fdfbf8]">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-light mb-4 text-black">Booking Request</h2>
        </motion.div>

        {/* Login Status Banner */}
        {user ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-800">
                Logged in as {profile?.full_name || user.email}
              </p>
              <p className="text-sm text-green-600">
                This booking will be linked to your account for easy tracking
              </p>
            </div>
            <Link
              href="/profile/bookings"
              className="text-sm text-green-700 hover:text-green-900 underline"
            >
              View Bookings
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-800">
                Create an account for easier booking
              </p>
              <p className="text-sm text-blue-600">
                Track bookings, save payment methods, and get exclusive discounts
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm border border-blue-300 text-blue-700 hover:bg-blue-100 rounded transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </motion.div>
        )}

        <motion.form
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {sortedFields.map((field, index) => {
            // First two fields side by side
            if (index === 0 && sortedFields.length > 1) {
              return (
                <div key={`row-${index}`} className="grid md:grid-cols-2 gap-6">
                  {renderField(field)}
                  {renderField(sortedFields[1])}
                </div>
              );
            }
            // Skip second field (already rendered above)
            if (index === 1) return null;
            // Third and fourth fields side by side
            if (index === 2 && sortedFields.length > 3) {
              return (
                <div key={`row-${index}`} className="grid md:grid-cols-2 gap-6">
                  {renderField(field)}
                  {renderField(sortedFields[3])}
                </div>
              );
            }
            // Skip fourth field
            if (index === 3) return null;
            // Render remaining fields full width
            return renderField(field);
          })}

          {/* Equipment Section - Only show when studio is selected */}
          {formData.studio && availableAddons.length > 0 && (
            <div className="border border-gray-300 p-6 bg-white">
              <h3 className="text-lg font-medium mb-4 text-black">
                {formData.studio === "photography" ? "Photography Equipment" : "Additional Equipment & Services"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">Select optional add-ons for your booking</p>
              <div className="grid md:grid-cols-2 gap-4">
                {availableAddons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black">{addon.label}</p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(addon.price)} each
                        {addon.maxQuantity && addon.maxQuantity > 1 && ` (max ${addon.maxQuantity})`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEquipmentChange(addon.id, (equipmentQuantities[addon.id] || 0) - 1, addon.maxQuantity || 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        disabled={!equipmentQuantities[addon.id]}
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-black font-medium">
                        {equipmentQuantities[addon.id] || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEquipmentChange(addon.id, (equipmentQuantities[addon.id] || 0) + 1, addon.maxQuantity || 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                        disabled={(equipmentQuantities[addon.id] || 0) >= (addon.maxQuantity || 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discount Code Section */}
          {formData.studio && formData.bookingLength && (
            <div className="border border-gray-300 p-6 bg-white">
              <h3 className="text-lg font-medium mb-4 text-black flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Discount Code
              </h3>
              {appliedDiscount ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">{appliedDiscount.code}</p>
                      <p className="text-sm text-green-600">{appliedDiscount.description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeDiscount}
                    className="p-2 text-green-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      placeholder="Enter discount code"
                      className="flex-1 bg-white border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors uppercase"
                    />
                    <button
                      type="button"
                      onClick={validateDiscountCode}
                      disabled={discountLoading || !discountCode.trim()}
                      className="px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {discountLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "APPLY"
                      )}
                    </button>
                  </div>
                  {discountError && (
                    <p className="text-red-600 text-sm mt-2">{discountError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Price Summary */}
          {bookingTotal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black text-white p-6"
            >
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Booking Summary
              </h3>
              <div className="space-y-2 mb-4">
                {bookingTotal.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.item}</span>
                    <span>{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-700 pt-4 flex justify-between text-lg font-medium">
                <span>Total</span>
                <span>{formatPrice(bookingTotal.total)}</span>
              </div>
              {bookingTotal.hasSurcharge && (
                <p className="text-xs text-amber-400 mt-2">
                  * Includes 15% evening/weekend surcharge
                </p>
              )}

              {/* Payment Options */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-300 mb-3">Choose payment option:</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="paymentType"
                      value="deposit"
                      checked={formData.paymentType === "deposit"}
                      onChange={(e) => handleChange("paymentType", e.target.value)}
                      className="w-4 h-4 accent-white"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="group-hover:text-gray-200">50% Deposit (to confirm booking)</span>
                      <span className="font-medium">{formatPrice(Math.round(bookingTotal.total / 2))}</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="paymentType"
                      value="full"
                      checked={formData.paymentType === "full" || !formData.paymentType}
                      onChange={(e) => handleChange("paymentType", e.target.value)}
                      className="w-4 h-4 accent-white"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="group-hover:text-gray-200">Pay in Full</span>
                      <span className="font-medium">{formatPrice(bookingTotal.total)}</span>
                    </div>
                  </label>
                </div>
                {formData.paymentType === "deposit" && (
                  <p className="text-xs text-gray-400 mt-3">
                    * Remaining balance of {formatPrice(bookingTotal.total - Math.round(bookingTotal.total / 2))} due before your booking date
                  </p>
                )}
              </div>
            </motion.div>
          )}

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting || !bookingTotal}
              className="bg-black text-white px-12 py-4 text-sm tracking-widest hover:bg-[#DC143C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  PROCESSING...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  {bookingTotal
                    ? formData.paymentType === "deposit"
                      ? `PAY ${formatPrice(Math.round(bookingTotal.total / 2))} DEPOSIT`
                      : `PAY ${formatPrice(bookingTotal.total)}`
                    : "SELECT OPTIONS TO CONTINUE"}
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Secure payment powered by Stripe
            </p>
          </div>

          {submitStatus === "error" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-600"
            >
              Something went wrong. Please try again.
            </motion.p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
