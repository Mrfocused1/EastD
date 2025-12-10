"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, ArrowLeft, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import { supabase } from "@/lib/supabase";

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

const iconOptions = [
  { value: "radio", label: "Radio (Live Streaming)" },
  { value: "mappin", label: "Map Pin (On-Site)" },
  { value: "film", label: "Film (Production)" },
  { value: "video", label: "Video (Content)" },
  { value: "users", label: "Users (Membership)" },
  { value: "wifi", label: "WiFi" },
  { value: "headphones", label: "Headphones" },
  { value: "clapperboard", label: "Clapperboard" },
  { value: "sparkles", label: "Sparkles" },
  { value: "clock", label: "Clock" },
];

const defaultServices: Service[] = [
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
];

export default function ServicesEditor() {
  const [isLoading, setIsLoading] = useState(true);

  // Hero section
  const [heroImage, setHeroImage] = useState("https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&w=1920");
  const [heroHeadline, setHeroHeadline] = useState("East Dock Studios - Our Services");
  const [heroSubheadline, setHeroSubheadline] = useState("Professional, end-to-end content solutions designed to make recording, producing, and sharing your content seamless and stress-free.");

  // Intro section
  const [introTitle, setIntroTitle] = useState("More Than Just a Studio");
  const [introText, setIntroText] = useState("Welcome to East Dock Studios, London's hub for creators, podcasters, and brands. We don't just offer a studio - we provide professional, end-to-end content solutions designed to make recording, producing, and sharing your content seamless and stress-free.");

  // Services
  const [services, setServices] = useState<Service[]>(defaultServices);

  // Why Choose Us
  const [whyChooseTitle, setWhyChooseTitle] = useState("Why Choose East Dock Studios?");
  const [whyChooseItems, setWhyChooseItems] = useState([
    "State-of-the-art equipment & high-speed internet",
    "Professional support for both audio & video production",
    "Flexible, creator-focused packages",
    "Unique on-site and off-site recording options",
    "Full-service solutions to save you time and energy"
  ]);

  // CTA
  const [ctaTitle, setCtaTitle] = useState("Ready to Create?");
  const [ctaText, setCtaText] = useState("Contact us today to discuss your project and book your session.");

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from("site_content")
          .select("*")
          .eq("page", "services");

        if (error) {
          console.error("Error loading content:", error);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          data.forEach((item: { section: string; key: string; value: string }) => {
            const { section, key, value } = item;

            if (section === "hero" && key === "image") setHeroImage(value);
            if (section === "hero" && key === "headline") setHeroHeadline(value);
            if (section === "hero" && key === "subheadline") setHeroSubheadline(value);

            if (section === "intro" && key === "title") setIntroTitle(value);
            if (section === "intro" && key === "text") setIntroText(value);

            if (section === "services" && key === "items") {
              try { setServices(JSON.parse(value)); } catch (e) { console.error(e); }
            }

            if (section === "whychoose" && key === "title") setWhyChooseTitle(value);
            if (section === "whychoose" && key === "items") {
              try { setWhyChooseItems(JSON.parse(value)); } catch (e) { console.error(e); }
            }

            if (section === "cta" && key === "title") setCtaTitle(value);
            if (section === "cta" && key === "text") setCtaText(value);
          });
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, []);

  const handleSave = async () => {
    const contentToSave = [
      { page: "services", section: "hero", key: "image", value: heroImage, type: "image" },
      { page: "services", section: "hero", key: "headline", value: heroHeadline, type: "text" },
      { page: "services", section: "hero", key: "subheadline", value: heroSubheadline, type: "text" },
      { page: "services", section: "intro", key: "title", value: introTitle, type: "text" },
      { page: "services", section: "intro", key: "text", value: introText, type: "text" },
      { page: "services", section: "services", key: "items", value: JSON.stringify(services), type: "array" },
      { page: "services", section: "whychoose", key: "title", value: whyChooseTitle, type: "text" },
      { page: "services", section: "whychoose", key: "items", value: JSON.stringify(whyChooseItems), type: "array" },
      { page: "services", section: "cta", key: "title", value: ctaTitle, type: "text" },
      { page: "services", section: "cta", key: "text", value: ctaText, type: "text" },
    ];

    try {
      for (const item of contentToSave) {
        const { error } = await supabase
          .from("site_content")
          .upsert(
            {
              ...item,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "page,section,key",
            }
          );

        if (error) {
          console.error("Error saving:", error);
          throw error;
        }
      }
      setHasChanges(false);
    } catch (err) {
      console.error("Save failed:", err);
      throw err;
    }
  };

  const markChanged = () => setHasChanges(true);

  const updateService = (index: number, field: keyof Service, value: string) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    setServices(newServices);
    markChanged();
  };

  const addService = () => {
    const newService: Service = {
      id: `service-${Date.now()}`,
      title: "New Service",
      tagline: "Service tagline here",
      description: "Service description here",
      perfectFor: "Target audience here",
      ctaText: "Book Now",
      ctaLink: "/booking",
      icon: "sparkles"
    };
    setServices([...services, newService]);
    markChanged();
  };

  const removeService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
    markChanged();
  };

  const updateListItem = (list: string[], setList: (list: string[]) => void, index: number, value: string) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
    markChanged();
  };

  const addListItem = (list: string[], setList: (list: string[]) => void) => {
    setList([...list, ""]);
    markChanged();
  };

  const removeListItem = (list: string[], setList: (list: string[]) => void, index: number) => {
    const newList = list.filter((_, i) => i !== index);
    setList(newList);
    markChanged();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm tracking-[0.3em] text-black/60 mb-2">EDITING</p>
            <h1 className="text-4xl font-light text-black">Services Page</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/services"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 border border-black/20 text-black text-sm tracking-widest hover:bg-black/5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              PREVIEW
            </Link>
            <SaveButton onSave={handleSave} hasChanges={hasChanges} />
          </div>
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Section title="Hero Section" description="Page header banner">
            <ImageUpload
              label="Background Image"
              value={heroImage}
              onChange={(v) => { setHeroImage(v); markChanged(); }}
            />
            <TextInput
              label="Headline"
              value={heroHeadline}
              onChange={(v) => { setHeroHeadline(v); markChanged(); }}
            />
            <TextInput
              label="Subheadline"
              value={heroSubheadline}
              onChange={(v) => { setHeroSubheadline(v); markChanged(); }}
              multiline
              rows={2}
            />
          </Section>
        </motion.div>

        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Section title="Intro Section" description="Introduction text">
            <TextInput
              label="Title"
              value={introTitle}
              onChange={(v) => { setIntroTitle(v); markChanged(); }}
            />
            <TextInput
              label="Description"
              value={introText}
              onChange={(v) => { setIntroText(v); markChanged(); }}
              multiline
              rows={3}
            />
          </Section>
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section title="Services" description="All services offered">
            <div className="space-y-6">
              {services.map((service, index) => (
                <div key={service.id} className="bg-black/5 p-6 relative">
                  <div className="absolute top-4 left-4 text-black/30">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => removeService(index)}
                      className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="pl-8 pr-12 space-y-4">
                    <p className="text-xs tracking-[0.2em] text-[#DC143C] mb-2">SERVICE {index + 1}</p>

                    <TextInput
                      label="Title"
                      value={service.title}
                      onChange={(v) => updateService(index, "title", v)}
                    />

                    <TextInput
                      label="Tagline"
                      value={service.tagline}
                      onChange={(v) => updateService(index, "tagline", v)}
                    />

                    <TextInput
                      label="Description"
                      value={service.description}
                      onChange={(v) => updateService(index, "description", v)}
                      multiline
                      rows={3}
                    />

                    <TextInput
                      label="Perfect For"
                      value={service.perfectFor}
                      onChange={(v) => updateService(index, "perfectFor", v)}
                    />

                    <div className="grid md:grid-cols-2 gap-4">
                      <TextInput
                        label="CTA Button Text"
                        value={service.ctaText}
                        onChange={(v) => updateService(index, "ctaText", v)}
                      />
                      <TextInput
                        label="CTA Link"
                        value={service.ctaLink}
                        onChange={(v) => updateService(index, "ctaLink", v)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black/80 mb-2">Icon</label>
                      <select
                        value={service.icon}
                        onChange={(e) => updateService(index, "icon", e.target.value)}
                        className="w-full px-4 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors"
                      >
                        {iconOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addService}
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>
          </Section>
        </motion.div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Section title="Why Choose Us" description="Benefits section">
            <TextInput
              label="Section Title"
              value={whyChooseTitle}
              onChange={(v) => { setWhyChooseTitle(v); markChanged(); }}
            />
            <div className="space-y-3">
              <label className="block text-sm font-medium text-black/80">Benefits</label>
              {whyChooseItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateListItem(whyChooseItems, setWhyChooseItems, index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={() => removeListItem(whyChooseItems, setWhyChooseItems, index)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem(whyChooseItems, setWhyChooseItems)}
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Benefit
              </button>
            </div>
          </Section>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Section title="Call to Action" description="Final CTA section">
            <TextInput
              label="Title"
              value={ctaTitle}
              onChange={(v) => { setCtaTitle(v); markChanged(); }}
            />
            <TextInput
              label="Description"
              value={ctaText}
              onChange={(v) => { setCtaText(v); markChanged(); }}
              multiline
              rows={2}
            />
          </Section>
        </motion.div>
      </div>

      {/* Floating Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8"
        >
          <SaveButton onSave={handleSave} hasChanges={hasChanges} />
        </motion.div>
      )}
    </div>
  );
}
