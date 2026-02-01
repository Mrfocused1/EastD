"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function OurStory() {
  const [services, setServices] = useState<Array<{ title: string; image: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('page', 'homepage')
          .eq('section', 'services')
          .eq('key', 'items')
          .single();

        if (error) {
          console.error('Error loading services from database:', error);
          setIsLoading(false);
          return;
        }

        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setServices(parsed);
            }
          } catch (e) {
            console.error('Error parsing services JSON:', e);
          }
        }
      } catch (err) {
        console.error('Error loading services:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadServices();
  }, []);
  if (isLoading) {
    return (
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="h-[350px] bg-gray-100 animate-pulse"></div>
            <div className="h-[350px] bg-gray-100 animate-pulse"></div>
            <div className="h-[350px] bg-gray-100 animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!services || services.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={`service-${service.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative h-[350px] overflow-hidden group cursor-pointer"
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                quality={80}
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h3 className="text-3xl font-light mb-6 text-white tracking-wider">{service.title}</h3>
                <Link
                  href="/booking"
                  className="border-2 border-white text-white px-8 py-2 text-xs tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
                >
                  BOOK NOW
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
