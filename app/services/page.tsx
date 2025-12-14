"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { supabase } from "@/lib/supabase";
import {
  Radio,
  MapPin,
  Film,
  Video,
  Users,
  Check,
  Wifi,
  Headphones,
  Clapperboard,
  Sparkles,
  Clock
} from "lucide-react";

interface Service {
  id: string;
  title: string;
  tagline: string;
  description: string;
  perfectFor: string;
  ctaText: string;
  ctaLink: string;
  icon: string;
}

interface ServicesContent {
  heroImage: string;
  heroHeadline: string;
  heroSubheadline: string;
  introTitle: string;
  introText: string;
  services: Service[];
  whyChooseTitle: string;
  whyChooseItems: string[];
  ctaTitle: string;
  ctaText: string;
}

const defaultContent: ServicesContent = {
  heroImage: "https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&w=1920",
  heroHeadline: "East Dock Studios - Our Services",
  heroSubheadline: "Professional, end-to-end content solutions designed to make recording, producing, and sharing your content seamless and stress-free.",
  introTitle: "More Than Just a Studio",
  introText: "Welcome to East Dock Studios, London's hub for creators, podcasters, and brands. We don't just offer a studio - we provide professional, end-to-end content solutions designed to make recording, producing, and sharing your content seamless and stress-free.",
  services: [
    {
      id: "live-streaming",
      title: "High-Speed Live Streaming & Remote Guest Integration",
      tagline: "Broadcast in real time with total reliability.",
      description: "Our ultra-fast internet and professional setup allow you to livestream your podcast, panel, or show to multiple platforms simultaneously - YouTube, LinkedIn, Instagram and more. Connect with remote guests seamlessly via Zoom, Riverside, SquadCast, or Google Meet, while our engineers ensure zero lag or interruptions.",
      perfectFor: "Live shows, interviews with international guests, and corporate events.",
      ctaText: "Book a Live Streaming Session",
      ctaLink: "/booking",
      icon: "radio"
    },
    {
      id: "on-site-recording",
      title: "Multi-Location & On-Site Recording Service",
      tagline: "Take East Dock Studios wherever you need it.",
      description: "We bring professional multi-camera setups, lighting, audio capture, and on-site editing to your location - from offices to events, homes to outdoor venues. Capture podcasts, interviews, or branded content wherever it makes sense.",
      perfectFor: "Corporate content, live events, or podcasts on-the-go.",
      ctaText: "Request an On-Site Session",
      ctaLink: "/#contact",
      icon: "mappin"
    },
    {
      id: "podcast-production",
      title: "End-to-End Podcast Production",
      tagline: "From concept to publication, we've got you covered.",
      description: "We handle every stage of production: recording, audio & video editing, colour grading, mixing & mastering, transcription, and show notes. Plus, we create ready-to-share social media clips for TikTok, Reels, and YouTube Shorts.",
      perfectFor: "Busy creators, brands, or anyone who wants high-quality episodes without the hassle.",
      ctaText: "Start Your Podcast Today",
      ctaLink: "/booking",
      icon: "film"
    },
    {
      id: "content-creation",
      title: "On-Site Content Creation Suite",
      tagline: "Your all-in-one content hub.",
      description: "Produce short-form videos, branded content, online courses, talking-head videos, and multi-camera edits - all within our studio. Ideal for creators who want more than just a podcast.",
      perfectFor: "Influencers, educators, and businesses producing multiple types of content.",
      ctaText: "Book Your Content Session",
      ctaLink: "/booking",
      icon: "video"
    },
    {
      id: "membership",
      title: "Creator Membership & Storage Hub",
      tagline: "Stay connected and make content creation effortless.",
      description: "Our membership plan gives you discounted studio hours, priority bookings, free equipment upgrades, and secure cloud storage for all your projects. Access a personalised dashboard to request edits, clips, or new recording sessions - plus members-only events and networking opportunities.",
      perfectFor: "Regular creators, brands, and podcast teams who need flexible, recurring access.",
      ctaText: "Join the Membership",
      ctaLink: "/membership",
      icon: "users"
    }
  ],
  whyChooseTitle: "Why Choose East Dock Studios?",
  whyChooseItems: [
    "State-of-the-art equipment & high-speed internet",
    "Professional support for both audio & video production",
    "Flexible, creator-focused packages",
    "Unique on-site and off-site recording options",
    "Full-service solutions to save you time and energy"
  ],
  ctaTitle: "Ready to Create?",
  ctaText: "Contact us today to discuss your project and book your session."
};

const iconMap: { [key: string]: React.ElementType } = {
  radio: Radio,
  mappin: MapPin,
  film: Film,
  video: Video,
  users: Users,
  wifi: Wifi,
  headphones: Headphones,
  clapperboard: Clapperboard,
  sparkles: Sparkles,
  clock: Clock
};

