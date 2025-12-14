"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { supabaseAuth } from "@/lib/supabase-auth";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "admin@eastdockstudios.co.uk";

type AuthMode = "login" | "setup" | "forgot-password" | "reset-password";

export default function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  // Check if user is already logged in as admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabaseAuth.auth.getSession();
        if (session?.user?.email === ADMIN_EMAIL) {
          router.push("/admin");
          return;
        }
      } catch (err) {
        console.error("Error checking auth:", err);
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  // Check if admin account exists
  useEffect(() => {
    async function checkAdminExists() {
      try {
        // Try to sign in with a dummy password to check if user exists
        // This is a workaround since we can't directly query if a user exists
        const { error } = await supabaseAuth.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: "check_if_exists_dummy_password_12345",
        });

        // If error is "Invalid login credentials", user exists but password is wrong
        // If error is "User not found" or similar, user doesn't exist
        if (error?.message?.includes("Invalid login credentials")) {
          setAdminExists(true);
        } else {
          setAdminExists(false);
        }
      } catch (err) {
        setAdminExists(false);
      }
    }
    checkAdminExists();
  }, []);

  // Check URL for password reset token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.includes("type=recovery")) {
        setMode("reset-password");
      }
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (email.toLowerCase() !== ADMIN_EMAIL) {
      setError("Access denied. Only the admin account can log in.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabaseAuth.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/admin");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (email.toLowerCase() !== ADMIN_EMAIL) {
      setError(`Access denied. Only ${ADMIN_EMAIL} can create an admin account.`);
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabaseAuth.auth.signUp({
        email: ADMIN_EMAIL,
        password,
        options: {
          data: {
            full_name: "Admin",
            role: "admin",
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Admin account created! You can now log in.");
        setAdminExists(true);
        setMode("login");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (email.toLowerCase() !== ADMIN_EMAIL) {
      setError(`Password reset is only available for ${ADMIN_EMAIL}`);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabaseAuth.auth.resetPasswordForEmail(ADMIN_EMAIL, {
        redirectTo: `${window.location.origin}/admin/login`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabaseAuth.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password updated successfully! You can now log in.");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        // Clear the hash from URL
        window.history.replaceState(null, "", "/admin/login");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#fdfbf8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf8] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-widest text-black mb-2">EASTDOCK</h1>
          <p className="text-xs tracking-[0.3em] text-black/60">ADMIN PANEL</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-black/10 p-8">
          <h2 className="text-xl font-light text-black mb-6">
            {mode === "login" && "Admin Login"}
            {mode === "setup" && "Create Admin Account"}
            {mode === "forgot-password" && "Reset Password"}
            {mode === "reset-password" && "Set New Password"}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-black/60 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-black/20 focus:border-black outline-none text-black"
                    placeholder="admin@eastdockstudios.co.uk"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-black/60 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-black/20 focus:border-black outline-none text-black"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "LOGIN"}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot-password");
                    setError("");
                    setSuccess("");
                  }}
                  className="text-sm text-black/60 hover:text-black"
                >
                  Forgot password?
                </button>

                {adminExists === false && (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("setup");
                        setError("");
                        setSuccess("");
                      }}
                      className="text-sm text-[#DC143C] hover:underline"
                    >
                      First time? Create admin account
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* Setup Form */}
          {mode === "setup" && (
            <form onSubmit={handleSetup} className="space-y-4">
              <div>
                <label className="block text-sm text-black/60 mb-2">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-black/20 focus:border-black outline-none text-black"
                    placeholder="admin@eastdockstudios.co.uk"
                    required
                  />
                </div>
                <p className="text-xs text-black/40 mt-1">Must be: {ADMIN_EMAIL}</p>
              </div>

              <div>
                <label className="block text-sm text-black/60 mb-2">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-black/20 focus:border-black outline-none text-black"
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-black/60 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-black/20 focus:border-black outline-none text-black"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "CREATE ACCOUNT"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-sm text-black/60 hover:text-black"
              >
                Back to login
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === "forgot-password" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-sm text-black/60 mb-4">
                Enter your admin email to receive a password reset link.
              </p>

              <div>
                <label className="block text-sm text-black/60 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-black/20 focus:border-black outline-none text-black"
                    placeholder="admin@eastdockstudios.co.uk"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "SEND RESET LINK"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-sm text-black/60 hover:text-black"
              >
                Back to login
              </button>
            </form>
          )}

          {/* Reset Password Form */}
          {mode === "reset-password" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-black/60 mb-4">
                Enter your new password below.
              </p>

              <div>
                <label className="block text-sm text-black/60 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-black/20 focus:border-black outline-none text-black"
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-black/60 mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-black/20 focus:border-black outline-none text-black"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "UPDATE PASSWORD"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-black/40 mt-6">
          Authorized access only
        </p>
      </motion.div>
    </div>
  );
}
