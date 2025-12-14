"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Trash2,
  Loader2,
  Check,
  Camera,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, preferences, loading, updateProfile, updatePreferences, updatePassword, signOut } = useAuth();

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Preferences state
  const [emailBookings, setEmailBookings] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(true);
  const [emailDiscounts, setEmailDiscounts] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
    if (preferences) {
      setEmailBookings(preferences.email_booking_confirmations);
      setEmailReminders(preferences.email_booking_reminders);
      setEmailMarketing(preferences.email_marketing);
      setEmailDiscounts(preferences.email_discount_offers);
    }
  }, [profile, preferences]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaved(false);

    const { error } = await updateProfile({
      full_name: fullName,
      phone: phone,
    });

    setSavingProfile(false);
    if (!error) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setSavingPassword(true);

    const { error } = await updatePassword(newPassword);

    setSavingPassword(false);
    if (error) {
      setPasswordError(error.message || "Failed to update password");
    } else {
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  }

  async function handleSavePreferences() {
    setSavingPrefs(true);
    setPrefsSaved(false);

    const { error } = await updatePreferences({
      email_booking_confirmations: emailBookings,
      email_booking_reminders: emailReminders,
      email_marketing: emailMarketing,
      email_discount_offers: emailDiscounts,
    });

    setSavingPrefs(false);
    if (!error) {
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 3000);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return;
    // In a real app, you'd call an API to delete the account
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

      <main className="container mx-auto px-6 py-12 max-w-3xl">
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

          <h1 className="text-3xl font-light text-black mb-8">Account Settings</h1>

          {/* Profile Section */}
          <section className="bg-white border border-black/10 p-6 mb-6">
            <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black/70 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black/70 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full px-4 py-3 bg-black/5 border border-black/10 text-black/60 cursor-not-allowed"
                />
                <p className="text-xs text-black/50 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black/70 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7XXX XXXXXX"
                  className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    SAVING...
                  </>
                ) : profileSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    SAVED
                  </>
                ) : (
                  "SAVE CHANGES"
                )}
              </button>
            </form>
          </section>

          {/* Password Section */}
          <section className="bg-white border border-black/10 p-6 mb-6">
            <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Change Password
            </h2>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black/70 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black/70 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword || !newPassword || !confirmPassword}
                className="px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    UPDATING...
                  </>
                ) : passwordSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    UPDATED
                  </>
                ) : (
                  "UPDATE PASSWORD"
                )}
              </button>
            </form>
          </section>

          {/* Notification Preferences */}
          <section className="bg-white border border-black/10 p-6 mb-6">
            <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Email Preferences
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium">Booking Confirmations</p>
                  <p className="text-sm text-black/60">Receive confirmation emails for your bookings</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailBookings}
                  onChange={(e) => setEmailBookings(e.target.checked)}
                  className="w-5 h-5 accent-black"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium">Booking Reminders</p>
                  <p className="text-sm text-black/60">Get reminded before your upcoming sessions</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailReminders}
                  onChange={(e) => setEmailReminders(e.target.checked)}
                  className="w-5 h-5 accent-black"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-black/60">News, tips, and updates from East Dock Studios</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailMarketing}
                  onChange={(e) => setEmailMarketing(e.target.checked)}
                  className="w-5 h-5 accent-black"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium">Discount Offers</p>
                  <p className="text-sm text-black/60">Exclusive discount codes and special offers</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailDiscounts}
                  onChange={(e) => setEmailDiscounts(e.target.checked)}
                  className="w-5 h-5 accent-black"
                />
              </label>

              <button
                onClick={handleSavePreferences}
                disabled={savingPrefs}
                className="px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center gap-2 mt-4"
              >
                {savingPrefs ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    SAVING...
                  </>
                ) : prefsSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    SAVED
                  </>
                ) : (
                  "SAVE PREFERENCES"
                )}
              </button>
            </div>
          </section>

          {/* Delete Account */}
          <section className="bg-white border border-red-200 p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </h2>
            <p className="text-black/60 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 border border-red-600 text-red-600 text-sm tracking-widest hover:bg-red-50 transition-colors"
              >
                DELETE ACCOUNT
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-red-600 font-medium">
                  Type "DELETE" to confirm account deletion:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-4 py-3 border border-red-300 focus:outline-none focus:border-red-600"
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== "DELETE"}
                    className="px-6 py-3 bg-red-600 text-white text-sm tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    CONFIRM DELETE
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText("");
                    }}
                    className="px-6 py-3 border border-black/20 text-sm tracking-widest hover:bg-black/5 transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </section>
        </motion.div>
      </main>
    </div>
  );
}
