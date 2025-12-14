"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface GalleryImage {
  id: string;
  url: string;
  title?: string;
  category?: string;
}

const defaultImages: GalleryImage[] = [
  { id: "1", url: "/BLACKPR X WANNI115.JPG", title: "E16 Studio", category: "Studio Dock One" },
  { id: "2", url: "/BLACKPR X WANNI121.JPG", title: "E16 Studio", category: "Studio Dock One" },
  { id: "3", url: "/BLACKPR X WANNI171.JPG", title: "E20 Studio", category: "Studio Dock Two" },
  { id: "4", url: "/BLACKPR X WANNI174.JPG", title: "E20 Studio", category: "Studio Dock Two" },
  { id: "5", url: "/gallery/BLACKPR X WANNI111.JPG", title: "E16 Studio", category: "Studio Dock One" },
  { id: "6", url: "/gallery/BLACKPR X WANNI116.JPG", title: "E16 Studio", category: "Studio Dock One" },
  { id: "7", url: "/gallery/BLACKPR X WANNI117.JPG", title: "E16 Studio", category: "Studio Dock One" },
  { id: "8", url: "/gallery/BLACKPR X WANNI122.JPG", title: "E16 Studio", category: "Studio Dock One" },
  { id: "9", url: "/Gallery 2/BLACKPR X WANNI161.JPG", title: "E20 Studio", category: "Studio Dock Two" },
  { id: "10", url: "/Gallery 2/BLACKPR X WANNI163.JPG", title: "E20 Studio", category: "Studio Dock Two" },
  { id: "11", url: "/Gallery 2/BLACKPR X WANNI164.JPG", title: "E20 Studio", category: "Studio Dock Two" },
  { id: "12", url: "/Gallery 2/BLACKPR X WANNI166.JPG", title: "E20 Studio", category: "Studio Dock Two" },
];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>(defaultImages);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [studioTitles, setStudioTitles] = useState({
    studioDockOne: "Studio Dock One",
    studioDockTwo: "Studio Dock Two",
    studioWharf: "Studio Wharf",
  });

  useEffect(() => {
    loadGalleryImages();
    loadStudioTitles();
  }, []);

  async function loadGalleryImages() {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("page", "gallery")
        .eq("section", "images")
        .eq("key", "items")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading gallery:", error);
        return;
      }

      if (data?.value) {
        try {
          const parsed = JSON.parse(data.value);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setImages(parsed);
          }
        } catch (e) {
          console.error("Error parsing gallery:", e);
        }
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function loadStudioTitles() {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("key, value")
        .eq("page", "global")
        .eq("section", "settings")
        .in("key", ["studio_dock_one_title", "studio_dock_two_title", "studio_wharf_title"]);

      if (error) {
        console.error("Error loading studio titles:", error);
        return;
      }

      if (data && data.length > 0) {
        const newTitles = { studioDockOne: "Studio Dock One", studioDockTwo: "Studio Dock Two", studioWharf: "Studio Wharf" };
        data.forEach((item: { key: string; value: string }) => {
          if (item.key === "studio_dock_one_title") newTitles.studioDockOne = item.value;
          if (item.key === "studio_dock_two_title") newTitles.studioDockTwo = item.value;
          if (item.key === "studio_wharf_title") newTitles.studioWharf = item.value;
        });
        setStudioTitles(newTitles);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  const categories = ["All", studioTitles.studioDockOne, studioTitles.studioDockTwo, studioTitles.studioWharf];

  const filteredImages = selectedCategory === "All"
    ? images
    : images.filter((img) => {
        if (selectedCategory === studioTitles.studioDockOne) return img.category === "Studio Dock One";
        if (selectedCategory === studioTitles.studioDockTwo) return img.category === "Studio Dock Two";
        if (selectedCategory === studioTitles.studioWharf) return img.category === "Studio Wharf";
        return true;
      });

  const currentIndex = selectedImage
    ? filteredImages.findIndex((img) => img.id === selectedImage.id)
    : -1;

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setSelectedImage(filteredImages[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (currentIndex < filteredImages.length - 1) {
      setSelectedImage(filteredImages[currentIndex + 1]);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-[40vh] bg-black overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/40"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white"
            >
              <p className="text-sm tracking-[0.3em] mb-4">EASTDOCK STUDIOS</p>
              <h1 className="text-6xl font-light tracking-wider">GALLERY</h1>
              <div className="w-24 h-px bg-white mx-auto mt-6"></div>
            </motion.div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="py-8 border-b border-black/10">
          <div className="container mx-auto px-6">
            <div className="flex justify-center gap-4 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 text-sm tracking-widest transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-black text-white"
                      : "bg-transparent text-black border border-black/20 hover:border-black"
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => setSelectedImage(image)}
                    className="relative aspect-[4/5] overflow-hidden cursor-pointer group"
                  >
                    <Image
                      src={image.url}
                      alt={image.title || "Gallery image"}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      quality={80}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredImages.length === 0 && (
              <div className="text-center py-16">
                <p className="text-black/50">No images found in this category.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Previous Button */}
            {currentIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
              >
                <ChevronLeft className="w-12 h-12" />
              </button>
            )}

            {/* Next Button */}
            {currentIndex < filteredImages.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10"
              >
                <ChevronRight className="w-12 h-12" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={selectedImage.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-[90vw] max-h-[85vh] aspect-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage.url}
                alt={selectedImage.title || "Gallery image"}
                width={1200}
                height={800}
                className="object-contain max-h-[85vh] w-auto"
              />
            </motion.div>

            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm tracking-widest">
              {currentIndex + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
