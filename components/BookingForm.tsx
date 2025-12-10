"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar, Clock, ChevronLeft, ChevronRight, CreditCard, Loader2 } from "lucide-react";
import { calculateBookingTotal, formatPrice, StudioType, BookingLength, StudioPricing, AddonPricing, DEFAULT_STUDIOS, DEFAULT_ADDONS } from "@/lib/stripe";

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
      { value: "e16", label: "E16 SET" },
      { value: "e20", label: "E20 SET" },
      { value: "lux", label: "LUX SET" },
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
    label: "BOOKING LENGTH/TYPE",
    type: "select",
    required: true,
    options: [
      { value: "minimum2hrs", label: "MINIMUM 2HRS" },
      { value: "halfday4hrs", label: "HALF DAY (4HRS)" },
      { value: "fullday8hrs", label: "FULL DAY (8HRS)" },
    ],
    order: 6,
  },
  {
    id: "cameraLens",
    name: "cameraLens",
    label: "CAMERA AND LENS",
    type: "select",
    required: false,
    options: [
      { value: "quantity2more", label: "QUANTITY, UPTO 2MORE (AS EACH BOOKING COMES WITH TWO CAMERAS ALREADY) - £30 EACH" },
    ],
    order: 7,
  },
  {
    id: "videoSwitcher",
    name: "videoSwitcher",
    label: "VIDEO SWITCHER",
    type: "select",
    required: false,
    options: [
      { value: "halfday", label: "ENGINEER FOR UPTO HALF DAY SESSION - £35" },
      { value: "fullday", label: "FULL DAY - £60" },
    ],
    order: 8,
  },
  {
    id: "accessories",
    name: "accessories",
    label: "ACCESSORIES",
    type: "select",
    required: false,
    options: [
      { value: "teleprompter", label: "TELEPROMPTER - £25" },
    ],
    order: 9,
  },
  {
    id: "comments",
    name: "comments",
    label: "COMMENTS",
    type: "textarea",
    required: false,
    placeholder: "Enter any additional comments (optional)",
    order: 10,
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
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  required: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [selectedTime, setSelectedTime] = useState(value ? value.split("T")[1]?.substring(0, 5) || "09:00" : "09:00");
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const timeSlots = [];
  for (let h = 6; h <= 22; h++) {
    timeSlots.push(`${h.toString().padStart(2, "0")}:00`);
    timeSlots.push(`${h.toString().padStart(2, "0")}:30`);
  }

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
              <div className="h-64 overflow-y-auto space-y-1">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors
                      ${selectedTime === time ? "bg-black text-white" : "hover:bg-gray-100"}
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
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
  const [fields, setFields] = useState<FormField[]>(defaultFields);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [studioTitles, setStudioTitles] = useState({
    e16: "E16 SET",
    e20: "E20 SET",
    lux: "LUX SET",
  });

  // Pricing state
  const [pricingStudios, setPricingStudios] = useState<StudioPricing[]>(DEFAULT_STUDIOS);
  const [pricingAddons, setPricingAddons] = useState<AddonPricing[]>(DEFAULT_ADDONS);

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
        .in("key", ["e16_title", "e20_title", "lux_title"]);

      if (error) {
        console.error("Error loading studio titles:", error);
        return;
      }

      if (data && data.length > 0) {
        const newTitles = { e16: "E16 SET", e20: "E20 SET", lux: "LUX SET" };
        data.forEach((item: { key: string; value: string }) => {
          if (item.key === "e16_title") newTitles.e16 = item.value;
          if (item.key === "e20_title") newTitles.e20 = item.value;
          if (item.key === "lux_title") newTitles.lux = item.value;
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

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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
        body: JSON.stringify(formData),
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

  // Calculate current booking total
  const getBookingTotal = () => {
    const studio = formData.studio as StudioType;
    const bookingLength = formData.bookingLength as BookingLength;

    if (!studio || !bookingLength) {
      return null;
    }

    return calculateBookingTotal(
      studio,
      bookingLength,
      {
        cameraLens: formData.cameraLens,
        videoSwitcher: formData.videoSwitcher,
        accessories: formData.accessories,
      },
      pricingStudios,
      pricingAddons
    );
  };

  const bookingTotal = getBookingTotal();

  const getStudioOptions = (field: FormField) => {
    if (field.name === "studio") {
      return [
        { value: "e16", label: studioTitles.e16 },
        { value: "e20", label: studioTitles.e20 },
        { value: "lux", label: studioTitles.lux },
      ];
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
        return (
          <DateTimePicker
            key={field.id}
            value={formData[field.name] || ""}
            onChange={(value) => handleChange(field.name, value)}
            label={field.label}
            required={field.required}
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
                  {bookingTotal ? `PAY ${formatPrice(bookingTotal.total)}` : "SELECT OPTIONS TO CONTINUE"}
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
