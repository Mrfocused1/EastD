"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Camera, Palette } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { supabase } from "@/lib/supabase";
import { parseFocalPoints, FocalPoints, DEFAULT_FOCAL_POINTS } from "@/hooks/useFocalPoint";
import FocalPointImage from "@/components/FocalPointImage";

const iconMap: { [key: number]: typeof Users } = {
  0: Camera,
  1: Users,
  2: Palette,
};

interface ImageWithFocalPoints {
  url: string;
  focalPoints: FocalPoints;
}

interface GalleryImage {
  url: string;
  focalPoints: FocalPoints;
}

interface PhotographyContent {
  heroImage: ImageWithFocalPoints;
  studioSubtitle: string;
  studioTitle: string;
  studioDescription: string;
  features: { title: string; description: string }[];
  pricingImage: ImageWithFocalPoints;
  pricingPlans: { title: string; price: string; duration: string; details: string[] }[];
  galleryImages: GalleryImage[];
}

export default function PhotographyPage() {
  const heroRef = useRef<HTMLElement>(null);
  const gallerySectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(heroScrollProgress, [0, 1], ["0%", "30%"]);

  const { scrollYProgress } = useScroll({
    target: gallerySectionRef,
    offset: ["start end", "end start"],
  });

  const [contentLoaded, setContentLoaded] = useState(false);
  const [studioTitles, setStudioTitles] = useState({
    studioDockOne: "Studio Dock One",
    studioDockTwo: "Studio Dock Two",
    studioWharf: "Studio Wharf",
    photography: "Photography",
  });
  const [studioThumbnails, setStudioThumbnails] = useState({
    studioDockOne: "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=1200",
    studioDockTwo: "https://images.pexels.com/photos/6957097/pexels-photo-6957097.jpeg?auto=compress&cs=tinysrgb&w=1200",
    studioWharf: "https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=1200",
    photography: "https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=1200",
  });
  const [content, setContent] = useState<PhotographyContent>({
    heroImage: { url: "https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=1920", focalPoints: DEFAULT_FOCAL_POINTS },
    studioSubtitle: "THE STUDIO",
    studioTitle: "Photography",
    studioDescription: "Our photography studio offers the perfect setting for professional photo shoots. With state-of-the-art lighting equipment, versatile backdrops, and ample space, we provide everything you need to capture stunning images for portraits, products, fashion, and more.",
    features: [
      { title: "Professional Lighting", description: "Full range of studio lighting equipment" },
      { title: "Multiple Backdrops", description: "Various colors and textures available" },
      { title: "Spacious Setup", description: "Ample room for any photography project" },
    ],
    pricingImage: { url: "https://images.pexels.com/photos/3379943/pexels-photo-3379943.jpeg?auto=compress&cs=tinysrgb&w=1920", focalPoints: DEFAULT_FOCAL_POINTS },
    pricingPlans: [
      { title: "HOURLY", price: "£50", duration: "(Min 2 Hours)", details: ["Professional Lighting", "Backdrop Access", "Changing Area", "WiFi Included"] },
      { title: "HALF DAY", price: "£180", duration: "(4 Hours)", details: ["Professional Lighting", "All Backdrops", "Changing Area", "WiFi Included", "Refreshments"] },
      { title: "FULL DAY", price: "£320", duration: "(8 Hours)", details: ["Professional Lighting", "All Backdrops", "Changing Area", "WiFi Included", "Refreshments", "Priority Booking"] },
    ],
    galleryImages: [
      { url: "https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=800", focalPoints: DEFAULT_FOCAL_POINTS },
      { url: "https://images.pexels.com/photos/3379943/pexels-photo-3379943.jpeg?auto=compress&cs=tinysrgb&w=800", focalPoints: DEFAULT_FOCAL_POINTS },
      { url: "https://images.pexels.com/photos/3379942/pexels-photo-3379942.jpeg?auto=compress&cs=tinysrgb&w=800", focalPoints: DEFAULT_FOCAL_POINTS },
      { url: "https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800", focalPoints: DEFAULT_FOCAL_POINTS },
      { url: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=800", focalPoints: DEFAULT_FOCAL_POINTS },
    ],
  });

  // Collect all images to preload
  const imagesToPreload = useMemo(() => {
    return [content.heroImage.url, content.pricingImage.url, ...content.galleryImages.map(g => g.url)].filter(Boolean);
  }, [content.heroImage, content.pricingImage, content.galleryImages]);

  const imagesLoading = useImagePreloader(contentLoaded ? imagesToPreload : []);
  const isLoading = !contentLoaded || imagesLoading;

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('section, key, value')
          .eq('page', 'photography');

        if (error) {
          console.error('Error loading photography content:', error);
          setContentLoaded(true);
          return;
        }

        if (data && data.length > 0) {
          const newContent = { ...content };
          data.forEach((item: { section: string; key: string; value: string }) => {
            // Hero section
            if (item.section === 'hero' && item.key === 'image') {
              newContent.heroImage = { ...newContent.heroImage, url: item.value };
            }
            if (item.section === 'hero' && item.key === 'image_focal') {
              newContent.heroImage = { ...newContent.heroImage, focalPoints: parseFocalPoints(item.value) };
            }
            // Studio section
            if (item.section === 'studio' && item.key === 'subtitle') newContent.studioSubtitle = item.value;
            if (item.section === 'studio' && item.key === 'title') newContent.studioTitle = item.value;
            if (item.section === 'studio' && item.key === 'description') newContent.studioDescription = item.value;
            if (item.section === 'features' && item.key === 'items') {
              try { newContent.features = JSON.parse(item.value); } catch (e) { console.error('Error parsing features:', e); }
            }
            // Pricing section
            if (item.section === 'pricing' && item.key === 'image') {
              newContent.pricingImage = { ...newContent.pricingImage, url: item.value };
            }
            if (item.section === 'pricing' && item.key === 'image_focal') {
              newContent.pricingImage = { ...newContent.pricingImage, focalPoints: parseFocalPoints(item.value) };
            }
            if (item.section === 'pricing' && item.key === 'plans') {
              try { newContent.pricingPlans = JSON.parse(item.value); } catch (e) { console.error('Error parsing pricing:', e); }
            }
            // Gallery section
            if (item.section === 'gallery' && item.key === 'images') {
              try {
                const parsed = JSON.parse(item.value);
                if (Array.isArray(parsed)) {
                  if (typeof parsed[0] === 'string') {
                    newContent.galleryImages = parsed.map((url: string) => ({ url, focalPoints: DEFAULT_FOCAL_POINTS }));
                  } else {
                    newContent.galleryImages = parsed.map((img: { url?: string; focalPoints?: FocalPoints }) => ({
                      url: img.url || '',
                      focalPoints: img.focalPoints || DEFAULT_FOCAL_POINTS,
                    }));
                  }
                }
              } catch (e) { console.error('Error parsing gallery:', e); }
            }
          });
          setContent(newContent);
        }
        setContentLoaded(true);
      } catch (err) {
        console.error('Error:', err);
        setContentLoaded(true);
      }
    }

    loadContent();

    // Load studio titles and thumbnails for "Other Studios" section
    async function loadStudioSettings() {
      try {
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
          const newTitles = { studioDockOne: "Studio Dock One", studioDockTwo: "Studio Dock Two", studioWharf: "Studio Wharf", photography: "Photography" };
          const newThumbnails = { ...studioThumbnails };
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'studio_dock_one_title') newTitles.studioDockOne = item.value;
            if (item.key === 'studio_dock_two_title') newTitles.studioDockTwo = item.value;
            if (item.key === 'studio_wharf_title') newTitles.studioWharf = item.value;
            if (item.key === 'photography_title') newTitles.photography = item.value;
            if (item.key === 'studio_dock_one_thumbnail') newThumbnails.studioDockOne = item.value;
            if (item.key === 'studio_dock_two_thumbnail') newThumbnails.studioDockTwo = item.value;
            if (item.key === 'studio_wharf_thumbnail') newThumbnails.studioWharf = item.value;
            if (item.key === 'photography_thumbnail') newThumbnails.photography = item.value;
          });
          setStudioTitles(newTitles);
          setStudioThumbnails(newThumbnails);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadStudioSettings();
  }, []);

  const galleryPositions = [
    { translateXPercent: -121.72, translateYPercent: -24.99, parallaxSpeed: 0.3 },
    { translateXPercent: 0, translateYPercent: -11.91, parallaxSpeed: 0.5 },
    { translateXPercent: 108.9, translateYPercent: 0, parallaxSpeed: 0.4 },
    { translateXPercent: 246.43, translateYPercent: -18.5, parallaxSpeed: 0.6 },
    { translateXPercent: 355.33, translateYPercent: -8.2, parallaxSpeed: 0.35 },
  ];

  // Create parallax transforms at component level
  const parallaxX0 = useTransform(scrollYProgress, [0, 1], [100, -150 * galleryPositions[0].parallaxSpeed]);
  const parallaxX1 = useTransform(scrollYProgress, [0, 1], [100, -150 * galleryPositions[1].parallaxSpeed]);
  const parallaxX2 = useTransform(scrollYProgress, [0, 1], [100, -150 * galleryPositions[2].parallaxSpeed]);
  const parallaxX3 = useTransform(scrollYProgress, [0, 1], [100, -150 * galleryPositions[3].parallaxSpeed]);
  const parallaxX4 = useTransform(scrollYProgress, [0, 1], [100, -150 * galleryPositions[4].parallaxSpeed]);
  const parallaxTransforms = [parallaxX0, parallaxX1, parallaxX2, parallaxX3, parallaxX4];

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <Header />
      <main className="min-h-screen bg-[#fdfbf8]">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[70vh] overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 h-[130%] -top-[15%]">
          <FocalPointImage
            src={content.heroImage.url}
            alt="Photography Studio"
            focalPoints={content.heroImage.focalPoints}
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <p className="text-sm tracking-[0.3em] mb-4 text-white">EASTDOCK STUDIOS</p>
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-light tracking-wider mb-8 text-white">{content.studioTitle}</h1>
            <Link
              href="/booking?studio=photography"
              className="inline-block border-2 border-white px-8 py-3 text-sm tracking-widest text-white hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
            >
              BOOK NOW
            </Link>
          </motion.div>
        </div>
      </section>

      {/* The Studio Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm tracking-[0.3em] text-black mb-4">{content.studioSubtitle}</p>
            <h2 className="text-5xl font-light text-black mb-6">{content.studioTitle}</h2>
            <div className="w-24 h-px bg-black/30 mx-auto mb-8"></div>
            <p className="max-w-3xl mx-auto text-black leading-relaxed">
              {content.studioDescription}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {content.features.map((feature, index) => {
              const Icon = iconMap[index] || Camera;
              return (
                <motion.div
                  key={`photography-feature-${feature.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 text-center border border-black/10"
                >
                  <Icon className="w-12 h-12 mx-auto mb-4 text-black" strokeWidth={1} />
                  <h3 className="text-lg font-medium mb-2 text-black">{feature.title}</h3>
                  <p className="text-sm text-black">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 overflow-hidden">
        <FocalPointImage
          src={content.pricingImage.url}
          alt="Pricing"
          focalPoints={content.pricingImage.focalPoints}
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm tracking-[0.3em] text-white/80 mb-4">EASTDOCK STUDIOS</p>
            <h2 className="text-5xl font-light text-white">PRICING</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {content.pricingPlans.map((plan, index) => (
              <motion.div
                key={`photography-plan-${plan.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border-2 border-white p-8 text-center text-white"
              >
                <h3 className="text-2xl font-light mb-4 text-white">{plan.title}</h3>
                <p className="text-4xl font-light mb-2 text-white">{plan.price}</p>
                <p className="text-sm mb-2 text-white">excl. VAT</p>
                <p className="text-sm mb-6 text-white">{plan.duration}</p>
                <div className="space-y-2 mb-8">
                  {plan.details.map((detail, i) => (
                    <p key={`photography-detail-${plan.title}-${i}`} className="text-sm text-white">- {detail}</p>
                  ))}
                </div>
                <Link
                  href="/booking?studio=photography"
                  className="inline-block border border-white px-6 py-2 text-xs tracking-widest text-white hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
                >
                  BOOK NOW
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section ref={gallerySectionRef} className="pt-24 pb-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-0"
          >
            <h2 className="text-5xl font-light text-black">Gallery</h2>
          </motion.div>

          {/* Scrolling Gallery Cards */}
          <div className="relative h-[550px] flex items-center justify-center -mt-32">
            <div className="relative w-[1200px]" style={{ left: '200px' }}>
              {content.galleryImages.map((image, index) => {
                const position = galleryPositions[index] || galleryPositions[0];
                const leftPx = (280 * position.translateXPercent) / 100;
                const topPx = (340 * position.translateYPercent) / 100;
                const parallaxX = parallaxTransforms[index] || parallaxTransforms[0];

                return (
                  <motion.div
                    key={`photography-gallery-${index}`}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    style={{
                      position: 'absolute',
                      left: `${leftPx}px`,
                      top: `${topPx}px`,
                      x: parallaxX,
                    }}
                    className="transition-transform hover:scale-105"
                  >
                    <div className="rounded-xl overflow-hidden w-[280px] h-[340px] shadow-2xl relative">
                      <FocalPointImage
                        src={image.url}
                        alt={`Gallery image ${index + 1}`}
                        focalPoints={image.focalPoints}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Other Studios Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm tracking-[0.3em] text-black mb-4">EASTDOCK STUDIOS</p>
            <h2 className="text-5xl font-light text-black">OTHER STUDIOS</h2>
            <div className="w-24 h-px bg-black/30 mx-auto mt-6"></div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: studioTitles.studioDockOne, slug: "studio-dock-one", image: studioThumbnails.studioDockOne },
              { name: studioTitles.studioDockTwo, slug: "studio-dock-two", image: studioThumbnails.studioDockTwo },
              { name: studioTitles.studioWharf, slug: "studio-wharf", image: studioThumbnails.studioWharf }
            ].map((studio, index) => (
              <Link key={`photography-studio-${studio.slug}-${index}`} href={`/studios/${studio.slug}`} className="relative h-[400px] overflow-hidden group">
                <Image src={studio.image} alt={studio.name} fill sizes="(max-width: 768px) 100vw, 33vw" quality={80} className="object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-12 h-12 border border-white/50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z" />
                    </svg>
                  </div>
                  <h3 className="text-4xl font-light mb-4">{studio.name}</h3>
                  <button className="border border-white px-6 py-2 text-xs tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300">
                    VIEW MORE
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
