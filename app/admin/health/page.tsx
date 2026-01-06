"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, CheckCircle, AlertTriangle, XCircle, RefreshCw, Wrench } from "lucide-react";
import Link from "next/link";

interface HealthCheckResult {
  name: string;
  status: "ok" | "error" | "warning";
  message: string;
  duration?: number;
}

interface HealthReport {
  timestamp: string;
  overall: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheckResult[];
  summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
  };
}

interface FixResult {
  name: string;
  action: string;
  result: "success" | "failed" | "skipped";
}

export default function HealthCheckPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFixing, setIsFixing] = useState(false);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [fixes, setFixes] = useState<FixResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/health");
      if (!response.ok) {
        throw new Error("Failed to run health check");
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const runFixes = async () => {
    setIsFixing(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/health", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to run fixes");
      }
      const data = await response.json();
      setFixes(data.fixes);
      setReport(data.health);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getOverallColor = (overall: string) => {
    switch (overall) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "degraded":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "unhealthy":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm tracking-[0.3em] text-black/60 mb-2">SYSTEM</p>
            <h1 className="text-4xl font-light text-black">Health Check</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runHealthCheck}
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Run Check
            </button>
            <button
              onClick={runFixes}
              disabled={isFixing || isLoading}
              className="px-4 py-2 bg-amber-600 text-white text-sm hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isFixing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wrench className="w-4 h-4" />
              )}
              Auto-Fix Issues
            </button>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 p-4 mb-6 text-red-800"
        >
          {error}
        </motion.div>
      )}

      {isLoading && !report ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-black/40" />
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Overall Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`p-6 border ${getOverallColor(report.overall)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-light capitalize">{report.overall}</h2>
                <p className="text-sm mt-1 opacity-75">
                  Last checked: {new Date(report.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-light">
                  {report.summary.passed}/{report.summary.total}
                </div>
                <p className="text-sm opacity-75">checks passed</p>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {report.summary.passed} passed
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {report.summary.warnings} warnings
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-600" />
                {report.summary.failed} failed
              </span>
            </div>
          </motion.div>

          {/* Individual Checks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white border border-black/10"
          >
            <div className="p-4 border-b border-black/10">
              <h3 className="font-medium">Health Checks</h3>
            </div>
            <div className="divide-y divide-black/10">
              {report.checks.map((check, index) => (
                <div key={index} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="font-medium">{check.name}</p>
                      <p className="text-sm text-black/60">{check.message}</p>
                    </div>
                  </div>
                  {check.duration !== undefined && (
                    <span className="text-sm text-black/40">{check.duration}ms</span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Fix Results */}
          {fixes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white border border-black/10"
            >
              <div className="p-4 border-b border-black/10">
                <h3 className="font-medium">Auto-Fix Results</h3>
              </div>
              <div className="divide-y divide-black/10">
                {fixes.map((fix, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {fix.result === "success" ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : fix.result === "skipped" ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{fix.name}</p>
                        <p className="text-sm text-black/60">{fix.action}</p>
                      </div>
                    </div>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        fix.result === "success"
                          ? "bg-green-100 text-green-800"
                          : fix.result === "skipped"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {fix.result}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Architecture Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-blue-50 border border-blue-200 p-6"
          >
            <h3 className="font-medium text-blue-900 mb-3">Architecture Notes</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Admin authentication uses custom password-based auth with httpOnly cookies</li>
              <li>• All admin data operations go through API routes using server-side Supabase client</li>
              <li>• This bypasses RLS restrictions that would block browser-based requests</li>
              <li>• Session tokens are stored in the database and validated on each request</li>
            </ul>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
