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
              <div className="border border-gray-300 p-4">
                <label className="block text-sm text-black font-medium mb-3">Audio</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="audio-mic" className="mr-2" />
                    <label htmlFor="audio-mic" className="text-sm text-black">Microphone</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="audio-lavalier" className="mr-2" />
                    <label htmlFor="audio-lavalier" className="text-sm text-black">Lavalier Mic</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="audio-wireless" className="mr-2" />
                    <label htmlFor="audio-wireless" className="text-sm text-black">Wireless System</label>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 p-4">
                <label className="block text-sm text-black font-medium mb-3">Cameras</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="cameras-4k" className="mr-2" />
                    <label htmlFor="cameras-4k" className="text-sm text-black">4K Camera</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="cameras-6k" className="mr-2" />
                    <label htmlFor="cameras-6k" className="text-sm text-black">6K Camera</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="cameras-cinema" className="mr-2" />
                    <label htmlFor="cameras-cinema" className="text-sm text-black">Cinema Camera</label>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 p-4">
                <label className="block text-sm text-black font-medium mb-3">Lighting</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="lighting-key" className="mr-2" />
                    <label htmlFor="lighting-key" className="text-sm text-black">Key Light</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="lighting-fill" className="mr-2" />
                    <label htmlFor="lighting-fill" className="text-sm text-black">Fill Light</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="lighting-back" className="mr-2" />
                    <label htmlFor="lighting-back" className="text-sm text-black">Back Light</label>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 border-t border-gray-300 pt-6">
              <span className="font-semibold block mb-2">*All camera hires must include our camera operator @£300 per day</span>
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="border border-gray-300 p-4">
                <label className="block text-sm text-black font-medium mb-3">Lens/Filters</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="lens-prime" className="mr-2" />
                    <label htmlFor="lens-prime" className="text-sm text-black">Prime Lens</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="lens-zoom" className="mr-2" />
                    <label htmlFor="lens-zoom" className="text-sm text-black">Zoom Lens</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="lens-filter" className="mr-2" />
                    <label htmlFor="lens-filter" className="text-sm text-black">ND Filter</label>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 p-4">
                <label className="block text-sm text-black font-medium mb-3">Accessories</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="acc-tripod" className="mr-2" />
                    <label htmlFor="acc-tripod" className="text-sm text-black">Tripod</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="acc-slider" className="mr-2" />
                    <label htmlFor="acc-slider" className="text-sm text-black">Slider</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="acc-teleprompter" className="mr-2" />
                    <label htmlFor="acc-teleprompter" className="text-sm text-black">Teleprompter</label>
                  </div>
                </div>
              </div>

              <div className="border border-gray-300 p-4">
                <label className="block text-sm text-black font-medium mb-3">Recording & Monitoring</label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="rec-recording" className="mr-2" />
                    <label htmlFor="rec-recording" className="text-sm text-black">Recording Device</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="rec-monitor" className="mr-2" />
                    <label htmlFor="rec-monitor" className="text-sm text-black">Monitor</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="rec-storage" className="mr-2" />
                    <label htmlFor="rec-storage" className="text-sm text-black">Storage</label>
                  </div>
                </div>
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
