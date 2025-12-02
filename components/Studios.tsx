"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { parseFocalPoints, FocalPoints, DEFAULT_FOCAL_POINTS } from "@/hooks/useFocalPoint";
import FocalPointImage from "./FocalPointImage";

interface StudioImage {
  url: string;
  focalPoints: FocalPoints;
}

interface StudiosContent {
  subtitle: string;
  title: string;
  studio1_image: StudioImage;
  studio1_title: string;
  studio2_image: StudioImage;
  studio2_title: string;
  studio3_image: StudioImage;
  studio3_title: string;
}

const defaultImage = (url: string): StudioImage => ({
  url,
  focalPoints: DEFAULT_FOCAL_POINTS,
});

export default function Studios() {
  const [content, setContent] = useState<StudiosContent>({
    subtitle: "EASTDOCK STUDIOS",
    title: "OUR STUDIOS",
    studio1_image: defaultImage("/BLACKPR X WANNI121.JPG"),
    studio1_title: "E16 SET",
    studio2_image: defaultImage("/BLACKPR X WANNI174.JPG"),
    studio2_title: "E20 SET",
    studio3_image: defaultImage("https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=1200"),
    studio3_title: "LUX SET",
  });

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('page', 'homepage')
          .eq('section', 'studios');

        if (error) {
          console.error('Error loading studios content:', error);
          return;
        }

        if (data && data.length > 0) {
          const newContent = { ...content };
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'subtitle') newContent.subtitle = item.value;
            if (item.key === 'title') newContent.title = item.value;
            if (item.key === 'studio1_title') newContent.studio1_title = item.value;
            if (item.key === 'studio2_title') newContent.studio2_title = item.value;
            if (item.key === 'studio3_title') newContent.studio3_title = item.value;
            // Image URLs
            if (item.key === 'studio1_image') newContent.studio1_image = { ...newContent.studio1_image, url: item.value };
            if (item.key === 'studio2_image') newContent.studio2_image = { ...newContent.studio2_image, url: item.value };
            if (item.key === 'studio3_image') newContent.studio3_image = { ...newContent.studio3_image, url: item.value };
            // Focal points
            if (item.key === 'studio1_image_focal') newContent.studio1_image = { ...newContent.studio1_image, focalPoints: parseFocalPoints(item.value) };
            if (item.key === 'studio2_image_focal') newContent.studio2_image = { ...newContent.studio2_image, focalPoints: parseFocalPoints(item.value) };
            if (item.key === 'studio3_image_focal') newContent.studio3_image = { ...newContent.studio3_image, focalPoints: parseFocalPoints(item.value) };
          });
          setContent(newContent);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadContent();
  }, []);

  const studios = [
    {
      id: "e16",
      title: content.studio1_title,
      subtitle: "Studio 1",
      image: content.studio1_image,
    },
    {
      id: "e20",
      title: content.studio2_title,
      subtitle: "Studio 2",
      image: content.studio2_image,
    },
    {
      id: "lux",
      title: content.studio3_title,
      subtitle: "Studio 3",
      image: content.studio3_image,
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-black tracking-widest mb-2">{content.subtitle}</p>
          <h2 className="text-5xl font-light text-black mb-6">{content.title}</h2>
          <div className="w-24 h-px bg-black/30 mx-auto"></div>
        </motion.div>

        {/* Studio Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {studios.map((studio, index) => (
            <motion.div
              key={studio.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="relative h-[500px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                <FocalPointImage
                  src={studio.image.url}
                  alt={studio.title}
                  focalPoints={studio.image.focalPoints}
                  className="group-hover:scale-110 transition-transform duration-500"
                />

                {/* Title and Button Overlay */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end items-center md:items-start p-8">
                  <h3 className="text-3xl font-light text-white mb-6 tracking-wider text-center md:text-left">{studio.title}</h3>
                  <Link
                    href={`/studios/${studio.id}`}
                    className="border-2 border-white text-white px-8 py-3 text-sm tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300 w-fit text-center"
                  >
                    {studio.subtitle}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
