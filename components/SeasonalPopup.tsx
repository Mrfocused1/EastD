"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Headphones } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface SeasonalContent {
  enabled: boolean;
  headline: string;
  body: string;
  ctaText: string;
  ctaLink: string;
  bannerText: string;
  bannerCtaText: string;
  bannerCtaLink: string;
}

const defaultContent: SeasonalContent = {
  enabled: true,
  headline: "Need Help With Your Next Shoot?",
  body: "Our team can support you from basic studio access to full production services. Ask us about tailored memberships.",
  ctaText: "Speak to Us",
  ctaLink: "/membership#membership-form",
  bannerText: "Create more with less stress. Members enjoy discounted gear, priority slots, and creative support.",
  bannerCtaText: "Become a Member",
  bannerCtaLink: "/membership",
};

export default function SeasonalPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [content, setContent] = useState<SeasonalContent>(defaultContent);

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from("site_content")
          .select("key, value")
          .eq("page", "global")
          .eq("section", "seasonal_popup");

        if (error) {
          console.error("Error loading seasonal popup content:", error);
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

  useEffect(() => {
    // Check if this is a first-time visitor (welcome popup will show instead)
    const isFirstTimeVisitor = !localStorage.getItem("eastdock_promo_seen");

    // Check if seasonal popup was already shown this session
    const hasSeenSeasonalThisSession = sessionStorage.getItem("eastdock_seasonal_shown");

    // Only show if:
    // 1. Not a first-time visitor (they see the welcome popup)
    // 2. Haven't seen this popup in the current session
    // 3. Popup is enabled
    if (!isFirstTimeVisitor && !hasSeenSeasonalThisSession && content.enabled) {
      // Delay showing popup for better UX
      const timer = setTimeout(() => {
        setShowPopup(true);
        sessionStorage.setItem("eastdock_seasonal_shown", "true");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [content.enabled]);

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
      {/* Seasonal Popup */}
      <AnimatePresence>
        {showPopup && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={handleClosePopup}
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            >
              <div className="relative bg-gradient-to-br from-[#1a1a1a] to-black text-white max-w-md w-full overflow-hidden shadow-2xl">
                {/* Close Button */}
                <button
                  onClick={handleClosePopup}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
                  aria-label="Close popup"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Decorative gradient overlay */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#DC143C]/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#DC143C]/10 rounded-full blur-2xl" />

                {/* Content */}
                <div className="relative p-8 md:p-10 text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#DC143C] rounded-full flex items-center justify-center">
                    <Headphones className="w-8 h-8 text-white" />
                  </div>

                  {/* Label */}
                  <p className="text-xs tracking-[0.3em] text-[#DC143C] mb-4">
                    CREATOR&apos;S BOOST
                  </p>

                  {/* Headline */}
                  <h2 className="text-2xl md:text-3xl font-light mb-4">
                    {content.headline}
                  </h2>

                  {/* Body */}
                  <p className="text-white/70 mb-8 max-w-sm mx-auto">
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
                    className="block w-full mt-4 text-white/40 text-sm hover:text-white/60 transition-colors"
                  >
                    Maybe later
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
            className="fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-gray-200 shadow-lg"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Close button */}
                <button
                  onClick={handleCloseBanner}
                  className="absolute top-2 right-2 md:static md:order-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close banner"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Text */}
                <p className="text-sm md:text-base text-center md:text-left flex-1 pr-8 md:pr-0 text-gray-700">
                  <span className="font-medium text-black">Creator&apos;s Boost:</span>{" "}
                  {content.bannerText}
                </p>

                {/* CTA */}
                <Link
                  href={content.bannerCtaLink}
                  onClick={handleCloseBanner}
                  className="whitespace-nowrap bg-black text-white px-6 py-2 text-xs tracking-widest font-medium hover:bg-[#DC143C] transition-all duration-300"
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
