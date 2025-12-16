"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, AlertCircle, CheckCircle, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "setup";

export default function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [needsSetup, setNeedsSetup] = useState(false);

  // Check if already logged in or needs setup
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/admin/auth/status");
        const data = await res.json();

        if (data.authenticated) {
          router.push("/admin");
          return;
        }

        setNeedsSetup(!data.hasPassword);
        if (!data.hasPassword) {
          setMode("setup");
        }
      } catch (err) {
        console.error("Error checking auth:", err);
      }
      setCheckingAuth(false);
    }
    checkStatus();
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid password");
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
      const res = await fetch("/api/admin/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to set up password");
      } else {
        setSuccess("Password set! Redirecting...");
        setTimeout(() => router.push("/admin"), 1000);
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
            {mode === "login" ? "Admin Login" : "Setup Admin Password"}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-black/60 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/30" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-black/20 focus:border-black outline-none text-black"
                    placeholder="Enter admin password"
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

              {needsSetup && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("setup");
                    setError("");
                    setPassword("");
                  }}
                  className="w-full text-sm text-[#DC143C] hover:underline flex items-center justify-center gap-1 pt-2"
                >
                  <KeyRound className="w-4 h-4" />
                  Setup new password
                </button>
              )}
            </form>
          )}

          {/* Setup Form */}
          {mode === "setup" && (
            <form onSubmit={handleSetup} className="space-y-4">
              <p className="text-sm text-black/60 mb-4">
                Create a password for the admin panel.
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
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "SET PASSWORD"}
              </button>

              {!needsSetup && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="w-full text-sm text-black/60 hover:text-black"
                >
                  Back to login
                </button>
              )}
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
