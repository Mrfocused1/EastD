"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface HeroContent {
  images: string[];
  tagline: string;
}

const DEFAULT_IMAGES = [
  "/BLACKPR%20X%20WANNI171.JPG",
];

const SLIDE_DURATION = 5000; // 5 seconds per image
const FADE_DURATION = 1; // 1 second fade transition

export default function Hero() {
  const [content, setContent] = useState<HeroContent>({
    images: DEFAULT_IMAGES,
    tagline: "BESPOKE STUDIO HIRE",
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('page', 'homepage')
          .eq('section', 'hero');

        if (error) {
          console.error('Error loading hero content:', error);
          return;
        }

        if (data && data.length > 0) {
          const images: string[] = [];
          let tagline = "BESPOKE STUDIO HIRE";

          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'tagline') tagline = item.value;
            // Support both old 'image' key and new 'hero_image_X' keys
            if (item.key === 'image' && item.value) images.push(item.value);
            if (item.key.startsWith('hero_image_') && item.value) {
              const index = parseInt(item.key.replace('hero_image_', '')) - 1;
              images[index] = item.value;
            }
          });

          // Filter out any empty slots and use defaults if no images
          const filteredImages = images.filter(Boolean);
          setContent({
            images: filteredImages.length > 0 ? filteredImages : DEFAULT_IMAGES,
            tagline,
          });
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadContent();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    if (content.images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % content.images.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [content.images.length]);

  return (
    <section className="relative w-full h-[90vh] bg-[#2d2d2d] overflow-hidden">
      {/* Background Images with Fade Transition */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_DURATION, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${content.images[currentIndex]}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-white z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center"
        >
          <Image
            src="/10.png"
            alt="EASTDOC Studios"
            width={600}
            height={240}
            className="mx-auto object-contain"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="font-roboto text-sm tracking-widest mt-16 uppercase text-white"
          >
            {content.tagline}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
