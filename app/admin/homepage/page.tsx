"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";

export default function HomepageEditor() {
  // Hero section state
  const [heroImage, setHeroImage] = useState("/BLACKPR%20X%20WANNI171.JPG");
  const [heroTagline, setHeroTagline] = useState("BESPOKE STUDIO HIRE");

  // Welcome section state
  const [welcomeSubtitle, setWelcomeSubtitle] = useState("EASTDOC STUDIOS");
  const [welcomeTitle, setWelcomeTitle] = useState("WELCOME");
  const [welcomeText, setWelcomeText] = useState(
    "Welcome to East Dock Studios Premium Studio High where creativity meets craftsmanship. High-end production quality is now within reach."
  );

  // Experience section state
  const [experienceSubtitle, setExperienceSubtitle] = useState("Exclusive");
  const [experienceTitle, setExperienceTitle] = useState("Your Vision, Our Space");
  const [experienceText, setExperienceText] = useState(
    "Our three sets let you film multiple projects in one session. Modular furnishings, expert lighting, and professional equipment make it perfect for live streams, interviews, online shows, talking head shots, beauty content, and photography. Every session is tailor-made to your vision — a polished, flexible space where creativity thrives."
  );

  // Studios section state
  const [studiosSubtitle, setStudiosSubtitle] = useState("EASTDOC STUDIOS");
  const [studiosTitle, setStudiosTitle] = useState("OUR STUDIOS");
  const [studio1Image, setStudio1Image] = useState("/BLACKPR%20X%20WANNI121.JPG");
  const [studio1Title, setStudio1Title] = useState("E16 SET");
  const [studio2Image, setStudio2Image] = useState("/BLACKPR%20X%20WANNI174.JPG");
  const [studio2Title, setStudio2Title] = useState("E20 SET");
  const [studio3Image, setStudio3Image] = useState("https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=1200");
  const [studio3Title, setStudio3Title] = useState("LUX SET");

  // Clients section state
  const [clientsSubtitle, setClientsSubtitle] = useState("OUR CLIENTS");
  const [clientsTitle, setClientsTitle] = useState("THE CREATIVES WHO MAKE EAST DOCK STUDIOS THEIR PRODUCTION HOME.");

  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    // TODO: Save to Supabase
    console.log("Saving homepage content...");
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasChanges(false);
  };

  const markChanged = () => setHasChanges(true);

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
            <h1 className="text-4xl font-light text-black">Homepage</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
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
          <Section title="Hero Section" description="Main banner at the top of the page">
            <ImageUpload
              label="Background Image"
              value={heroImage}
              onChange={(v) => { setHeroImage(v); markChanged(); }}
            />
            <TextInput
              label="Tagline"
              value={heroTagline}
              onChange={(v) => { setHeroTagline(v); markChanged(); }}
              placeholder="Enter tagline text"
            />
          </Section>
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Section title="Welcome Section" description="Introduction text below the hero">
            <TextInput
              label="Subtitle"
              value={welcomeSubtitle}
              onChange={(v) => { setWelcomeSubtitle(v); markChanged(); }}
            />
            <TextInput
              label="Title"
              value={welcomeTitle}
              onChange={(v) => { setWelcomeTitle(v); markChanged(); }}
            />
            <TextInput
              label="Description"
              value={welcomeText}
              onChange={(v) => { setWelcomeText(v); markChanged(); }}
              multiline
              rows={4}
            />
          </Section>
        </motion.div>

        {/* Experience Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section title="Experience Section" description="Your Vision, Our Space content">
            <TextInput
              label="Subtitle"
              value={experienceSubtitle}
              onChange={(v) => { setExperienceSubtitle(v); markChanged(); }}
            />
            <TextInput
              label="Title"
              value={experienceTitle}
              onChange={(v) => { setExperienceTitle(v); markChanged(); }}
            />
            <TextInput
              label="Description"
              value={experienceText}
              onChange={(v) => { setExperienceText(v); markChanged(); }}
              multiline
              rows={5}
            />
          </Section>
        </motion.div>

        {/* Studios Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Section title="Our Studios Section" description="Studio cards displayed on homepage">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <TextInput
                label="Section Subtitle"
                value={studiosSubtitle}
                onChange={(v) => { setStudiosSubtitle(v); markChanged(); }}
              />
              <TextInput
                label="Section Title"
                value={studiosTitle}
                onChange={(v) => { setStudiosTitle(v); markChanged(); }}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4 bg-black/5 p-4">
                <h4 className="font-medium text-black">E16 Set Card</h4>
                <ImageUpload
                  label="Image"
                  value={studio1Image}
                  onChange={(v) => { setStudio1Image(v); markChanged(); }}
                />
                <TextInput
                  label="Title"
                  value={studio1Title}
                  onChange={(v) => { setStudio1Title(v); markChanged(); }}
                />
              </div>

              <div className="space-y-4 bg-black/5 p-4">
                <h4 className="font-medium text-black">E20 Set Card</h4>
                <ImageUpload
                  label="Image"
                  value={studio2Image}
                  onChange={(v) => { setStudio2Image(v); markChanged(); }}
                />
                <TextInput
                  label="Title"
                  value={studio2Title}
                  onChange={(v) => { setStudio2Title(v); markChanged(); }}
                />
              </div>

              <div className="space-y-4 bg-black/5 p-4">
                <h4 className="font-medium text-black">LUX Set Card</h4>
                <ImageUpload
                  label="Image"
                  value={studio3Image}
                  onChange={(v) => { setStudio3Image(v); markChanged(); }}
                />
                <TextInput
                  label="Title"
                  value={studio3Title}
                  onChange={(v) => { setStudio3Title(v); markChanged(); }}
                />
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Clients Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Section title="Our Clients Section" description="Client showcase section">
            <TextInput
              label="Subtitle"
              value={clientsSubtitle}
              onChange={(v) => { setClientsSubtitle(v); markChanged(); }}
            />
            <TextInput
              label="Title"
              value={clientsTitle}
              onChange={(v) => { setClientsTitle(v); markChanged(); }}
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
