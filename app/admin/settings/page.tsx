"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Database, Shield, Globe } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import SaveButton from "@/components/admin/SaveButton";

export default function SettingsPage() {
  // Site Settings
  const [siteName, setSiteName] = useState("EASTDOC STUDIOS");
  const [siteTagline, setSiteTagline] = useState("BESPOKE STUDIO HIRE");
  const [contactEmail, setContactEmail] = useState("hello@eastdocstudios.com");
  const [contactPhone, setContactPhone] = useState("+44 123 456 7890");

  // Social Links
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/eastdocstudios");
  const [tiktokUrl, setTiktokUrl] = useState("https://tiktok.com/@eastdocstudios");

  // Supabase Settings
  const [supabaseUrl, setSupabaseUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
  const [supabaseKey, setSupabaseKey] = useState("");

  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    console.log("Saving settings...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasChanges(false);
  };

  const markChanged = () => setHasChanges(true);

  return (
    <div className="max-w-4xl mx-auto">
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
            <p className="text-sm tracking-[0.3em] text-black/60 mb-2">ADMIN</p>
            <h1 className="text-4xl font-light text-black">Settings</h1>
          </div>
          <SaveButton onSave={handleSave} hasChanges={hasChanges} />
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Site Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Section title="Site Settings" description="General website settings">
            <div className="flex items-center gap-3 mb-6 p-4 bg-black/5 rounded-lg">
              <Globe className="w-8 h-8 text-black/40" />
              <div>
                <p className="font-medium text-black">General Information</p>
                <p className="text-sm text-black/60">Basic site details and contact info</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <TextInput
                label="Site Name"
                value={siteName}
                onChange={(v) => { setSiteName(v); markChanged(); }}
              />
              <TextInput
                label="Tagline"
                value={siteTagline}
                onChange={(v) => { setSiteTagline(v); markChanged(); }}
              />
              <TextInput
                label="Contact Email"
                value={contactEmail}
                onChange={(v) => { setContactEmail(v); markChanged(); }}
              />
              <TextInput
                label="Contact Phone"
                value={contactPhone}
                onChange={(v) => { setContactPhone(v); markChanged(); }}
              />
            </div>
          </Section>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Section title="Social Media" description="Social media profile links">
            <div className="grid md:grid-cols-2 gap-6">
              <TextInput
                label="Instagram URL"
                value={instagramUrl}
                onChange={(v) => { setInstagramUrl(v); markChanged(); }}
                placeholder="https://instagram.com/..."
              />
              <TextInput
                label="TikTok URL"
                value={tiktokUrl}
                onChange={(v) => { setTiktokUrl(v); markChanged(); }}
                placeholder="https://tiktok.com/..."
              />
            </div>
          </Section>
        </motion.div>

      </div>
    </div>
  );
}
