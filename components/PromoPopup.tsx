"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface PromoContent {
  enabled: boolean;
  headline: string;
  subheadline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  discountCode: string;
}

const defaultContent: PromoContent = {
  enabled: true,
  headline: "Welcome to East Dock Studios!",
  subheadline: "Get 30% off all bookings",
  description: "As a first-time client, enjoy an exclusive discount on your first studio booking.",
  ctaText: "CLAIM OFFER",
  ctaLink: "/booking",
  discountCode: "WELCOME30",
};

export default function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState<PromoContent>(defaultContent);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if user has seen the popup before
    const hasSeenPopup = localStorage.getItem("eastdock_promo_seen");

    if (!hasSeenPopup) {
      // Delay showing popup for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from("site_content")
          .select("key, value")
          .eq("page", "global")
          .eq("section", "promo_popup");

        if (error) {
          console.error("Error loading promo content:", error);
          return;
        }

        if (data && data.length > 0) {
          const newContent = { ...defaultContent };
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === "enabled") newContent.enabled = item.value === "true";
            if (item.key === "headline") newContent.headline = item.value;
            if (item.key === "subheadline") newContent.subheadline = item.value;
            if (item.key === "description") newContent.description = item.value;
            if (item.key === "cta_text") newContent.ctaText = item.value;
            if (item.key === "cta_link") newContent.ctaLink = item.value;
            if (item.key === "discount_code") newContent.discountCode = item.value;
          });
          setContent(newContent);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }

    loadContent();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("eastdock_promo_seen", "true");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(content.discountCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Don't render if disabled
  if (!content.enabled) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="relative bg-black text-white max-w-md w-full overflow-hidden">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors z-10"
                aria-label="Close popup"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#DC143C]/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#DC143C]/20 rounded-full translate-x-1/2 translate-y-1/2" />

              {/* Content */}
              <div className="relative p-8 md:p-10 text-center">
                {/* Subtitle */}
                <p className="text-xs tracking-[0.3em] text-[#DC143C] mb-4">
                  EXCLUSIVE OFFER
                </p>

                {/* Headline */}
                <h2 className="text-2xl md:text-3xl font-light mb-2">
                  {content.headline}
                </h2>

                {/* Subheadline */}
                <p className="text-3xl md:text-4xl font-light text-[#DC143C] mb-4">
                  {content.subheadline}
                </p>

                {/* Description */}
                <p className="text-white/70 text-sm mb-6">
                  {content.description}
                </p>

                {/* Discount Code */}
                {content.discountCode && (
                  <div className="mb-6">
                    <p className="text-xs text-white/50 mb-2">USE CODE</p>
                    <button
                      onClick={handleCopyCode}
                      className="inline-block border-2 border-dashed border-white/30 px-6 py-2 text-lg tracking-widest hover:border-[#DC143C] transition-colors"
                    >
                      {copied ? "COPIED!" : content.discountCode}
                    </button>
                  </div>
                )}

                {/* CTA Button */}
                <Link
                  href={content.ctaLink}
                  onClick={handleClose}
                  className="inline-block bg-[#DC143C] text-white px-10 py-4 text-sm tracking-widest hover:bg-[#b01030] transition-colors"
                >
                  {content.ctaText}
                </Link>

                {/* No Thanks Link */}
                <button
                  onClick={handleClose}
                  className="block w-full mt-4 text-white/50 text-xs hover:text-white transition-colors"
                >
                  No thanks, I&apos;ll pay full price
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
