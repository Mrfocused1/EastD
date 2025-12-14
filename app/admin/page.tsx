"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Layout,
  Building2,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  Eye,
  ClipboardList,
  Camera,
  Briefcase,
  Users,
  PoundSterling,
  Mail,
  Grid3X3,
  Send,
  Calendar,
  Globe,
  Clock,
  Loader2,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PageItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
  preview: string | null;
}

const getDefaultPages = (studioTitles: { studioDockOne: string; studioDockTwo: string; studioWharf: string }): PageItem[] => [
  {
    name: "Homepage",
    href: "/admin/homepage",
    icon: Layout,
    description: "Edit hero section, welcome text, and featured content",
    preview: "/",
  },
  {
    name: studioTitles.studioDockOne,
    href: "/admin/studio-dock-one",
    icon: Building2,
    description: `Manage ${studioTitles.studioDockOne} studio page content and pricing`,
    preview: "/studios/studio-dock-one",
  },
  {
    name: studioTitles.studioDockTwo,
    href: "/admin/studio-dock-two",
    icon: Building2,
    description: `Manage ${studioTitles.studioDockTwo} studio page content and pricing`,
    preview: "/studios/studio-dock-two",
  },
  {
    name: studioTitles.studioWharf,
    href: "/admin/studio-wharf",
    icon: Building2,
    description: `Manage ${studioTitles.studioWharf} studio page content and pricing`,
    preview: "/studios/studio-wharf",
  },
  {
    name: "Photography",
    href: "/admin/photography",
    icon: Camera,
    description: "Manage photography studio page content and pricing",
    preview: "/studios/photography",
  },
  {
    name: "About Page",
    href: "/admin/about",
    icon: FileText,
    description: "Edit company information and team details",
    preview: "/about",
  },
  {
    name: "Images",
    href: "/admin/images",
    icon: ImageIcon,
    description: "Upload and manage all website images",
    preview: null,
  },
  {
    name: "Gallery",
    href: "/admin/gallery",
    icon: Grid3X3,
    description: "Manage gallery images, categories, and order",
    preview: "/gallery",
  },
  {
    name: "Booking Form",
    href: "/admin/booking",
    icon: ClipboardList,
    description: "Customize booking form fields, dropdowns, and options",
    preview: "/booking",
  },
  {
    name: "Services",
    href: "/admin/services",
    icon: Briefcase,
    description: "Manage services offered and their descriptions",
    preview: "/services",
  },
  {
    name: "Membership",
    href: "/admin/membership",
    icon: Users,
    description: "Edit membership page content and benefits",
    preview: "/membership",
  },
  {
    name: "Pricing",
    href: "/admin/pricing",
    icon: PoundSterling,
    description: "Manage studio pricing and add-on packages",
    preview: "/booking",
  },
  {
    name: "Email Settings",
    href: "/admin/emails",
    icon: Mail,
    description: "Customize booking confirmation emails and location info",
    preview: null,
  },
  {
    name: "Email Campaigns",
    href: "/admin/campaigns",
    icon: Send,
    description: "Create automated email sequences for customers",
    preview: null,
  },
  {
    name: "Google Calendar",
    href: "/admin/calendar",
    icon: Calendar,
    description: "Connect Google Calendar for availability and booking sync",
    preview: null,
  },
];

const stats = [
  { label: "Pages", value: "15" },
  { label: "Sections", value: "40+" },
  { label: "Images", value: "50+" },
];

