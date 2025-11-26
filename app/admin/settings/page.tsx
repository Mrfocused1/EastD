"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Database, Shield, Globe, Building2, Loader2 } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import SaveButton from "@/components/admin/SaveButton";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Site Settings
  const [siteName, setSiteName] = useState("EASTDOC STUDIOS");
  const [siteTagline, setSiteTagline] = useState("BESPOKE STUDIO HIRE");
  const [contactEmail, setContactEmail] = useState("hello@eastdocstudios.com");
  const [contactPhone, setContactPhone] = useState("+44 123 456 7890");

  // Social Links
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/eastdocstudios");
  const [tiktokUrl, setTiktokUrl] = useState("https://tiktok.com/@eastdocstudios");

  // Studio/Page Titles
  const [e16Title, setE16Title] = useState("E16 SET");
  const [e20Title, setE20Title] = useState("E20 SET");
  const [luxTitle, setLuxTitle] = useState("LUX SET");

  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from Supabase
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'global')
          .eq('section', 'settings');

        if (error) {
          console.error('Error loading settings:', error);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          data.forEach((item: { key: string; value: string }) => {
            const { key, value } = item;

            // Site Settings
            if (key === 'site_name') setSiteName(value);
            if (key === 'site_tagline') setSiteTagline(value);
            if (key === 'contact_email') setContactEmail(value);
            if (key === 'contact_phone') setContactPhone(value);

            // Social Links
            if (key === 'instagram_url') setInstagramUrl(value);
            if (key === 'tiktok_url') setTiktokUrl(value);

            // Studio Titles
            if (key === 'e16_title') setE16Title(value);
            if (key === 'e20_title') setE20Title(value);
            if (key === 'lux_title') setLuxTitle(value);
          });
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSave = async () => {
    const settingsToSave = [
      // Site Settings
      { page: 'global', section: 'settings', key: 'site_name', value: siteName, type: 'text' },
      { page: 'global', section: 'settings', key: 'site_tagline', value: siteTagline, type: 'text' },
      { page: 'global', section: 'settings', key: 'contact_email', value: contactEmail, type: 'text' },
      { page: 'global', section: 'settings', key: 'contact_phone', value: contactPhone, type: 'text' },
      // Social Links
      { page: 'global', section: 'settings', key: 'instagram_url', value: instagramUrl, type: 'text' },
      { page: 'global', section: 'settings', key: 'tiktok_url', value: tiktokUrl, type: 'text' },
      // Studio Titles
      { page: 'global', section: 'settings', key: 'e16_title', value: e16Title, type: 'text' },
      { page: 'global', section: 'settings', key: 'e20_title', value: e20Title, type: 'text' },
      { page: 'global', section: 'settings', key: 'lux_title', value: luxTitle, type: 'text' },
    ];

    try {
      // Use Promise.all for parallel saves
      const savePromises = settingsToSave.map(item =>
        supabase
          .from('site_content')
          .upsert(
            {
              ...item,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'page,section,key',
            }
          )
      );

      const results = await Promise.all(savePromises);

      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Save errors:', errors);
        throw new Error(`Failed to save ${errors.length} item(s)`);
      }

      setHasChanges(false);
    } catch (err) {
      console.error('Save failed:', err);
      throw err;
    }
  };

  const markChanged = () => setHasChanges(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
      </div>
    );
  }

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

        {/* Studio/Page Titles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section title="Studio & Page Titles" description="Customize the names of your studio pages in navigation menus">
            <div className="flex items-center gap-3 mb-6 p-4 bg-black/5 rounded-lg">
              <Building2 className="w-8 h-8 text-black/40" />
              <div>
                <p className="font-medium text-black">Navigation Labels</p>
                <p className="text-sm text-black/60">These titles appear in menus, headers, and throughout the site</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <TextInput
                label="Studio 1 Title"
                value={e16Title}
                onChange={(v) => { setE16Title(v); markChanged(); }}
                placeholder="E16 SET"
              />
              <TextInput
                label="Studio 2 Title"
                value={e20Title}
                onChange={(v) => { setE20Title(v); markChanged(); }}
                placeholder="E20 SET"
              />
              <TextInput
                label="Studio 3 Title"
                value={luxTitle}
                onChange={(v) => { setLuxTitle(v); markChanged(); }}
                placeholder="LUX SET"
              />
            </div>
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
