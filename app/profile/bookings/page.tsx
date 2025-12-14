"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseAuth, UserBooking } from "@/lib/supabase-auth";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function BookingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("all");
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  async function loadBookings() {
    try {
      const { data, error } = await supabaseAuth
        .from("user_bookings")
        .select("*")
        .eq("user_id", user?.id)
        .order("booking_date", { ascending: false });

      if (data) setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoadingBookings(false);
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const now = new Date();
    const bookingDate = new Date(booking.booking_date);

    switch (filter) {
      case "upcoming":
        return bookingDate > now && booking.status !== "cancelled";
      case "past":
        return bookingDate <= now && booking.status !== "cancelled";
      case "cancelled":
        return booking.status === "cancelled";
      default:
        return true;
    }
  });

  const getStatusColor = (status: string, bookingDate: string) => {
    if (status === "cancelled") return "bg-red-100 text-red-700";
    if (new Date(bookingDate) < new Date()) return "bg-gray-100 text-gray-700";
    return "bg-green-100 text-green-700";
  };

  const getStatusText = (status: string, bookingDate: string) => {
    if (status === "cancelled") return "Cancelled";
    if (new Date(bookingDate) < new Date()) return "Completed";
    return "Confirmed";
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#fdfbf8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf8]">
      {/* Header */}
      <header className="bg-white border-b border-black/10">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="text-xl font-light tracking-[0.2em] text-black">
            EASTDOCK
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-light text-black">My Bookings</h1>
            <Link
              href="/booking"
              className="px-6 py-2 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors"
            >
              NEW BOOKING
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {(["all", "upcoming", "past", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm tracking-widest transition-colors ${
                  filter === f
                    ? "bg-black text-white"
                    : "bg-white border border-black/20 hover:border-black"
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {loadingBookings ? (
            <div className="bg-white border border-black/10 p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-black/40" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white border border-black/10 p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-black/20 mb-4" />
              <p className="text-black/60 mb-4">
                {filter === "all"
                  ? "You haven't made any bookings yet"
                  : `No ${filter} bookings`}
              </p>
              <Link
                href="/booking"
                className="inline-block px-6 py-2 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors"
              >
                BOOK NOW
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white border border-black/10 overflow-hidden"
                >
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() =>
                      setExpandedBooking(
                        expandedBooking === booking.id ? null : booking.id
                      )
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium">{booking.studio_name}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded ${getStatusColor(
                              booking.status,
                              booking.booking_date
                            )}`}
                          >
                            {getStatusText(booking.status, booking.booking_date)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-black/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.booking_date).toLocaleDateString("en-GB", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(booking.booking_date).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            ({booking.duration_hours} hours)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">
                            £{(booking.amount_paid / 100).toFixed(2)}
                          </p>
                          {booking.remaining_balance > 0 && (
                            <p className="text-xs text-orange-600">
                              £{(booking.remaining_balance / 100).toFixed(2)} remaining
                            </p>
                          )}
                        </div>
                        {expandedBooking === booking.id ? (
                          <ChevronUp className="w-5 h-5 text-black/40" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-black/40" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedBooking === booking.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t border-black/10 p-6 bg-black/[0.02]"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-black/60 mb-2">
                            BOOKING DETAILS
                          </h4>
                          <table className="w-full text-sm">
                            <tbody>
                              <tr>
                                <td className="py-1 text-black/60">Studio</td>
                                <td className="py-1">{booking.studio_name}</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-black/60">Duration</td>
                                <td className="py-1">{booking.duration_hours} hours</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-black/60">Payment Type</td>
                                <td className="py-1 capitalize">{booking.payment_type}</td>
                              </tr>
                              {booking.discount_code && (
                                <tr>
                                  <td className="py-1 text-black/60">Discount Code</td>
                                  <td className="py-1">
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                                      {booking.discount_code}
                                    </span>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-black/60 mb-2">
                            PAYMENT SUMMARY
                          </h4>
                          <table className="w-full text-sm">
                            <tbody>
                              <tr>
                                <td className="py-1 text-black/60">Total Amount</td>
                                <td className="py-1">
                                  £{(booking.total_amount / 100).toFixed(2)}
                                </td>
                              </tr>
                              {booking.discount_amount > 0 && (
                                <tr>
                                  <td className="py-1 text-black/60">Discount</td>
                                  <td className="py-1 text-green-600">
                                    -£{(booking.discount_amount / 100).toFixed(2)}
                                  </td>
                                </tr>
                              )}
                              <tr>
                                <td className="py-1 text-black/60">Amount Paid</td>
                                <td className="py-1">
                                  £{(booking.amount_paid / 100).toFixed(2)}
                                </td>
                              </tr>
                              {booking.remaining_balance > 0 && (
                                <tr>
                                  <td className="py-1 text-black/60">Remaining</td>
                                  <td className="py-1 text-orange-600">
                                    £{(booking.remaining_balance / 100).toFixed(2)}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {booking.comments && (
                        <div className="mt-4 pt-4 border-t border-black/10">
                          <h4 className="text-sm font-medium text-black/60 mb-2">
                            COMMENTS
                          </h4>
                          <p className="text-sm">{booking.comments}</p>
                        </div>
                      )}

                      <div className="mt-6 pt-4 border-t border-black/10 flex gap-4">
                        <button className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors">
                          <Download className="w-4 h-4" />
                          Download Receipt
                        </button>
                        {new Date(booking.booking_date) > new Date() &&
                          booking.status !== "cancelled" && (
                            <button className="text-sm text-red-600 hover:text-red-700 transition-colors">
                              Cancel Booking
                            </button>
                          )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