export default function AdminDashboard() {
  const [pages, setPages] = useState<PageItem[]>(getDefaultPages({
    studioDockOne: "Studio Dock One",
    studioDockTwo: "Studio Dock Two",
    studioWharf: "Studio Wharf",
  }));
  const [siteMode, setSiteMode] = useState<"coming_soon" | "live">("coming_soon");
  const [siteModeLoading, setSiteModeLoading] = useState(true);
  const [siteModeUpdating, setSiteModeUpdating] = useState(false);

  // Load site mode setting
  useEffect(() => {
    async function loadSiteMode() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('value')
          .eq('page', 'global')
          .eq('section', 'settings')
          .eq('key', 'site_mode')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading site mode:', error);
        }

        if (data?.value) {
          setSiteMode(data.value as "coming_soon" | "live");
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setSiteModeLoading(false);
      }
    }

    loadSiteMode();
  }, []);

  // Toggle site mode
  async function toggleSiteMode() {
    const newMode = siteMode === "coming_soon" ? "live" : "coming_soon";
    setSiteModeUpdating(true);

    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({
          page: 'global',
          section: 'settings',
          key: 'site_mode',
          value: newMode,
        }, {
          onConflict: 'page,section,key'
        });

      if (error) {
        console.error('Error updating site mode:', error);
        return;
      }

      setSiteMode(newMode);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSiteModeUpdating(false);
    }
  }

  useEffect(() => {
    async function loadStudioTitles() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('page', 'global')
          .eq('section', 'settings')
          .in('key', ['studio_dock_one_title', 'studio_dock_two_title', 'studio_wharf_title']);

        if (error) {
          console.error('Error loading studio titles:', error);
          return;
        }

        if (data && data.length > 0) {
          const titles = {
            studioDockOne: "Studio Dock One",
            studioDockTwo: "Studio Dock Two",
            studioWharf: "Studio Wharf",
          };
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'studio_dock_one_title') titles.studioDockOne = item.value;
            if (item.key === 'studio_dock_two_title') titles.studioDockTwo = item.value;
            if (item.key === 'studio_wharf_title') titles.studioWharf = item.value;
          });
          setPages(getDefaultPages(titles));
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadStudioTitles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <p className="text-sm tracking-[0.3em] text-black/60 mb-2">WELCOME TO</p>
        <h1 className="text-5xl font-light text-black mb-4">Admin Dashboard</h1>
        <div className="w-24 h-px bg-black/30"></div>
      </motion.div>

      {/* Site Mode Toggle - Prominent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className={`mb-12 p-6 border-2 rounded-lg ${
          siteMode === "live"
            ? "bg-green-50 border-green-300"
            : "bg-amber-50 border-amber-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {siteMode === "live" ? (
              <div className="p-3 bg-green-100 rounded-full">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
            ) : (
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-medium text-black">
                Site Status: {siteMode === "live" ? "LIVE" : "COMING SOON"}
              </h2>
              <p className="text-sm text-black/60">
                {siteMode === "live"
                  ? "Your website is live and visible to visitors"
                  : "Visitors see the 'Coming Soon' holding page"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm text-black/60 hover:text-black border border-black/20 hover:border-black rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Site
            </Link>

            {siteModeLoading ? (
              <div className="px-8 py-3">
                <Loader2 className="w-6 h-6 animate-spin text-black/40" />
              </div>
            ) : (
              <button
                onClick={toggleSiteMode}
                disabled={siteModeUpdating}
                className={`relative px-8 py-3 text-sm font-medium tracking-wider transition-all duration-300 rounded ${
                  siteMode === "live"
                    ? "bg-amber-500 hover:bg-amber-600 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                } disabled:opacity-50`}
              >
                {siteModeUpdating ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : siteMode === "live" ? (
                  "SWITCH TO COMING SOON"
                ) : (
                  "GO LIVE"
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status indicator dot */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/10">
          <div className={`w-3 h-3 rounded-full ${
            siteMode === "live" ? "bg-green-500 animate-pulse" : "bg-amber-500"
          }`} />
          <span className="text-xs text-black/50 uppercase tracking-wider">
            {siteMode === "live" ? "Live and receiving visitors" : "Holding page active"}
          </span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-3 gap-6 mb-12"
      >
        {stats.map((stat, index) => (
          <div
            key={`stat-${stat.label}-${index}`}
            className="bg-white p-6 border border-black/10 text-center"
          >
            <p className="text-4xl font-light text-black mb-2">{stat.value}</p>
            <p className="text-sm tracking-widest text-black/60 uppercase">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-light text-black mb-6">Quick Access</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page, index) => (
            <motion.div
              key={page.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-white border border-black/10 p-6 group hover:border-black/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-black/5 rounded-lg">
                  <page.icon className="w-6 h-6 text-black" strokeWidth={1.5} />
                </div>
                {page.preview && (
                  <Link
                    href={page.preview}
                    target="_blank"
                    className="p-2 text-black/40 hover:text-black transition-colors"
                    title="Preview page"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                )}
              </div>
              <h3 className="text-lg font-medium text-black mb-2">{page.name}</h3>
              <p className="text-sm text-black/60 mb-4 leading-relaxed">
                {page.description}
              </p>
              <Link
                href={page.href}
                className="inline-flex items-center gap-2 text-sm tracking-widest text-black hover:gap-4 transition-all duration-300"
              >
                EDIT <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
