"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import { supabase } from "@/lib/supabase";

function BookingContent() {
  const searchParams = useSearchParams();
  const preselectedStudio = searchParams.get("studio");

  const [selectedStudio, setSelectedStudio] = useState(preselectedStudio || "");
  const [studios, setStudios] = useState([
    { value: "e16", label: "E16 SET", image: "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { value: "e20", label: "E20 SET", image: "https://images.pexels.com/photos/6957097/pexels-photo-6957097.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { value: "lux", label: "LUX SET", image: "https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=800" }
  ]);

  useEffect(() => {
    async function loadStudioTitles() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('page', 'global')
          .eq('section', 'settings')
          .in('key', ['e16_title', 'e20_title', 'lux_title']);

        if (error) {
          console.error('Error loading studio titles:', error);
          return;
        }

        if (data && data.length > 0) {
          const titles: Record<string, string> = {};
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'e16_title') titles.e16 = item.value;
            if (item.key === 'e20_title') titles.e20 = item.value;
            if (item.key === 'lux_title') titles.lux = item.value;
          });

          setStudios([
            { value: "e16", label: titles.e16 || "E16 SET", image: "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=800" },
            { value: "e20", label: titles.e20 || "E20 SET", image: "https://images.pexels.com/photos/6957097/pexels-photo-6957097.jpeg?auto=compress&cs=tinysrgb&w=800" },
            { value: "lux", label: titles.lux || "LUX SET", image: "https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=800" }
          ]);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadStudioTitles();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fdfbf8]">
      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/6794963/pexels-photo-6794963.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Booking"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <p className="text-sm tracking-[0.3em] mb-4">REQUEST BOOKING</p>
            <h1 className="text-6xl font-light tracking-wider">SELECT A STUDIO</h1>
            <div className="w-24 h-px bg-white mx-auto mt-6"></div>
          </motion.div>
        </div>
      </section>

      {/* Studio Selection */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {studios.map((studio) => (
              <motion.div
                key={studio.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative h-[400px] overflow-hidden cursor-pointer group ${
                  selectedStudio === studio.value ? 'ring-4 ring-black' : ''
                }`}
                onClick={() => setSelectedStudio(studio.value)}
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
      {selectedStudio && (
        <BookingForm preselectedStudio={selectedStudio} />
      )}
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
