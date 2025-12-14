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
  Calendar
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
        className="mb-12"
      >
        <p className="text-sm tracking-[0.3em] text-black/60 mb-2">WELCOME TO</p>
        <h1 className="text-5xl font-light text-black mb-4">Admin Dashboard</h1>
        <div className="w-24 h-px bg-black/30"></div>
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
