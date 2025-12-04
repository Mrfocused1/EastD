"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ExitIntentContent {
  enabled: boolean;
  headline: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  bannerText: string;
  bannerCtaText: string;
  bannerCtaLink: string;
}

const defaultContent: ExitIntentContent = {
  enabled: true,
  headline: "Wait! Don't Miss Your Intro Offer",
  body: "Get a personalised membership quote and receive a bonus discount.",
  ctaText: "Get My Quote",
  ctaLink: "/membership#membership-form",
  bannerText: "Leaving so soon? New members get exclusive first-month perks — don't miss out.",
  bannerCtaText: "Explore Benefits",
  bannerCtaLink: "/membership",
};

export default function ExitIntentPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [content, setContent] = useState<ExitIntentContent>(defaultContent);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from("site_content")
          .select("key, value")
          .eq("page", "global")
          .eq("section", "exit_intent");

        if (error) {
          console.error("Error loading exit intent content:", error);
          return;
        }

        if (data && data.length > 0) {
          const newContent = { ...defaultContent };
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === "enabled") newContent.enabled = item.value === "true";
            if (item.key === "headline") newContent.headline = item.value;
            if (item.key === "body") newContent.body = item.value;
            if (item.key === "cta_text") newContent.ctaText = item.value;
            if (item.key === "cta_link") newContent.ctaLink = item.value;
            if (item.key === "banner_text") newContent.bannerText = item.value;
            if (item.key === "banner_cta_text") newContent.bannerCtaText = item.value;
            if (item.key === "banner_cta_link") newContent.bannerCtaLink = item.value;
          });
          setContent(newContent);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }

    loadContent();
  }, []);

  const handleExitIntent = useCallback((e: MouseEvent) => {
    // Check if user has already seen the exit popup this session
    const hasSeenExit = sessionStorage.getItem("eastdock_exit_shown");

    if (hasSeenExit || hasTriggered || !content.enabled) return;

    // Detect if mouse is leaving towards the top of the page (closing/navigating away)
    if (e.clientY <= 5) {
      setHasTriggered(true);
      setShowPopup(true);
      sessionStorage.setItem("eastdock_exit_shown", "true");
    }
  }, [hasTriggered, content.enabled]);

  useEffect(() => {
    // Only add listener on desktop (exit intent doesn't work well on mobile)
    if (typeof window !== "undefined" && window.innerWidth > 768) {
      document.addEventListener("mouseleave", handleExitIntent);

      return () => {
        document.removeEventListener("mouseleave", handleExitIntent);
      };
    }
  }, [handleExitIntent]);

  const handleClosePopup = () => {
    setShowPopup(false);
    // Show the banner after closing the popup
    setTimeout(() => {
      setShowBanner(true);
    }, 500);
  };

  const handleCloseBanner = () => {
    setShowBanner(false);
  };

  // Don't render if disabled
  if (!content.enabled) return null;

  return (
    <>
      {/* Exit Intent Popup */}
      <AnimatePresence>
        {showPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
              onClick={handleClosePopup}
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className="relative bg-white text-black max-w-lg w-full overflow-hidden shadow-2xl">
                {/* Close Button */}
                <button
                  onClick={handleClosePopup}
                  className="absolute top-4 right-4 text-black/40 hover:text-black transition-colors z-10"
                  aria-label="Close popup"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Red accent bar */}
                <div className="h-1 bg-[#DC143C]" />

                {/* Content */}
                <div className="p-8 md:p-10 text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#DC143C]/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#DC143C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>

                  {/* Headline */}
                  <h2 className="text-2xl md:text-3xl font-light mb-4">
                    {content.headline}
                  </h2>

                  {/* Body */}
                  <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                    {content.body}
                  </p>

                  {/* CTA Button */}
                  <Link
                    href={content.ctaLink}
                    onClick={handleClosePopup}
                    className="inline-block bg-[#DC143C] text-white px-10 py-4 text-sm tracking-widest hover:bg-[#b01030] transition-colors"
                  >
                    {content.ctaText}
                  </Link>

                  {/* Dismiss Link */}
                  <button
                    onClick={handleClosePopup}
                    className="block w-full mt-4 text-gray-400 text-sm hover:text-gray-600 transition-colors"
                  >
                    No thanks, I&apos;ll continue browsing
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Banner (shows after popup is closed) */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-[90] bg-black text-white"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Close button */}
                <button
                  onClick={handleCloseBanner}
                  className="absolute top-2 right-2 md:static md:order-3 text-white/60 hover:text-white transition-colors"
                  aria-label="Close banner"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Text */}
                <p className="text-sm md:text-base text-center md:text-left flex-1 pr-8 md:pr-0">
                  <span className="text-[#DC143C] font-medium">Leaving so soon?</span>{" "}
                  {content.bannerText.replace("Leaving so soon? ", "")}
                </p>

                {/* CTA */}
                <Link
                  href={content.bannerCtaLink}
                  onClick={handleCloseBanner}
                  className="whitespace-nowrap border border-white px-6 py-2 text-xs tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
                >
                  {content.bannerCtaText}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
