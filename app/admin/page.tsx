"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Layout,
  Building2,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  Eye
} from "lucide-react";

const pages = [
  {
    name: "Homepage",
    href: "/admin/homepage",
    icon: Layout,
    description: "Edit hero section, welcome text, and featured content",
    preview: "/",
  },
  {
    name: "E16 Set",
    href: "/admin/e16",
    icon: Building2,
    description: "Manage E16 studio page content and pricing",
    preview: "/studios/e16",
  },
  {
    name: "E20 Set",
    href: "/admin/e20",
    icon: Building2,
    description: "Manage E20 studio page content and pricing",
    preview: "/studios/e20",
  },
  {
    name: "LUX Set",
    href: "/admin/lux",
    icon: Building2,
    description: "Manage LUX studio page content and pricing",
    preview: "/studios/lux",
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
];

const stats = [
  { label: "Pages", value: "6" },
  { label: "Sections", value: "24" },
  { label: "Images", value: "50+" },
];

export default function AdminDashboard() {
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

      {/* Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-black text-white p-8"
      >
        <h2 className="text-2xl font-light mb-4">Getting Started</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-light mb-2 text-white/40">01</div>
            <h3 className="font-medium mb-2">Connect Supabase</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Add your Supabase URL and anon key to .env.local file
            </p>
          </div>
          <div>
            <div className="text-4xl font-light mb-2 text-white/40">02</div>
            <h3 className="font-medium mb-2">Create Tables</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Run the SQL migration in your Supabase dashboard
            </p>
          </div>
          <div>
            <div className="text-4xl font-light mb-2 text-white/40">03</div>
            <h3 className="font-medium mb-2">Start Editing</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Select a page and start customizing your content
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
