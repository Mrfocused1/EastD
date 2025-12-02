"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useFocalPoint, parseFocalPoints, FocalPoints, DEFAULT_FOCAL_POINTS } from "@/hooks/useFocalPoint";

interface ImageWithFocalPoint {
  url: string;
  focalPoints: FocalPoints;
}

interface HeroContent {
  images: ImageWithFocalPoint[];
  tagline: string;
}

const DEFAULT_IMAGE: ImageWithFocalPoint = {
  url: "/BLACKPR%20X%20WANNI171.JPG",
  focalPoints: DEFAULT_FOCAL_POINTS,
};

const SLIDE_DURATION = 5000; // 5 seconds per image
const FADE_DURATION = 1; // 1 second fade transition

export default function Hero() {
  const [content, setContent] = useState<HeroContent>({
    images: [DEFAULT_IMAGE],
    tagline: "BESPOKE STUDIO HIRE",
  });
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get the current image's focal point based on screen size
  const currentFocalPoint = useFocalPoint(content.images[currentIndex]?.focalPoints);

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
          const imagesMap: { [key: number]: ImageWithFocalPoint } = {};
          let tagline = "BESPOKE STUDIO HIRE";

          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'tagline') tagline = item.value;

            // Support both old 'image' key and new 'hero_image_X' keys
            if (item.key === 'image' && item.value) {
              imagesMap[0] = { url: item.value, focalPoints: DEFAULT_FOCAL_POINTS };
            }
            if (item.key.startsWith('hero_image_') && !item.key.includes('_focal')) {
              const index = parseInt(item.key.replace('hero_image_', '')) - 1;
              if (!imagesMap[index]) {
                imagesMap[index] = { url: '', focalPoints: DEFAULT_FOCAL_POINTS };
              }
              imagesMap[index].url = item.value;
            }
            // Load focal points
            if (item.key.startsWith('hero_image_') && item.key.endsWith('_focal')) {
              const index = parseInt(item.key.replace('hero_image_', '').replace('_focal', '')) - 1;
              if (!imagesMap[index]) {
                imagesMap[index] = { url: '', focalPoints: DEFAULT_FOCAL_POINTS };
              }
              imagesMap[index].focalPoints = parseFocalPoints(item.value);
            }
          });

          // Convert map to array and filter out empty URLs
          const images = Object.keys(imagesMap)
            .map(k => parseInt(k))
            .sort((a, b) => a - b)
            .map(k => imagesMap[k])
            .filter(img => img.url);

          setContent({
            images: images.length > 0 ? images : [DEFAULT_IMAGE],
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
          className="absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url('${content.images[currentIndex]?.url}')`,
            backgroundPosition: `${currentFocalPoint.x}% ${currentFocalPoint.y}%`,
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
            alt="EASTDOCK Studios"
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