export default function ServicesPage() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(heroScrollProgress, [0, 1], ["0%", "30%"]);

  const [content, setContent] = useState<ServicesContent>(defaultContent);
  const [contentLoaded, setContentLoaded] = useState(false);

  const imagesToPreload = useMemo(() => {
    return [content.heroImage].filter(Boolean);
  }, [content.heroImage]);

  const imagesLoading = useImagePreloader(contentLoaded ? imagesToPreload : []);
  const isLoading = !contentLoaded || imagesLoading;

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from("site_content")
          .select("section, key, value")
          .eq("page", "services");

        if (error) {
          console.error("Error loading services content:", error);
          setContentLoaded(true);
          return;
        }

        if (data && data.length > 0) {
          const newContent = { ...defaultContent };
          data.forEach((item: { section: string; key: string; value: string }) => {
            if (item.section === "hero" && item.key === "image") newContent.heroImage = item.value;
            if (item.section === "hero" && item.key === "headline") newContent.heroHeadline = item.value;
            if (item.section === "hero" && item.key === "subheadline") newContent.heroSubheadline = item.value;
            if (item.section === "intro" && item.key === "title") newContent.introTitle = item.value;
            if (item.section === "intro" && item.key === "text") newContent.introText = item.value;
            if (item.section === "services" && item.key === "items") {
              try { newContent.services = JSON.parse(item.value); } catch (e) { console.error(e); }
            }
            if (item.section === "whychoose" && item.key === "title") newContent.whyChooseTitle = item.value;
            if (item.section === "whychoose" && item.key === "items") {
              try { newContent.whyChooseItems = JSON.parse(item.value); } catch (e) { console.error(e); }
            }
            if (item.section === "cta" && item.key === "title") newContent.ctaTitle = item.value;
            if (item.section === "cta" && item.key === "text") newContent.ctaText = item.value;
          });
          setContent(newContent);
        }
        setContentLoaded(true);
      } catch (err) {
        console.error("Error:", err);
        setContentLoaded(true);
      }
    }

    loadContent();
  }, []);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName.toLowerCase()] || Radio;
    return IconComponent;
  };

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <Header />
      <main className="min-h-screen bg-[#fdfbf8]">
        {/* Hero Section */}
        <section ref={heroRef} className="relative h-[80vh] overflow-hidden">
          <motion.div style={{ y: heroY }} className="absolute inset-0 h-[130%] -top-[15%]">
            <Image
              src={content.heroImage}
              alt="Our Services"
              fill
              sizes="100vw"
              quality={85}
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white max-w-4xl px-6"
            >
              <p className="text-sm tracking-[0.3em] mb-4 text-white">EASTDOCK STUDIOS</p>
              <h1 className="text-5xl md:text-6xl font-light tracking-wider mb-6 text-white">{content.heroHeadline}</h1>
              <p className="text-lg md:text-xl font-light mb-8 text-white/90">{content.heroSubheadline}</p>
              <Link
                href="/#contact"
                className="inline-block border-2 border-white px-10 py-4 text-sm tracking-widest text-white hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
              >
                GET IN TOUCH
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Intro Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <p className="text-sm tracking-[0.3em] text-gray-400 mb-4">OUR SERVICES</p>
              <h2 className="text-5xl font-light text-black mb-6">{content.introTitle}</h2>
              <div className="w-24 h-px bg-gray-300 mx-auto mb-8"></div>
              <p className="text-lg text-gray-600 leading-relaxed">{content.introText}</p>
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-24 bg-[#fdfbf8]">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto space-y-16">
              {content.services.map((service, index) => {
                const IconComponent = getIcon(service.icon);
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
                  >
                    {/* Icon Side */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-black flex items-center justify-center">
                        <IconComponent className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className={`flex-1 ${isEven ? 'md:pl-8' : 'md:pr-8'}`}>
                      <div className="bg-white border border-gray-200 p-8">
                        <p className="text-xs tracking-[0.2em] text-[#DC143C] mb-2">SERVICE {index + 1}</p>
                        <h3 className="text-2xl md:text-3xl font-light text-black mb-3">{service.title}</h3>
                        <p className="text-lg font-medium text-gray-800 mb-4">{service.tagline}</p>
                        <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>
                        <div className="bg-[#fdfbf8] border-l-4 border-[#DC143C] p-4 mb-6">
                          <p className="text-sm">
                            <span className="font-medium text-black">Perfect for: </span>
                            <span className="text-gray-600">{service.perfectFor}</span>
                          </p>
                        </div>
                        <Link
                          href={service.ctaLink}
                          className="inline-block bg-black text-white px-8 py-3 text-sm tracking-widest hover:bg-[#DC143C] transition-colors"
                        >
                          {service.ctaText.toUpperCase()}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 bg-black text-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm tracking-[0.3em] text-gray-400 mb-4">WHY US</p>
              <h2 className="text-5xl font-light">{content.whyChooseTitle}</h2>
              <div className="w-24 h-px bg-gray-600 mx-auto mt-6"></div>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {content.whyChooseItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 border border-white/20"
                  >
                    <Check className="w-6 h-6 text-[#DC143C] flex-shrink-0" />
                    <span className="text-gray-200">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <h2 className="text-5xl font-light text-black mb-6">{content.ctaTitle}</h2>
              <p className="text-lg text-gray-600 mb-8">{content.ctaText}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/#contact"
                  className="inline-block bg-black text-white px-10 py-4 text-sm tracking-widest hover:bg-[#DC143C] transition-colors"
                >
                  CONTACT US TODAY
                </Link>
                <Link
                  href="/booking"
                  className="inline-block border-2 border-black text-black px-10 py-4 text-sm tracking-widest hover:bg-black hover:text-white transition-all duration-300"
                >
                  BOOK A SESSION
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
