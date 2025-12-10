"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, Calendar, Mail } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // You could verify the session here if needed
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fdfbf8] pt-24">
        <section className="py-24">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-light text-black mb-6">
                Booking Confirmed!
              </h1>

              <p className="text-lg text-gray-600 mb-8">
                Thank you for your booking. Your payment has been processed successfully.
              </p>

              <div className="bg-white border border-gray-200 p-8 mb-8">
                <h2 className="text-xl font-medium text-black mb-6">What happens next?</h2>

                <div className="space-y-6 text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black">Confirmation Email</h3>
                      <p className="text-gray-600 text-sm">
                        You&apos;ll receive a confirmation email with all your booking details and receipt.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black">Calendar Invite</h3>
                      <p className="text-gray-600 text-sm">
                        Our team will send you a calendar invite with the studio address and any preparation instructions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-block bg-black text-white px-10 py-4 text-sm tracking-widest hover:bg-[#DC143C] transition-colors"
                >
                  BACK TO HOME
                </Link>
                <Link
                  href="/booking"
                  className="inline-block border-2 border-black text-black px-10 py-4 text-sm tracking-widest hover:bg-black hover:text-white transition-all duration-300"
                >
                  BOOK ANOTHER SESSION
                </Link>
              </div>

              <p className="text-sm text-gray-500 mt-8">
                Questions? Contact us at{" "}
                <a
                  href="mailto:admin@eastdockstudios.co.uk"
                  className="text-[#DC143C] hover:underline"
                >
                  admin@eastdockstudios.co.uk
                </a>
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fdfbf8]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
