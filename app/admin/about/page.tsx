"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import { supabase } from "@/lib/supabase";

export default function AboutEditor() {
  const [isLoading, setIsLoading] = useState(true);

  // Hero section
  const [heroImage, setHeroImage] = useState("https://images.pexels.com/photos/6794963/pexels-photo-6794963.jpeg?auto=compress&cs=tinysrgb&w=1920");
  const [heroSubtitle, setHeroSubtitle] = useState("EASTDOC STUDIOS");
  const [heroTitle, setHeroTitle] = useState("ABOUT US");

  // Main content
  const [aboutTitle, setAboutTitle] = useState("Our Story");
  const [aboutText, setAboutText] = useState(
    "East Dock Studios was founded with a vision to provide premium studio spaces for creatives. Our state-of-the-art facilities combined with expert support make us the perfect partner for your next production."
  );

  // Mission
  const [missionTitle, setMissionTitle] = useState("Our Mission");
  const [missionText, setMissionText] = useState(
    "To empower creators by providing exceptional studio spaces and professional support that bring their visions to life."
  );

  // Values
  const [values, setValues] = useState([
    { title: "Quality", description: "We never compromise on the quality of our spaces and equipment." },
    { title: "Creativity", description: "We foster an environment where creativity can flourish." },
    { title: "Service", description: "Our team is dedicated to providing exceptional customer service." },
  ]);

  const [hasChanges, setHasChanges] = useState(false);

  // Load content from Supabase on mount
  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'about');

        if (error) {
          console.error('Error loading content:', error);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          data.forEach((item: { section: string; key: string; value: string }) => {
            const { section, key, value } = item;

            // Hero section
            if (section === 'hero' && key === 'image') setHeroImage(value);
            if (section === 'hero' && key === 'subtitle') setHeroSubtitle(value);
            if (section === 'hero' && key === 'title') setHeroTitle(value);

            // About section
            if (section === 'about' && key === 'title') setAboutTitle(value);
            if (section === 'about' && key === 'text') setAboutText(value);

            // Mission section
            if (section === 'mission' && key === 'title') setMissionTitle(value);
            if (section === 'mission' && key === 'text') setMissionText(value);

            // Values section
            if (section === 'values' && key === 'items') {
              try {
                setValues(JSON.parse(value));
              } catch (e) {
                console.error('Error parsing values:', e);
              }
            }
          });
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, []);

  const handleSave = async () => {
    const contentToSave = [
      // Hero
      { page: 'about', section: 'hero', key: 'image', value: heroImage, type: 'image' },
      { page: 'about', section: 'hero', key: 'subtitle', value: heroSubtitle, type: 'text' },
      { page: 'about', section: 'hero', key: 'title', value: heroTitle, type: 'text' },
      // About
      { page: 'about', section: 'about', key: 'title', value: aboutTitle, type: 'text' },
      { page: 'about', section: 'about', key: 'text', value: aboutText, type: 'text' },
      // Mission
      { page: 'about', section: 'mission', key: 'title', value: missionTitle, type: 'text' },
      { page: 'about', section: 'mission', key: 'text', value: missionText, type: 'text' },
      // Values
      { page: 'about', section: 'values', key: 'items', value: JSON.stringify(values), type: 'array' },
    ];

    try {
      for (const item of contentToSave) {
        const { error } = await supabase
          .from('site_content')
          .upsert(
            {
              ...item,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'page,section,key',
            }
          );

        if (error) {
          console.error('Error saving:', error);
          throw error;
        }
      }
      setHasChanges(false);
    } catch (err) {
      console.error('Save failed:', err);
      throw err;
    }
  };

  const markChanged = () => setHasChanges(true);

  const updateValue = (index: number, field: 'title' | 'description', value: string) => {
    const newValues = [...values];
    newValues[index][field] = value;
    setValues(newValues);
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
            <h1 className="text-4xl font-light text-black">About Page</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/about"
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
            <div className="grid md:grid-cols-2 gap-6">
              <TextInput
                label="Subtitle"
                value={heroSubtitle}
                onChange={(v) => { setHeroSubtitle(v); markChanged(); }}
              />
              <TextInput
                label="Title"
                value={heroTitle}
                onChange={(v) => { setHeroTitle(v); markChanged(); }}
              />
            </div>
          </Section>
        </motion.div>

        {/* About Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Section title="About Section" description="Main about content">
            <TextInput
              label="Section Title"
              value={aboutTitle}
              onChange={(v) => { setAboutTitle(v); markChanged(); }}
            />
            <TextInput
              label="Content"
              value={aboutText}
              onChange={(v) => { setAboutText(v); markChanged(); }}
              multiline
              rows={5}
            />
          </Section>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section title="Mission Section" description="Company mission statement">
            <TextInput
              label="Section Title"
              value={missionTitle}
              onChange={(v) => { setMissionTitle(v); markChanged(); }}
            />
            <TextInput
              label="Mission Statement"
              value={missionText}
              onChange={(v) => { setMissionText(v); markChanged(); }}
              multiline
              rows={4}
            />
          </Section>
        </motion.div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Section title="Values" description="Company values">
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-black/5 p-4 space-y-4">
                  <TextInput
                    label="Value Title"
                    value={value.title}
                    onChange={(v) => updateValue(index, 'title', v)}
                  />
                  <TextInput
                    label="Description"
                    value={value.description}
                    onChange={(v) => updateValue(index, 'description', v)}
                    multiline
                    rows={3}
                  />
                </div>
              ))}
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
