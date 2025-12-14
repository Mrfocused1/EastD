"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { supabase } from "@/lib/supabase";

const defaultServices = [
  { title: "PODCASTS", image: "https://images.pexels.com/photos/7034272/pexels-photo-7034272.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { title: "VOICEOVERS", image: "https://images.pexels.com/photos/7087833/pexels-photo-7087833.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { title: "COMMERCIALS", image: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { title: "INTERVIEWS", image: "https://images.pexels.com/photos/5717546/pexels-photo-5717546.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { title: "DOCUMENTARIES", image: "https://images.pexels.com/photos/7991316/pexels-photo-7991316.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { title: "ROUND TABLES", image: "https://images.pexels.com/photos/7034620/pexels-photo-7034620.jpeg?auto=compress&cs=tinysrgb&w=800" },
];

interface AboutContent {
  heroImage: string;
  heroSubtitle: string;
  heroTitle: string;
  aboutTitle: string;
  aboutText: string;
  missionTitle: string;
  missionText: string;
}

interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  googleMapsEmbed: string;
  instagramUrl: string;
  twitterUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
}

export default function AboutPage() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(heroScrollProgress, [0, 1], ["0%", "30%"]);

  const [content, setContent] = useState<AboutContent>({
    heroImage: "https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=1920",
    heroSubtitle: "EASTDOCK STUDIOS",
    heroTitle: "ABOUT US",
    aboutTitle: "CAPABILITIES",
    aboutText: "Within our studio, creativity knows no bounds. Whether crafting podcasts, advertising campaigns, voiceovers, or conducting riveting interviews, our venue is an elegant experience for artistic expression. We have a full range of in-house resources and talents to meet any client's requirement.",
    missionTitle: "Our Mission",
    missionText: "To empower creators by providing exceptional studio spaces and professional support that bring their visions to life.",
  });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: "East Dock Studios, Royal Victoria Dock, London E16",
    phone: "+44 123 456 7890",
    email: "admin@eastdockstudios.co.uk",
    googleMapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.123456789!2d0.0234!3d51.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRoyal%20Victoria%20Dock!5e0!3m2!1sen!2suk!4v1234567890",
    instagramUrl: "",
    twitterUrl: "",
    facebookUrl: "",
    linkedinUrl: "",
  });
  const [services, setServices] = useState(defaultServices);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Collect all images to preload
  const imagesToPreload = useMemo(() => {
    const images = [
      content.heroImage,
      "https://images.pexels.com/photos/7991319/pexels-photo-7991319.jpeg?auto=compress&cs=tinysrgb&w=1920",
      ...services.map(s => s.image)
    ];
    return images.filter(Boolean);
  }, [content.heroImage, services]);

  const imagesLoading = useImagePreloader(contentLoaded ? imagesToPreload : []);
  const isLoading = !contentLoaded || imagesLoading;

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value, section')
          .eq('page', 'about');

        if (error) {
          console.error('Error loading about content:', error);
          setContentLoaded(true);
          return;
        }

        if (data && data.length > 0) {
          const newContent = { ...content };
          data.forEach((item: { section: string; key: string; value: string }) => {
            if (item.section === 'hero' && item.key === 'image') newContent.heroImage = item.value;
            if (item.section === 'hero' && item.key === 'subtitle') newContent.heroSubtitle = item.value;
            if (item.section === 'hero' && item.key === 'title') newContent.heroTitle = item.value;
            if (item.section === 'about' && item.key === 'title') newContent.aboutTitle = item.value;
            if (item.section === 'about' && item.key === 'text') newContent.aboutText = item.value;
            if (item.section === 'mission' && item.key === 'title') newContent.missionTitle = item.value;
            if (item.section === 'mission' && item.key === 'text') newContent.missionText = item.value;
          });
          setContent(newContent);
        }

        // Load global contact settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('page', 'global')
          .eq('section', 'settings');

        if (!settingsError && settingsData && settingsData.length > 0) {
          const newContactInfo = { ...contactInfo };
          settingsData.forEach((item: { key: string; value: string }) => {
            if (item.key === 'contact_address') newContactInfo.address = item.value;
            if (item.key === 'contact_phone') newContactInfo.phone = item.value;
            if (item.key === 'contact_email') newContactInfo.email = item.value;
            if (item.key === 'google_maps_embed') newContactInfo.googleMapsEmbed = item.value;
            if (item.key === 'instagram_url') newContactInfo.instagramUrl = item.value;
            if (item.key === 'twitter_url') newContactInfo.twitterUrl = item.value;
            if (item.key === 'facebook_url') newContactInfo.facebookUrl = item.value;
            if (item.key === 'linkedin_url') newContactInfo.linkedinUrl = item.value;
          });
          setContactInfo(newContactInfo);
        }

        // Load services from homepage section
        const { data: servicesData, error: servicesError } = await supabase
          .from('site_content')
          .select('value')
          .eq('page', 'homepage')
          .eq('section', 'services')
          .eq('key', 'items')
          .single();

        if (!servicesError && servicesData) {
          try {
            const parsed = JSON.parse(servicesData.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setServices(parsed);
            }
          } catch (e) {
            console.error('Error parsing services:', e);
          }
        }

        setContentLoaded(true);
      } catch (err) {
        console.error('Error:', err);
        setContentLoaded(true);
      }
    }

    loadContent();
  }, []);

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <Header />
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section ref={heroRef} className="relative h-[70vh] overflow-hidden">
          <motion.div style={{ y: heroY }} className="absolute inset-0 h-[130%] -top-[15%]">
            <Image
              src={content.heroImage}
              alt="About EASTDOCK STUDIOS"
              fill
              sizes="100vw"
              quality={85}
              priority
              className="object-cover"
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
              <p className="text-sm tracking-[0.3em] mb-4 text-white">{content.heroSubtitle}</p>
              <h1 className="text-3xl sm:text-4xl md:text-7xl font-light tracking-wider mb-8 text-white">{content.heroTitle}</h1>
            </motion.div>
          </div>
        </section>

        {/* Capabilities Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <p className="text-sm tracking-[0.3em] text-gray-400 mb-4">EASTDOCK STUDIOS</p>
              <h2 className="text-5xl font-light text-black mb-6">{content.aboutTitle}</h2>
              <div className="w-24 h-px bg-gray-300 mx-auto mb-12"></div>
              <p className="text-base text-gray-600 leading-relaxed mb-12">
                {content.aboutText}
              </p>

              {/* Social Media Icons */}
              <div className="flex justify-center gap-4">
                <a href="#" className="w-12 h-12 bg-gray-800 flex items-center justify-center text-white hover:bg-[#DC143C] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-gray-800 flex items-center justify-center text-white hover:bg-[#DC143C] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="w-12 h-12 bg-gray-800 flex items-center justify-center text-white hover:bg-[#DC143C] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
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

        {/* Book Studio Tour Section */}
        <section className="relative h-[60vh] overflow-hidden">
          <Image
            src="https://images.pexels.com/photos/7991319/pexels-photo-7991319.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Book Your Studio Tour"
            fill
            sizes="100vw"
            quality={80}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-5xl font-light mb-8 text-white tracking-wider">Book Your Studio Tour</h2>
              <Link
                href="/booking"
                className="inline-block border-2 border-white text-white px-12 py-3 text-sm tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
              >
                BOOK NOW!
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Get In Touch Section */}
        <section id="contact" className="py-24 bg-white text-black">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Left Column - Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl font-light mb-8">Get In Touch</h2>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-black">{contactInfo.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-black">{contactInfo.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                      <a href={`mailto:${contactInfo.email}`} className="text-black hover:text-[#DC143C] transition-colors">
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                </div>

                <button className="border border-black px-8 py-3 text-sm tracking-widest hover:bg-[#DC143C] hover:text-white hover:border-[#DC143C] transition-all duration-300">
                  CONTACT US
                </button>

                <div className="mt-12">
                  <h3 className="text-xl font-light mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    {contactInfo.facebookUrl && (
                      <a href={contactInfo.facebookUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-black/30 flex items-center justify-center hover:bg-[#DC143C] hover:text-white hover:border-[#DC143C] transition-all duration-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {contactInfo.twitterUrl && (
                      <a href={contactInfo.twitterUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-black/30 flex items-center justify-center hover:bg-[#DC143C] hover:text-white hover:border-[#DC143C] transition-all duration-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    )}
                    {contactInfo.instagramUrl && (
                      <a href={contactInfo.instagramUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-black/30 flex items-center justify-center hover:bg-[#DC143C] hover:text-white hover:border-[#DC143C] transition-all duration-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                        </svg>
                      </a>
                    )}
                    {contactInfo.linkedinUrl && (
                      <a href={contactInfo.linkedinUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-black/30 flex items-center justify-center hover:bg-[#DC143C] hover:text-white hover:border-[#DC143C] transition-all duration-300">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Map */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="h-full min-h-[400px]"
              >
                <h3 className="text-2xl font-light mb-6">Find Us</h3>
                <div className="bg-gray-200 h-full min-h-[350px] rounded overflow-hidden">
                  <iframe
                    src={contactInfo.googleMapsEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
