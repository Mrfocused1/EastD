"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface HeroContent {
  image: string;
  tagline: string;
}

export default function Hero() {
  const [content, setContent] = useState<HeroContent>({
    image: "/BLACKPR%20X%20WANNI171.JPG",
    tagline: "BESPOKE STUDIO HIRE",
  });

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
          const newContent = { ...content };
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'image') newContent.image = item.value;
            if (item.key === 'tagline') newContent.tagline = item.value;
          });
          setContent(newContent);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadContent();
  }, []);

  return (
    <section className="relative w-full h-[90vh] bg-[#2d2d2d] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${content.image}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

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
