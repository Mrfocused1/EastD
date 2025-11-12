"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

const bookingSchema = z.object({
  studio: z.string().min(1, "Please select a studio"),
  bookingType: z.string().min(1, "Please select a booking type"),
  audio: z.array(z.string()).optional(),
  cameras: z.array(z.string()).optional(),
  lighting: z.array(z.string()).optional(),
  lensFilters: z.array(z.string()).optional(),
  accessories: z.array(z.string()).optional(),
  recordingMonitoring: z.array(z.string()).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus("success");
        reset();
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* Studio and Booking Type */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-black font-medium mb-2">Studios *</label>
              <select
                {...register("studio")}
                className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                }}
              >
                <option value="">Select Studio</option>
                <option value="e16">E16 SET</option>
                <option value="e20">E20 SET</option>
                <option value="lux">LUX SET</option>
              </select>
              {errors.studio && (
                <p className="text-red-600 text-sm mt-1">{errors.studio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-black font-medium mb-2">Booking Types *</label>
              <select
                {...register("bookingType")}
                className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                }}
              >
                <option value="">Select</option>
                <option value="minimum2hrs">Minimum 2 Hours</option>
                <option value="halfday">Half Day (4 Hours)</option>
                <option value="fullday">Full Day (8 Hours)</option>
              </select>
              {errors.bookingType && (
                <p className="text-red-600 text-sm mt-1">{errors.bookingType.message}</p>
              )}
            </div>
          </div>

          {/* Equipment & Dry Hire Section */}
          <div>
            <h3 className="text-lg font-medium text-black mb-6">Equipment & Dry Hire</h3>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm text-black font-medium mb-2">Audio</label>
                <select
                  {...register("audio")}
                  className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="">Multi Select</option>
                  <option value="microphone">Microphone</option>
                  <option value="lavalier">Lavalier Mic</option>
                  <option value="wireless">Wireless System</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-black font-medium mb-2">Cameras</label>
                <select
                  {...register("cameras")}
                  className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="">Multi Select</option>
                  <option value="4k">4K Camera</option>
                  <option value="6k">6K Camera</option>
                  <option value="cinema">Cinema Camera</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-black font-medium mb-2">Lighting</label>
                <select
                  {...register("lighting")}
                  className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="">Multi Select</option>
                  <option value="key">Key Light</option>
                  <option value="fill">Fill Light</option>
                  <option value="backlight">Back Light</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 border-t border-gray-300 pt-6">
              <span className="font-semibold block mb-2">*All camera hires must include our camera operator @£300 per day</span>
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-black font-medium mb-2">Lens/Filters</label>
                <select
                  {...register("lensFilters")}
                  className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="">Multi Select</option>
                  <option value="prime">Prime Lens</option>
                  <option value="zoom">Zoom Lens</option>
                  <option value="filter">ND Filter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-black font-medium mb-2">Accessories</label>
                <select
                  {...register("accessories")}
                  className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="">Multi Select</option>
                  <option value="tripod">Tripod</option>
                  <option value="slider">Slider</option>
                  <option value="teleprompter">Teleprompter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-black font-medium mb-2">Recording & Monitoring</label>
                <select
                  {...register("recordingMonitoring")}
                  className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="">Multi Select</option>
                  <option value="recording">Recording Device</option>
                  <option value="monitor">Monitor</option>
                  <option value="storage">Storage</option>
                </select>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white px-12 py-4 text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT BOOKING REQUEST"}
            </button>
          </div>

          {submitStatus === "success" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-green-600"
            >
              Thank you! We'll be in touch shortly.
            </motion.p>
          )}

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
