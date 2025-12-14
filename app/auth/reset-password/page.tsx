"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Loader2, Eye, EyeOff, Check } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password strength indicators
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      setError("Password does not meet requirements");
      return;
    }

    setLoading(true);

    const { error } = await updatePassword(password);

    if (error) {
      setError(error.message || "Failed to reset password");
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#fdfbf8] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white border border-black/10 p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-light mb-4">Password Updated</h2>
            <p className="text-black/60 mb-6">
              Your password has been successfully reset. Redirecting to your profile...
            </p>
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-black/40" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf8] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="block text-center mb-8">
          <h1 className="text-2xl font-light tracking-[0.3em] text-black">EASTDOCK</h1>
          <p className="text-xs tracking-[0.2em] text-black/60 mt-1">STUDIOS</p>
        </Link>

        {/* Card */}
        <div className="bg-white border border-black/10 p-8">
          <h2 className="text-2xl font-light text-center mb-2">Reset Password</h2>
          <p className="text-sm text-black/60 text-center mb-8">
            Enter your new password below
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-black/70 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full pl-12 pr-12 py-3 bg-white border border-black/20 focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password requirements */}
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <span className={hasMinLength ? "text-green-600" : "text-black/40"}>
                  {hasMinLength ? "✓" : "○"} 8+ characters
                </span>
                <span className={hasUpperCase ? "text-green-600" : "text-black/40"}>
                  {hasUpperCase ? "✓" : "○"} Uppercase letter
                </span>
                <span className={hasLowerCase ? "text-green-600" : "text-black/40"}>
                  {hasLowerCase ? "✓" : "○"} Lowercase letter
                </span>
                <span className={hasNumber ? "text-green-600" : "text-black/40"}>
                  {hasNumber ? "✓" : "○"} Number
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black/70 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-white border border-black/20 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  UPDATING...
                </>
              ) : (
                "UPDATE PASSWORD"
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
