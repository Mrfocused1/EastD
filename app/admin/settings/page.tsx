"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Database, Shield, Globe, Building2, Loader2, Image as ImageIcon, Gift, Headphones } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Site Settings
  const [siteName, setSiteName] = useState("EASTDOCK STUDIOS");
  const [siteTagline, setSiteTagline] = useState("BESPOKE STUDIO HIRE");
  const [contactEmail, setContactEmail] = useState("admin@eastdockstudios.co.uk");
  const [contactPhone, setContactPhone] = useState("+44 123 456 7890");
  const [contactAddress, setContactAddress] = useState("East Dock Studios, Royal Victoria Dock, London E16");
  const [googleMapsEmbed, setGoogleMapsEmbed] = useState("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.123456789!2d0.0234!3d51.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sRoyal%20Victoria%20Dock!5e0!3m2!1sen!2suk!4v1234567890");

  // Social Links
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/eastdockstudios");
  const [tiktokUrl, setTiktokUrl] = useState("https://tiktok.com/@eastdockstudios");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Studio/Page Titles
  const [e16Title, setE16Title] = useState("Studio Dock One");
  const [e20Title, setE20Title] = useState("Studio Dock Two");
  const [luxTitle, setLuxTitle] = useState("Studio Wharf");
  const [photographyTitle, setPhotographyTitle] = useState("Photography");

  // Other Studios Thumbnails
  const [e16Thumbnail, setE16Thumbnail] = useState("https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=1200");
  const [e20Thumbnail, setE20Thumbnail] = useState("https://images.pexels.com/photos/6957097/pexels-photo-6957097.jpeg?auto=compress&cs=tinysrgb&w=1200");
  const [luxThumbnail, setLuxThumbnail] = useState("https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=1200");
  const [photographyThumbnail, setPhotographyThumbnail] = useState("https://images.pexels.com/photos/3379934/pexels-photo-3379934.jpeg?auto=compress&cs=tinysrgb&w=1200");

  // Promo Popup Settings
  const [promoEnabled, setPromoEnabled] = useState(true);
  const [promoHeadline, setPromoHeadline] = useState("Welcome to East Dock Studios!");
  const [promoSubheadline, setPromoSubheadline] = useState("Get 30% off all bookings");
  const [promoDescription, setPromoDescription] = useState("As a first-time client, enjoy an exclusive discount on your first studio booking.");
  const [promoCtaText, setPromoCtaText] = useState("CLAIM OFFER");
  const [promoCtaLink, setPromoCtaLink] = useState("/booking");
  const [promoDiscountCode, setPromoDiscountCode] = useState("WELCOME30");

  // Exit Intent Popup Settings
  const [exitEnabled, setExitEnabled] = useState(true);
  const [exitHeadline, setExitHeadline] = useState("Wait! Don't Miss Your Intro Offer");
  const [exitBody, setExitBody] = useState("Get a personalised membership quote and receive a bonus discount.");
  const [exitCtaText, setExitCtaText] = useState("Get My Quote");
  const [exitCtaLink, setExitCtaLink] = useState("/membership#membership-form");
  const [exitBannerText, setExitBannerText] = useState("Leaving so soon? New members get exclusive first-month perks — don't miss out.");
  const [exitBannerCtaText, setExitBannerCtaText] = useState("Explore Benefits");
  const [exitBannerCtaLink, setExitBannerCtaLink] = useState("/membership");

  // Seasonal Popup Settings
  const [seasonalEnabled, setSeasonalEnabled] = useState(true);
  const [seasonalHeadline, setSeasonalHeadline] = useState("Need Help With Your Next Shoot?");
  const [seasonalBody, setSeasonalBody] = useState("Our team can support you from basic studio access to full production services. Ask us about tailored memberships.");
  const [seasonalCtaText, setSeasonalCtaText] = useState("Speak to Us");
  const [seasonalCtaLink, setSeasonalCtaLink] = useState("/membership#membership-form");
  const [seasonalBannerText, setSeasonalBannerText] = useState("Create more with less stress. Members enjoy discounted gear, priority slots, and creative support.");
  const [seasonalBannerCtaText, setSeasonalBannerCtaText] = useState("Become a Member");
  const [seasonalBannerCtaLink, setSeasonalBannerCtaLink] = useState("/membership");

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

            // Address & Map
            if (key === 'contact_address') setContactAddress(value);
            if (key === 'google_maps_embed') setGoogleMapsEmbed(value);

            // Social Links
            if (key === 'instagram_url') setInstagramUrl(value);
            if (key === 'tiktok_url') setTiktokUrl(value);
            if (key === 'facebook_url') setFacebookUrl(value);
            if (key === 'twitter_url') setTwitterUrl(value);
            if (key === 'linkedin_url') setLinkedinUrl(value);

            // Studio Titles
            if (key === 'studio_dock_one_title') setE16Title(value);
            if (key === 'studio_dock_two_title') setE20Title(value);
            if (key === 'studio_wharf_title') setLuxTitle(value);
            if (key === 'photography_title') setPhotographyTitle(value);

            // Studio Thumbnails
            if (key === 'studio_dock_one_thumbnail') setE16Thumbnail(value);
            if (key === 'studio_dock_two_thumbnail') setE20Thumbnail(value);
            if (key === 'studio_wharf_thumbnail') setLuxThumbnail(value);
            if (key === 'photography_thumbnail') setPhotographyThumbnail(value);
          });
        }

        // Load promo popup settings
        const { data: promoData, error: promoError } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'global')
          .eq('section', 'promo_popup');

        if (!promoError && promoData && promoData.length > 0) {
          promoData.forEach((item: { key: string; value: string }) => {
            const { key, value } = item;
            if (key === 'enabled') setPromoEnabled(value === 'true');
            if (key === 'headline') setPromoHeadline(value);
            if (key === 'subheadline') setPromoSubheadline(value);
            if (key === 'description') setPromoDescription(value);
            if (key === 'cta_text') setPromoCtaText(value);
            if (key === 'cta_link') setPromoCtaLink(value);
            if (key === 'discount_code') setPromoDiscountCode(value);
          });
        }

        // Load exit intent popup settings
        const { data: exitData, error: exitError } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'global')
          .eq('section', 'exit_intent');

        if (!exitError && exitData && exitData.length > 0) {
          exitData.forEach((item: { key: string; value: string }) => {
            const { key, value } = item;
            if (key === 'enabled') setExitEnabled(value === 'true');
            if (key === 'headline') setExitHeadline(value);
            if (key === 'body') setExitBody(value);
            if (key === 'cta_text') setExitCtaText(value);
            if (key === 'cta_link') setExitCtaLink(value);
            if (key === 'banner_text') setExitBannerText(value);
            if (key === 'banner_cta_text') setExitBannerCtaText(value);
            if (key === 'banner_cta_link') setExitBannerCtaLink(value);
          });
        }

        // Load seasonal popup settings
        const { data: seasonalData, error: seasonalError } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'global')
          .eq('section', 'seasonal_popup');

        if (!seasonalError && seasonalData && seasonalData.length > 0) {
          seasonalData.forEach((item: { key: string; value: string }) => {
            const { key, value } = item;
            if (key === 'enabled') setSeasonalEnabled(value === 'true');
            if (key === 'headline') setSeasonalHeadline(value);
            if (key === 'body') setSeasonalBody(value);
            if (key === 'cta_text') setSeasonalCtaText(value);
            if (key === 'cta_link') setSeasonalCtaLink(value);
            if (key === 'banner_text') setSeasonalBannerText(value);
            if (key === 'banner_cta_text') setSeasonalBannerCtaText(value);
            if (key === 'banner_cta_link') setSeasonalBannerCtaLink(value);
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
      // Address & Map
      { page: 'global', section: 'settings', key: 'contact_address', value: contactAddress, type: 'text' },
      { page: 'global', section: 'settings', key: 'google_maps_embed', value: googleMapsEmbed, type: 'text' },
      // Social Links
      { page: 'global', section: 'settings', key: 'instagram_url', value: instagramUrl, type: 'text' },
      { page: 'global', section: 'settings', key: 'tiktok_url', value: tiktokUrl, type: 'text' },
      { page: 'global', section: 'settings', key: 'facebook_url', value: facebookUrl, type: 'text' },
      { page: 'global', section: 'settings', key: 'twitter_url', value: twitterUrl, type: 'text' },
      { page: 'global', section: 'settings', key: 'linkedin_url', value: linkedinUrl, type: 'text' },
      // Studio Titles
      { page: 'global', section: 'settings', key: 'studio_dock_one_title', value: e16Title, type: 'text' },
      { page: 'global', section: 'settings', key: 'studio_dock_two_title', value: e20Title, type: 'text' },
      { page: 'global', section: 'settings', key: 'studio_wharf_title', value: luxTitle, type: 'text' },
      { page: 'global', section: 'settings', key: 'photography_title', value: photographyTitle, type: 'text' },
      // Studio Thumbnails
      { page: 'global', section: 'settings', key: 'studio_dock_one_thumbnail', value: e16Thumbnail, type: 'text' },
      { page: 'global', section: 'settings', key: 'studio_dock_two_thumbnail', value: e20Thumbnail, type: 'text' },
      { page: 'global', section: 'settings', key: 'studio_wharf_thumbnail', value: luxThumbnail, type: 'text' },
      { page: 'global', section: 'settings', key: 'photography_thumbnail', value: photographyThumbnail, type: 'text' },
      // Promo Popup
      { page: 'global', section: 'promo_popup', key: 'enabled', value: promoEnabled.toString(), type: 'text' },
      { page: 'global', section: 'promo_popup', key: 'headline', value: promoHeadline, type: 'text' },
      { page: 'global', section: 'promo_popup', key: 'subheadline', value: promoSubheadline, type: 'text' },
      { page: 'global', section: 'promo_popup', key: 'description', value: promoDescription, type: 'text' },
      { page: 'global', section: 'promo_popup', key: 'cta_text', value: promoCtaText, type: 'text' },
      { page: 'global', section: 'promo_popup', key: 'cta_link', value: promoCtaLink, type: 'text' },
      { page: 'global', section: 'promo_popup', key: 'discount_code', value: promoDiscountCode, type: 'text' },
      // Exit Intent Popup
      { page: 'global', section: 'exit_intent', key: 'enabled', value: exitEnabled.toString(), type: 'text' },
      { page: 'global', section: 'exit_intent', key: 'headline', value: exitHeadline, type: 'text' },
      { page: 'global', section: 'exit_intent', key: 'body', value: exitBody, type: 'text' },
      { page: 'global', section: 'exit_intent', key: 'cta_text', value: exitCtaText, type: 'text' },
      { page: 'global', section: 'exit_intent', key: 'cta_link', value: exitCtaLink, type: 'text' },
      { page: 'global', section: 'exit_intent', key: 'banner_text', value: exitBannerText, type: 'text' },
      { page: 'global', section: 'exit_intent', key: 'banner_cta_text', value: exitBannerCtaText, type: 'text' },
      { page: 'global', section: 'exit_intent', key: 'banner_cta_link', value: exitBannerCtaLink, type: 'text' },
      // Seasonal Popup
      { page: 'global', section: 'seasonal_popup', key: 'enabled', value: seasonalEnabled.toString(), type: 'text' },
      { page: 'global', section: 'seasonal_popup', key: 'headline', value: seasonalHeadline, type: 'text' },
      { page: 'global', section: 'seasonal_popup', key: 'body', value: seasonalBody, type: 'text' },
      { page: 'global', section: 'seasonal_popup', key: 'cta_text', value: seasonalCtaText, type: 'text' },
      { page: 'global', section: 'seasonal_popup', key: 'cta_link', value: seasonalCtaLink, type: 'text' },
      { page: 'global', section: 'seasonal_popup', key: 'banner_text', value: seasonalBannerText, type: 'text' },
      { page: 'global', section: 'seasonal_popup', key: 'banner_cta_text', value: seasonalBannerCtaText, type: 'text' },
      { page: 'global', section: 'seasonal_popup', key: 'banner_cta_link', value: seasonalBannerCtaLink, type: 'text' },
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
            <div className="grid md:grid-cols-1 gap-6 mt-6">
              <TextInput
                label="Address"
                value={contactAddress}
                onChange={(v) => { setContactAddress(v); markChanged(); }}
                placeholder="East Dock Studios, Royal Victoria Dock, London E16"
              />
              <TextInput
                label="Google Maps Embed URL"
                value={googleMapsEmbed}
                onChange={(v) => { setGoogleMapsEmbed(v); markChanged(); }}
                placeholder="https://www.google.com/maps/embed?pb=..."
                multiline
                rows={2}
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
              <TextInput
                label="Facebook URL"
                value={facebookUrl}
                onChange={(v) => { setFacebookUrl(v); markChanged(); }}
                placeholder="https://facebook.com/..."
              />
              <TextInput
                label="Twitter/X URL"
                value={twitterUrl}
                onChange={(v) => { setTwitterUrl(v); markChanged(); }}
                placeholder="https://twitter.com/..."
              />
              <TextInput
                label="LinkedIn URL"
                value={linkedinUrl}
                onChange={(v) => { setLinkedinUrl(v); markChanged(); }}
                placeholder="https://linkedin.com/..."
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
            <div className="grid md:grid-cols-2 gap-6">
              <TextInput
                label="Studio Dock 1 Title"
                value={e16Title}
                onChange={(v) => { setE16Title(v); markChanged(); }}
                placeholder="Studio Dock One"
              />
              <TextInput
                label="Studio Dock 2 Title"
                value={e20Title}
                onChange={(v) => { setE20Title(v); markChanged(); }}
                placeholder="Studio Dock Two"
              />
              <TextInput
                label="Studio Wharf Title"
                value={luxTitle}
                onChange={(v) => { setLuxTitle(v); markChanged(); }}
                placeholder="Studio Wharf"
              />
              <TextInput
                label="Photography Title"
                value={photographyTitle}
                onChange={(v) => { setPhotographyTitle(v); markChanged(); }}
                placeholder="Photography"
              />
            </div>
          </Section>
        </motion.div>

        {/* Other Studios Thumbnails */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Section title="Other Studios Thumbnails" description="Images shown in the 'Other Studios' sections across studio pages">
            <div className="flex items-center gap-3 mb-6 p-4 bg-black/5 rounded-lg">
              <ImageIcon className="w-8 h-8 text-black/40" />
              <div>
                <p className="font-medium text-black">Thumbnail Images</p>
                <p className="text-sm text-black/60">These images appear when linking to studios from other pages</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <ImageUpload
                label="Studio Dock 1 Thumbnail"
                value={e16Thumbnail}
                onChange={(v) => { setE16Thumbnail(v); markChanged(); }}
                showFocalPointPicker={false}
              />
              <ImageUpload
                label="Studio Dock 2 Thumbnail"
                value={e20Thumbnail}
                onChange={(v) => { setE20Thumbnail(v); markChanged(); }}
                showFocalPointPicker={false}
              />
              <ImageUpload
                label="Studio Wharf Thumbnail"
                value={luxThumbnail}
                onChange={(v) => { setLuxThumbnail(v); markChanged(); }}
                showFocalPointPicker={false}
              />
              <ImageUpload
                label="Photography Thumbnail"
                value={photographyThumbnail}
                onChange={(v) => { setPhotographyThumbnail(v); markChanged(); }}
                showFocalPointPicker={false}
              />
            </div>
          </Section>
        </motion.div>

        {/* Promo Popup Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Section title="Promo Popup" description="First-time visitor promotional popup banner">
            <div className="flex items-center gap-3 mb-6 p-4 bg-black/5 rounded-lg">
              <Gift className="w-8 h-8 text-black/40" />
              <div>
                <p className="font-medium text-black">Welcome Offer</p>
                <p className="text-sm text-black/60">This popup appears once for first-time visitors</p>
              </div>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-black/5 rounded-lg mb-6">
              <div>
                <p className="font-medium text-black">Enable Promo Popup</p>
                <p className="text-sm text-black/60">Show popup to first-time visitors</p>
              </div>
              <button
                onClick={() => { setPromoEnabled(!promoEnabled); markChanged(); }}
                className={`relative w-14 h-7 rounded-full transition-colors ${promoEnabled ? 'bg-[#DC143C]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${promoEnabled ? 'left-8' : 'left-1'}`} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <TextInput
                label="Headline"
                value={promoHeadline}
                onChange={(v) => { setPromoHeadline(v); markChanged(); }}
                placeholder="Welcome to East Dock Studios!"
              />
              <TextInput
                label="Subheadline (Offer)"
                value={promoSubheadline}
                onChange={(v) => { setPromoSubheadline(v); markChanged(); }}
                placeholder="Get 30% off all bookings"
              />
            </div>
            <div className="mt-6">
              <TextInput
                label="Description"
                value={promoDescription}
                onChange={(v) => { setPromoDescription(v); markChanged(); }}
                placeholder="As a first-time client, enjoy an exclusive discount..."
                multiline
                rows={2}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <TextInput
                label="Button Text"
                value={promoCtaText}
                onChange={(v) => { setPromoCtaText(v); markChanged(); }}
                placeholder="CLAIM OFFER"
              />
              <TextInput
                label="Button Link"
                value={promoCtaLink}
                onChange={(v) => { setPromoCtaLink(v); markChanged(); }}
                placeholder="/booking"
              />
              <TextInput
                label="Discount Code"
                value={promoDiscountCode}
                onChange={(v) => { setPromoDiscountCode(v); markChanged(); }}
                placeholder="WELCOME30"
              />
            </div>
          </Section>
        </motion.div>

        {/* Exit Intent Popup Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <Section title="Exit Intent Popup" description="Popup that appears when user tries to leave the page">
            <div className="flex items-center gap-3 mb-6 p-4 bg-black/5 rounded-lg">
              <Gift className="w-8 h-8 text-black/40" />
              <div>
                <p className="font-medium text-black">Before You Go Offer</p>
                <p className="text-sm text-black/60">Triggers when user moves mouse to leave (desktop only)</p>
              </div>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-black/5 rounded-lg mb-6">
              <div>
                <p className="font-medium text-black">Enable Exit Intent Popup</p>
                <p className="text-sm text-black/60">Show popup when users try to leave</p>
              </div>
              <button
                onClick={() => { setExitEnabled(!exitEnabled); markChanged(); }}
                className={`relative w-14 h-7 rounded-full transition-colors ${exitEnabled ? 'bg-[#DC143C]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${exitEnabled ? 'left-8' : 'left-1'}`} />
              </button>
            </div>

            <p className="text-sm font-medium text-black/60 mb-4">POPUP CONTENT</p>
            <div className="grid md:grid-cols-2 gap-6">
              <TextInput
                label="Headline"
                value={exitHeadline}
                onChange={(v) => { setExitHeadline(v); markChanged(); }}
                placeholder="Wait! Don't Miss Your Intro Offer"
              />
              <TextInput
                label="Body Text"
                value={exitBody}
                onChange={(v) => { setExitBody(v); markChanged(); }}
                placeholder="Get a personalised membership quote..."
              />
              <TextInput
                label="Button Text"
                value={exitCtaText}
                onChange={(v) => { setExitCtaText(v); markChanged(); }}
                placeholder="Get My Quote"
              />
              <TextInput
                label="Button Link"
                value={exitCtaLink}
                onChange={(v) => { setExitCtaLink(v); markChanged(); }}
                placeholder="/membership#membership-form"
              />
            </div>

            <p className="text-sm font-medium text-black/60 mb-4 mt-8">FOLLOW-UP BANNER</p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <TextInput
                  label="Banner Text"
                  value={exitBannerText}
                  onChange={(v) => { setExitBannerText(v); markChanged(); }}
                  placeholder="Leaving so soon? New members get exclusive first-month perks..."
                />
              </div>
              <TextInput
                label="Banner Button Text"
                value={exitBannerCtaText}
                onChange={(v) => { setExitBannerCtaText(v); markChanged(); }}
                placeholder="Explore Benefits"
              />
              <TextInput
                label="Banner Button Link"
                value={exitBannerCtaLink}
                onChange={(v) => { setExitBannerCtaLink(v); markChanged(); }}
                placeholder="/membership"
              />
            </div>
          </Section>
        </motion.div>

        {/* Seasonal Popup Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Section title="Seasonal Popup" description="Recurring popup that shows on every visit (except first-time visitors)">
            <div className="flex items-center gap-3 mb-6 p-4 bg-black/5 rounded-lg">
              <Headphones className="w-8 h-8 text-black/40" />
              <div>
                <p className="font-medium text-black">Creator&apos;s Boost</p>
                <p className="text-sm text-black/60">Shows to returning visitors once per session</p>
              </div>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-black/5 rounded-lg mb-6">
              <div>
                <p className="font-medium text-black">Enable Seasonal Popup</p>
                <p className="text-sm text-black/60">Show popup to returning visitors</p>
              </div>
              <button
                onClick={() => { setSeasonalEnabled(!seasonalEnabled); markChanged(); }}
                className={`relative w-14 h-7 rounded-full transition-colors ${seasonalEnabled ? 'bg-[#DC143C]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${seasonalEnabled ? 'left-8' : 'left-1'}`} />
              </button>
            </div>

            <p className="text-sm font-medium text-black/60 mb-4">POPUP CONTENT</p>
            <div className="grid md:grid-cols-2 gap-6">
              <TextInput
                label="Headline"
                value={seasonalHeadline}
                onChange={(v) => { setSeasonalHeadline(v); markChanged(); }}
                placeholder="Need Help With Your Next Shoot?"
              />
              <TextInput
                label="Body Text"
                value={seasonalBody}
                onChange={(v) => { setSeasonalBody(v); markChanged(); }}
                placeholder="Our team can support you from basic studio access..."
                multiline
                rows={2}
              />
              <TextInput
                label="Button Text"
                value={seasonalCtaText}
                onChange={(v) => { setSeasonalCtaText(v); markChanged(); }}
                placeholder="Speak to Us"
              />
              <TextInput
                label="Button Link"
                value={seasonalCtaLink}
                onChange={(v) => { setSeasonalCtaLink(v); markChanged(); }}
                placeholder="/membership#membership-form"
              />
            </div>

            <p className="text-sm font-medium text-black/60 mb-4 mt-8">FOLLOW-UP BANNER</p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-3">
                <TextInput
                  label="Banner Text"
                  value={seasonalBannerText}
                  onChange={(v) => { setSeasonalBannerText(v); markChanged(); }}
                  placeholder="Create more with less stress. Members enjoy discounted gear..."
                />
              </div>
              <TextInput
                label="Banner Button Text"
                value={seasonalBannerCtaText}
                onChange={(v) => { setSeasonalBannerCtaText(v); markChanged(); }}
                placeholder="Become a Member"
              />
              <TextInput
                label="Banner Button Link"
                value={seasonalBannerCtaLink}
                onChange={(v) => { setSeasonalBannerCtaLink(v); markChanged(); }}
                placeholder="/membership"
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
