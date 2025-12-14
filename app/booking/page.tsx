"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useState, Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { supabase } from "@/lib/supabase";

function BookingContent() {
  const heroRef = useRef<HTMLElement>(null);
  const bookingFormRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const preselectedStudio = searchParams.get("studio");

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(heroScrollProgress, [0, 1], ["0%", "30%"]);

  const [selectedStudio, setSelectedStudio] = useState(preselectedStudio || "");
  const [heroContent, setHeroContent] = useState({
    image: "https://images.pexels.com/photos/6794963/pexels-photo-6794963.jpeg?auto=compress&cs=tinysrgb&w=1920",
    subtitle: "REQUEST BOOKING",
    title: "SELECT A STUDIO",
  });
  const [studios, setStudios] = useState([
    { value: "studio-dock-one", label: "Studio Dock One", image: "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { value: "studio-dock-two", label: "Studio Dock Two", image: "https://images.pexels.com/photos/6957097/pexels-photo-6957097.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { value: "studio-wharf", label: "Studio Wharf", image: "https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { value: "photography", label: "Photography", image: "https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=800" }
  ]);

  useEffect(() => {
    async function loadStudioSettings() {
      try {
        // Load hero content
        const { data: heroData } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('page', 'booking')
          .eq('section', 'hero');

        if (heroData && heroData.length > 0) {
          const heroUpdates: Partial<typeof heroContent> = {};
          heroData.forEach((item: { key: string; value: string }) => {
            if (item.key === 'image') heroUpdates.image = item.value;
            if (item.key === 'subtitle') heroUpdates.subtitle = item.value;
            if (item.key === 'title') heroUpdates.title = item.value;
          });
          setHeroContent(prev => ({ ...prev, ...heroUpdates }));
        }

        // Load studio settings
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('page', 'global')
          .eq('section', 'settings')
          .in('key', ['studio_dock_one_title', 'studio_dock_two_title', 'studio_wharf_title', 'photography_title', 'studio_dock_one_thumbnail', 'studio_dock_two_thumbnail', 'studio_wharf_thumbnail', 'photography_thumbnail']);

        if (error) {
          console.error('Error loading studio settings:', error);
          return;
        }

        if (data && data.length > 0) {
          const titles: Record<string, string> = {};
          const thumbnails: Record<string, string> = {};
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'studio_dock_one_title') titles.studioDockOne = item.value;
            if (item.key === 'studio_dock_two_title') titles.studioDockTwo = item.value;
            if (item.key === 'studio_wharf_title') titles.studioWharf = item.value;
            if (item.key === 'photography_title') titles.photography = item.value;
            if (item.key === 'studio_dock_one_thumbnail') thumbnails.studioDockOne = item.value;
            if (item.key === 'studio_dock_two_thumbnail') thumbnails.studioDockTwo = item.value;
            if (item.key === 'studio_wharf_thumbnail') thumbnails.studioWharf = item.value;
            if (item.key === 'photography_thumbnail') thumbnails.photography = item.value;
          });

          setStudios([
            { value: "studio-dock-one", label: titles.studioDockOne || "Studio Dock One", image: thumbnails.studioDockOne || "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=800" },
            { value: "studio-dock-two", label: titles.studioDockTwo || "Studio Dock Two", image: thumbnails.studioDockTwo || "https://images.pexels.com/photos/6957097/pexels-photo-6957097.jpeg?auto=compress&cs=tinysrgb&w=800" },
            { value: "studio-wharf", label: titles.studioWharf || "Studio Wharf", image: thumbnails.studioWharf || "https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=800" },
            { value: "photography", label: titles.photography || "Photography", image: thumbnails.photography || "https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=800" }
          ]);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadStudioSettings();
  }, []);

  // Auto-scroll to form when arriving with preselected studio
  useEffect(() => {
    if (preselectedStudio && bookingFormRef.current) {
      setTimeout(() => {
        bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500); // Wait for page to fully load
    }
  }, [preselectedStudio]);

  // Handle studio selection with smooth scroll
  const handleStudioSelect = (studioValue: string) => {
    setSelectedStudio(studioValue);
    // Wait for state update and form to render, then scroll
    setTimeout(() => {
      if (bookingFormRef.current) {
        bookingFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fdfbf8]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[50vh] overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 h-[130%] -top-[15%]">
          <Image
            src={heroContent.image}
            alt="Booking"
            fill
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <p className="text-sm tracking-[0.3em] mb-4">{heroContent.subtitle}</p>
            <h1 className="text-6xl font-light tracking-wider">{heroContent.title}</h1>
            <div className="w-24 h-px bg-white mx-auto mt-6"></div>
          </motion.div>
        </div>
      </section>

      {/* Studio Selection */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {studios.map((studio) => (
              <motion.div
                key={studio.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative h-[400px] overflow-hidden cursor-pointer group ${
                  selectedStudio === studio.value ? 'ring-4 ring-black' : ''
                }`}
                onClick={() => handleStudioSelect(studio.value)}
              >
                <Image
                  src={studio.image}
                  alt={studio.label}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 transition-colors ${
                  selectedStudio === studio.value ? 'bg-black/30' : 'bg-black/50'
                } group-hover:bg-black/40`}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z" />
                    </svg>
                  </div>
                  <h3 className="text-4xl font-light mb-4">{studio.label}</h3>
                  <button className="border-2 border-white px-6 py-2 text-xs tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300">
                    {selectedStudio === studio.value ? 'SELECTED' : 'BOOK NOW'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <div ref={bookingFormRef}>
        {selectedStudio && (
          <BookingForm preselectedStudio={selectedStudio} />
        )}
      </div>
      </main>
      <Footer />
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
