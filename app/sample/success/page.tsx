"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fdfbf8] pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-light mb-4">Payment Successful!</h1>

            <p className="text-gray-600 mb-6">
              Your test payment of £1.00 was processed successfully.
              <br />
              Stripe integration is working correctly.
            </p>

            {sessionId && (
              <p className="text-xs text-gray-400 mb-6 break-all">
                Session ID: {sessionId}
              </p>
            )}

            <div className="space-y-3">
              <Link
                href="/sample"
                className="block w-full bg-black text-white py-3 text-sm tracking-widest hover:bg-gray-800 transition-colors"
              >
                TEST AGAIN
              </Link>
              <Link
                href="/booking"
                className="block w-full border border-black text-black py-3 text-sm tracking-widest hover:bg-gray-100 transition-colors"
              >
                GO TO BOOKING
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SampleSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
