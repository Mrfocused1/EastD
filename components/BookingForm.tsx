"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const bookingSchema = z.object({
  studio: z.string().min(1, "Please select a studio"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  bookingDate: z.string().min(1, "Please select a date"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  bookingLength: z.string().min(1, "Please select booking length"),
  cameraLens: z.string().optional(),
  videoSwitcher: z.string().optional(),
  accessories: z.string().optional(),
  comments: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  preselectedStudio?: string;
}

export default function BookingForm({ preselectedStudio }: BookingFormProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [studioTitles, setStudioTitles] = useState({
    e16: "E16 SET",
    e20: "E20 SET",
    lux: "LUX SET",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      studio: preselectedStudio || "",
    },
  });

  useEffect(() => {
    async function loadStudioTitles() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('page', 'global')
          .eq('section', 'settings')
          .in('key', ['e16_title', 'e20_title', 'lux_title']);

        if (error) {
          console.error('Error loading studio titles:', error);
          return;
        }

        if (data && data.length > 0) {
          const newTitles = { e16: "E16 SET", e20: "E20 SET", lux: "LUX SET" };
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'e16_title') newTitles.e16 = item.value;
            if (item.key === 'e20_title') newTitles.e20 = item.value;
            if (item.key === 'lux_title') newTitles.lux = item.value;
          });
          setStudioTitles(newTitles);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadStudioTitles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          className="space-y-6"
        >
          {/* Studios and Name */}
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
                <option value="e16">{studioTitles.e16}</option>
                <option value="e20">{studioTitles.e20}</option>
                <option value="lux">{studioTitles.lux}</option>
              </select>
              {errors.studio && (
                <p className="text-red-600 text-sm mt-1">{errors.studio.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-black font-medium mb-2">NAME *</label>
              <input
                {...register("name")}
                type="text"
                placeholder="Enter your name"
                className="w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Date and Email */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-black font-medium mb-2">DATE OF ENQUIRED BOOKING *</label>
              <input
                {...register("bookingDate")}
                type="date"
                className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors"
              />
              {errors.bookingDate && (
                <p className="text-red-600 text-sm mt-1">{errors.bookingDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-black font-medium mb-2">EMAIL *</label>
              <input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm text-black font-medium mb-2">NUMBER *</label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="Enter your phone number"
              className="w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Booking Length/Type */}
          <div>
            <label className="block text-sm text-black font-medium mb-2">BOOKING LENGTH/TYPE *</label>
            <select
              {...register("bookingLength")}
              className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
              }}
            >
              <option value="">Select Booking Length</option>
              <option value="minimum2hrs">MINIMUM 2HRS</option>
              <option value="halfday4hrs">HALF DAY (4HRS)</option>
              <option value="fullday8hrs">FULL DAY (8HRS)</option>
            </select>
            {errors.bookingLength && (
              <p className="text-red-600 text-sm mt-1">{errors.bookingLength.message}</p>
            )}
          </div>

          {/* Camera and Lens */}
          <div>
            <label className="block text-sm text-black font-medium mb-2">CAMERA AND LENS</label>
            <select
              {...register("cameraLens")}
              className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
              }}
            >
              <option value="">Select Camera Option</option>
              <option value="quantity2more">QUANTITY, UPTO 2MORE (AS EACH BOOKING COMES WITH TWO CAMERAS ALREADY) - £30 EACH</option>
            </select>
          </div>

          {/* Video Switcher */}
          <div>
            <label className="block text-sm text-black font-medium mb-2">VIDEO SWITCHER</label>
            <select
              {...register("videoSwitcher")}
              className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
              }}
            >
              <option value="">Select Video Switcher Option</option>
              <option value="halfday">ENGINEER FOR UPTO HALF DAY SESSION - £35</option>
              <option value="fullday">FULL DAY - £60</option>
            </select>
          </div>

          {/* Accessories */}
          <div>
            <label className="block text-sm text-black font-medium mb-2">ACCESSORIES</label>
            <select
              {...register("accessories")}
              className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
              }}
            >
              <option value="">Select Accessories</option>
              <option value="teleprompter">TELEPROMPTER - £25</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm text-black font-medium mb-2">COMMENTS</label>
            <textarea
              {...register("comments")}
              placeholder="Enter any additional comments (optional)"
              rows={4}
              className="w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors resize-none"
            />
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
