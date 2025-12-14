"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseAuth, UserBooking, UserFavorite } from "@/lib/supabase-auth";
import {
  User,
  Calendar,
  Heart,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  MapPin,
  PoundSterling,
  Loader2,
  Plus,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<UserBooking[]>([]);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  async function loadUserData() {
    try {
      const [bookingsRes, favoritesRes] = await Promise.all([
        supabaseAuth
          .from("user_bookings")
          .select("*")
          .eq("user_id", user?.id)
          .gte("booking_date", new Date().toISOString())
          .eq("status", "confirmed")
          .order("booking_date", { ascending: true })
          .limit(3),
        supabaseAuth
          .from("user_favorites")
          .select("*")
          .eq("user_id", user?.id)
          .limit(4),
      ]);

      if (bookingsRes.data) setUpcomingBookings(bookingsRes.data);
      if (favoritesRes.data) setFavorites(favoritesRes.data);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoadingData(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#fdfbf8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
      </div>
    );
  }

  const menuItems = [
    { href: "/profile/bookings", icon: Calendar, label: "My Bookings", description: "View and manage your bookings" },
    { href: "/profile/favorites", icon: Heart, label: "Favorites", description: "Your favorite studios" },
    { href: "/profile/cards", icon: CreditCard, label: "Payment Methods", description: "Manage saved cards" },
    { href: "/profile/settings", icon: Settings, label: "Account Settings", description: "Update your profile" },
  ];

  return (
    <div className="min-h-screen bg-[#fdfbf8]">
      {/* Header */}
      <header className="bg-white border-b border-black/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-light tracking-[0.2em] text-black">
            EASTDOCK
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white text-2xl font-light">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-light text-black">
                Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
              </h1>
              <p className="text-black/60 mt-1">{user.email}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-white border border-black/10 p-6">
            <div className="text-3xl font-light text-black">{profile?.total_bookings || 0}</div>
            <p className="text-sm text-black/60 mt-1">Total Bookings</p>
          </div>
          <div className="bg-white border border-black/10 p-6">
            <div className="text-3xl font-light text-black">
              £{((profile?.total_spent || 0) / 100).toFixed(0)}
            </div>
            <p className="text-sm text-black/60 mt-1">Total Spent</p>
          </div>
          <div className="bg-white border border-black/10 p-6">
            <div className="text-3xl font-light text-black">
              {profile?.member_since
                ? new Date(profile.member_since).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                : "-"}
            </div>
            <p className="text-sm text-black/60 mt-1">Member Since</p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upcoming Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Upcoming Bookings</h2>
              <Link
                href="/profile/bookings"
                className="text-sm text-black/60 hover:text-black transition-colors"
              >
                View All
              </Link>
            </div>

            {loadingData ? (
              <div className="bg-white border border-black/10 p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-black/40" />
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="bg-white border border-black/10 p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto text-black/20 mb-4" />
                <p className="text-black/60 mb-4">No upcoming bookings</p>
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-black text-white text-sm hover:bg-black/80 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Book Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="bg-white border border-black/10 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{booking.studio_name}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-black/60">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.booking_date).toLocaleDateString("en-GB", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(booking.booking_date).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Menu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg font-medium mb-4">Quick Menu</h2>
            <div className="space-y-3">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block bg-white border border-black/10 p-4 hover:border-black transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.label}</h3>
                        <p className="text-sm text-black/60">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-black/40 group-hover:text-black transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Your Favorite Studios</h2>
              <Link
                href="/profile/favorites"
                className="text-sm text-black/60 hover:text-black transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {favorites.map((favorite) => (
                <Link
                  key={favorite.id}
                  href={`/${favorite.studio_slug}`}
                  className="bg-white border border-black/10 p-4 hover:border-black transition-colors text-center"
                >
                  <Heart className="w-6 h-6 mx-auto text-red-500 mb-2" />
                  <p className="text-sm font-medium">{favorite.studio_name}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Book Now CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-black text-white p-8 text-center"
        >
          <h2 className="text-2xl font-light mb-2">Ready for Your Next Session?</h2>
          <p className="text-white/70 mb-6">Book your studio time today</p>
          <Link
            href="/booking"
            className="inline-block px-8 py-3 bg-white text-black text-sm tracking-widest hover:bg-gray-100 transition-colors"
          >
            BOOK NOW
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
