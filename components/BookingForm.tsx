"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

const bookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  bookingDate: z.string().min(1, "Please select a date"),
  bookingLength: z.string().min(1, "Please select booking length"),
  cameraLens: z.string().optional(),
  videoSwitcher: z.string().optional(),
  accessories: z.string().optional(),
  comments: z.string().optional(),
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
    <section id="booking" className="py-24 bg-[#121316] text-white">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-light mb-4">Get In Touch</h2>
          <p className="text-gray-400">Book your studio session today</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <input
                {...register("name")}
                type="text"
                placeholder="NAME *"
                className="w-full bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-white transition-colors"
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <input
                {...register("email")}
                type="email"
                placeholder="EMAIL *"
                className="w-full bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-white transition-colors"
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                {...register("phone")}
                type="tel"
                placeholder="NUMBER *"
                className="w-full bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-white transition-colors"
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <input
                {...register("bookingDate")}
                type="date"
                placeholder="DATE OF ENQUIRED BOOKING *"
                className="w-full bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:border-white transition-colors"
              />
              {errors.bookingDate && (
                <p className="text-red-400 text-sm mt-1">{errors.bookingDate.message}</p>
              )}
            </div>

            <div>
              <select
                {...register("bookingLength")}
                className="w-full bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                }}
              >
                <option value="" className="bg-[#121316] text-gray-400">BOOKING LENGTH/TYPE *</option>
                <option value="minimum2hrs" className="bg-[#121316] text-white">MINIMUM 2HRS</option>
                <option value="halfday4hrs" className="bg-[#121316] text-white">HALF DAY (4HRS)</option>
                <option value="fullday8hrs" className="bg-[#121316] text-white">FULL DAY (8HRS)</option>
              </select>
              {errors.bookingLength && (
                <p className="text-red-400 text-sm mt-1">{errors.bookingLength.message}</p>
              )}
            </div>

            <div>
              <select
                {...register("cameraLens")}
                className="w-full bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                }}
              >
                <option value="" className="bg-[#121316] text-gray-400">CAMERA AND LENS (optional)</option>
                <option value="1camera" className="bg-[#121316] text-white">+1 CAMERA - £30</option>
                <option value="2camera" className="bg-[#121316] text-white">+2 CAMERAS - £60</option>
              </select>
            </div>

            <div>
              <select
                {...register("videoSwitcher")}
                className="w-full bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                }}
              >
                <option value="" className="bg-[#121316] text-gray-400">VIDEO SWITCHER (optional)</option>
                <option value="halfday" className="bg-[#121316] text-white">HALF DAY SESSION - £35</option>
                <option value="fullday" className="bg-[#121316] text-white">FULL DAY - £60</option>
              </select>
            </div>

            <div>
              <select
                {...register("accessories")}
                className="w-full bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-white transition-colors appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                }}
              >
                <option value="" className="bg-[#121316] text-gray-400">ACCESSORIES (optional)</option>
                <option value="teleprompter" className="bg-[#121316] text-white">TELEPROMPTER - £25</option>
              </select>
            </div>
          </div>

          <div>
            <textarea
              {...register("comments")}
              placeholder="COMMENTS (optional)"
              rows={4}
              className="w-full bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:border-white transition-colors resize-none"
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-black px-12 py-4 text-sm tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT BOOKING REQUEST"}
            </button>
          </div>

          {submitStatus === "success" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-green-400"
            >
              Thank you! We'll be in touch shortly.
            </motion.p>
          )}

          {submitStatus === "error" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-400"
            >
              Something went wrong. Please try again.
            </motion.p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
