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

const iconMap: { [key: number]: typeof Users } = {
  0: Users,
  1: Camera,
  2: Palette,
};

interface E20Content {
  heroImage: string;
  studioSubtitle: string;
  studioTitle: string;
  studioDescription: string;
  features: { title: string; description: string }[];
  inclusiveFeatures: { title: string; description: string }[];
  pricingImage: string;
  pricingPlans: { title: string; price: string; duration: string; details: string[] }[];
  galleryImages: string[];
}

export default function E20Page() {
  const gallerySectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: gallerySectionRef,
    offset: ["start end", "end start"],
  });

  const [contentLoaded, setContentLoaded] = useState(false);
  const [content, setContent] = useState<E20Content>({
    heroImage: "/BLACKPR%20X%20WANNI171.JPG",
    studioSubtitle: "THE STUDIO",
    studioTitle: "E20 SET",
    studioDescription: "Spacious modern interior with staircase and leather sofas, perfect for creating cinematic content. This versatile space offers the ideal backdrop for sophisticated productions.",
    features: [
      { title: "1 - 4 Layout Possible", description: "WHITE SOFA AVAILABLE" },
      { title: "1 - 4 Camera Setup", description: "Professional multi-angle filming capabilities" },
      { title: "Customisable Set/Backdrop", description: "Create your perfect aesthetic" },
    ],
    inclusiveFeatures: [
      { title: "Free Facilities", description: "Access to our workspace area and Wi-Fi, perfect for your PA or Producer to work whilst you film." },
      { title: "High End Equipment", description: "Access to our equipment library, with some of the best in industry gear available as well as the experts to use them." },
      { title: "Central Location", description: "Located in the heart of East London, only 3 minutes walk from the station, the perfect location for all guests traveling." },
      { title: "Customisable Sets", description: "Access to a host of different chairs, tables and background props. Giving you the freedom to make the set as unique as you." },
    ],
    pricingImage: "https://images.pexels.com/photos/6957097/pexels-photo-6957097.jpeg?auto=compress&cs=tinysrgb&w=1920",
    pricingPlans: [
      { title: "STANDARD", price: "£75", duration: "per hour (Min 2 Hours)", details: ["2x Blackmagic 6K Cameras", "Comes with Setup Engineer", "Professional Lighting", "Upto 4 Mics", "Files sent in 24hours"] },
      { title: "HALF DAY", price: "£250", duration: "", details: ["2x Blackmagic 6K Cameras", "Comes with Setup Engineer", "Professional Lighting", "Upto 4 Mics", "Files sent in 24hours"] },
      { title: "FULL DAY", price: "£450", duration: "", details: ["2x Blackmagic 6K Cameras", "Comes with Setup Engineer", "Professional Lighting", "Upto 4 Mics", "Files sent in 48hours"] },
    ],
    galleryImages: [
      "/Gallery%202/BLACKPR%20X%20WANNI161.JPG",
      "/Gallery%202/BLACKPR%20X%20WANNI163.JPG",
      "/Gallery%202/BLACKPR%20X%20WANNI164.JPG",
      "/Gallery%202/BLACKPR%20X%20WANNI166.JPG",
      "/Gallery%202/BLACKPR%20X%20WANNI168.JPG",
    ],
  });

  // Collect all images to preload
  const imagesToPreload = useMemo(() => {
    return [content.heroImage, content.pricingImage, ...content.galleryImages].filter(Boolean);
  }, [content.heroImage, content.pricingImage, content.galleryImages]);

  const imagesLoading = useImagePreloader(contentLoaded ? imagesToPreload : []);
  const isLoading = !contentLoaded || imagesLoading;

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('section, key, value')
          .eq('page', 'e20');

        if (error) {
          console.error('Error loading E20 content:', error);
          setContentLoaded(true);
          return;
        }

        if (data && data.length > 0) {
          const newContent = { ...content };
          data.forEach((item: { section: string; key: string; value: string }) => {
            if (item.section === 'hero' && item.key === 'image') newContent.heroImage = item.value;
            if (item.section === 'studio' && item.key === 'subtitle') newContent.studioSubtitle = item.value;
            if (item.section === 'studio' && item.key === 'title') newContent.studioTitle = item.value;
            if (item.section === 'studio' && item.key === 'description') newContent.studioDescription = item.value;
            if (item.section === 'features' && item.key === 'items') {
              try { newContent.features = JSON.parse(item.value); } catch (e) { console.error('Error parsing features:', e); }
            }
            if (item.section === 'inclusive' && item.key === 'items') {
              try { newContent.inclusiveFeatures = JSON.parse(item.value); } catch (e) { console.error('Error parsing inclusive:', e); }
            }
            if (item.section === 'pricing' && item.key === 'image') newContent.pricingImage = item.value;
            if (item.section === 'pricing' && item.key === 'plans') {
              try { newContent.pricingPlans = JSON.parse(item.value); } catch (e) { console.error('Error parsing pricing:', e); }
            }
            if (item.section === 'gallery' && item.key === 'images') {
              try { newContent.galleryImages = JSON.parse(item.value); } catch (e) { console.error('Error parsing gallery:', e); }
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
  }, []);

  const galleryPositions = [
    { translateXPercent: -121.72, translateYPercent: -24.99, parallaxSpeed: 0.3 },
    { translateXPercent: 0, translateYPercent: -11.91, parallaxSpeed: 0.5 },
    { translateXPercent: 108.9, translateYPercent: 0, parallaxSpeed: 0.4 },
    { translateXPercent: 246.43, translateYPercent: -18.5, parallaxSpeed: 0.6 },
    { translateXPercent: 355.33, translateYPercent: -8.2, parallaxSpeed: 0.35 },
  ];

  // Create parallax transforms at component level (hooks must be called unconditionally)
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
      <section className="relative h-[70vh] overflow-hidden">
        <Image src={content.heroImage} alt="E20 SET" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center text-white">
            <p className="text-sm tracking-[0.3em] mb-4 text-white">EASTDOC STUDIOS</p>
            <h1 className="text-7xl font-light tracking-wider mb-8 text-white">{content.studioTitle}</h1>
            <Link href="/booking?studio=e20" className="inline-block border-2 border-white px-8 py-3 text-sm tracking-widest text-white hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300">
              BOOK NOW
            </Link>
          </motion.div>
        </div>
      </section>

      {/* The Studio Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-black mb-4">{content.studioSubtitle}</p>
            <h2 className="text-5xl font-light text-black mb-6">{content.studioTitle}</h2>
            <div className="w-24 h-px bg-black/30 mx-auto mb-8"></div>
            <p className="max-w-3xl mx-auto text-black leading-relaxed">{content.studioDescription}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {content.features.map((feature, index) => {
              const Icon = iconMap[index] || Users;
              return (
                <motion.div key={`e20-feature-${feature.title}-${index}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white p-8 text-center border border-black/10">
                  <Icon className="w-12 h-12 mx-auto mb-4 text-black" strokeWidth={1} />
                  <h3 className="text-lg font-medium mb-2 text-black">{feature.title}</h3>
                  <p className="text-sm text-black">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Inclusive Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-black mb-4">THE STUDIO</p>
            <h2 className="text-5xl font-light text-black mb-6">ALL INCLUSIVE</h2>
            <div className="w-24 h-px bg-black/30 mx-auto mb-8"></div>
            <p className="max-w-3xl mx-auto text-black leading-relaxed">
              Let our team of renowned experts guide you on a journey to elevate your project to new heights of excellence.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {content.inclusiveFeatures.map((feature, index) => (
              <motion.div key={`e20-inclusive-${feature.title}-${index}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white p-8 text-center border border-black/10">
                <h3 className="text-lg font-medium mb-4 text-black">{feature.title}</h3>
                <p className="text-sm text-black leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/booking?studio=e20" className="inline-block border-2 border-black px-8 py-3 text-sm tracking-widest text-black hover:bg-[#DC143C] hover:text-white hover:border-[#DC143C] transition-all duration-300">
              BOOK NOW!
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 overflow-hidden">
        <Image src={content.pricingImage} alt="Pricing" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-white/80 mb-4">EASTDOC STUDIOS</p>
            <h2 className="text-5xl font-light text-white">PRICING</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {content.pricingPlans.map((plan, index) => (
              <motion.div key={`e20-plan-${plan.title}-${index}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="border-2 border-white p-8 text-center text-white">
                <h3 className="text-2xl font-light mb-4 text-white">{plan.title}</h3>
                <p className="text-4xl font-light mb-2 text-white">{plan.price}</p>
                <p className="text-sm mb-2 text-white">excl. VAT</p>
                {plan.duration && <p className="text-sm mb-6 text-white">{plan.duration}</p>}
                <div className="space-y-2 mb-8">
                  {plan.details.map((detail, i) => (
                    <p key={`e20-detail-${plan.title}-${i}`} className="text-sm text-white">- {detail}</p>
                  ))}
                </div>
                <Link href="/booking?studio=e20" className="inline-block border border-white px-6 py-2 text-xs tracking-widest text-white hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300">
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-0">
            <h2 className="text-5xl font-light text-black">Gallery</h2>
          </motion.div>

          <div className="relative h-[550px] flex items-center justify-center -mt-32">
            <div className="relative w-[1200px]" style={{ left: '200px' }}>
              {content.galleryImages.map((image, index) => {
                const position = galleryPositions[index] || galleryPositions[0];
                const leftPx = (280 * position.translateXPercent) / 100;
                const topPx = (340 * position.translateYPercent) / 100;
                const parallaxX = parallaxTransforms[index] || parallaxTransforms[0];

                return (
                  <motion.div key={`e20-gallery-${index}`} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} style={{ position: 'absolute', left: `${leftPx}px`, top: `${topPx}px`, x: parallaxX }} className="transition-transform hover:scale-105">
                    <div className="rounded-xl overflow-hidden w-[280px] h-[340px] shadow-2xl relative">
                      <Image src={image} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
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
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-sm tracking-[0.3em] text-black mb-4">EASTDOC STUDIOS</p>
            <h2 className="text-5xl font-light text-black">OTHER STUDIOS</h2>
            <div className="w-24 h-px bg-black/30 mx-auto mt-6"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { name: "E16 SET", slug: "e16", image: "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=1200" },
              { name: "LUX SET", slug: "lux", image: "https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=1200" }
            ].map((studio, index) => (
              <Link key={`e20-studio-${studio.slug}-${index}`} href={`/studios/${studio.slug}`} className="relative h-[400px] overflow-hidden group">
                <Image src={studio.image} alt={studio.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
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
