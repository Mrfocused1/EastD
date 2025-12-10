"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SamplePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/sample-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create checkout session");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fdfbf8] pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-2xl">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-light mb-6 text-center">
              Test Payment
            </h1>

            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg">Test Service</span>
                <span className="text-2xl font-semibold">£1.00</span>
              </div>
              <p className="text-gray-600 text-sm">
                This is a test payment of £1 to verify Stripe integration is working correctly.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-black text-white py-4 text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "PROCESSING..." : "PAY £1.00 NOW"}
            </button>

            <p className="text-center text-gray-500 text-xs mt-4">
              Use test card: 4242 4242 4242 4242 | Any future date | Any CVC
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
