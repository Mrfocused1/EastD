"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import PricingEditor from "@/components/admin/PricingEditor";
import { supabase } from "@/lib/supabase";

export default function E16Editor() {
  const [isLoading, setIsLoading] = useState(true);

  // Hero section
  const [heroImage, setHeroImage] = useState("/BLACKPR%20X%20WANNI115.JPG");

  // Studio info
  const [studioSubtitle, setStudioSubtitle] = useState("THE STUDIO");
  const [studioTitle, setStudioTitle] = useState("Studio Dock One");
  const [studioDescription, setStudioDescription] = useState(
    "A vintage leather sofa in a lush, deep green color creates an ambiance reminiscent of an exclusive lounge. The large sofa can accommodate up to four guests. Enhance the atmosphere with your choice of art décor or vintage industrial-inspired lighting."
  );

  // Features
  const [features, setFeatures] = useState([
    { title: "1 - 6 Layout Possible", description: "Flexible seating arrangements for any setup" },
    { title: "1 - 4 Camera Setup", description: "Professional multi-angle filming capabilities" },
    { title: "Customisable Set/Backdrop", description: "Tailor the environment to your vision" },
  ]);

  // Pricing
  const [pricingImage, setPricingImage] = useState("/BLACKPR%20X%20WANNI133.JPG");
  const [pricingPlans, setPricingPlans] = useState([
    { title: "STANDARD", price: "£140", duration: "(Min 2 Hours)", details: ["£70/hr", "Comes with Setup Engineer", "2x BMPCC 6K Cameras", "Professional Lighting", "Up to 4 Mics", "Files sent in 24hours"] },
    { title: "HALF DAY", price: "£220", duration: "(4 Hours)", details: ["Comes with Setup Engineer", "2x BMPCC 6K Cameras", "Professional Lighting", "Up to 4 Mics", "Files sent in 24hours"] },
    { title: "FULL DAY", price: "£450", duration: "(8 Hours)", details: ["Comes with Setup Engineer", "2x BMPCC 6K Cameras", "Professional Lighting", "Up to 4 Mics", "Files sent in 48hours"] },
  ]);

  // Gallery
  const [galleryImages, setGalleryImages] = useState([
    "/gallery/BLACKPR%20X%20WANNI111.JPG",
    "/gallery/BLACKPR%20X%20WANNI116.JPG",
    "/gallery/BLACKPR%20X%20WANNI117.JPG",
    "/gallery/BLACKPR%20X%20WANNI122.JPG",
    "/gallery/BLACKPR%20X%20WANNI128.JPG",
  ]);

  const [hasChanges, setHasChanges] = useState(false);

  // Load content from Supabase on mount
  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'studio-dock-one');

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

            // Studio info
            if (section === 'studio' && key === 'subtitle') setStudioSubtitle(value);
            if (section === 'studio' && key === 'title') setStudioTitle(value);
            if (section === 'studio' && key === 'description') setStudioDescription(value);

            // Features
            if (section === 'features' && key === 'items') {
              try { setFeatures(JSON.parse(value)); } catch (e) { console.error('Error parsing features:', e); }
            }

            // Pricing
            if (section === 'pricing' && key === 'image') setPricingImage(value);
            if (section === 'pricing' && key === 'plans') {
              try { setPricingPlans(JSON.parse(value)); } catch (e) { console.error('Error parsing pricing:', e); }
            }

            // Gallery
            if (section === 'gallery' && key === 'images') {
              try { setGalleryImages(JSON.parse(value)); } catch (e) { console.error('Error parsing gallery:', e); }
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
      { page: 'studio-dock-one', section: 'hero', key: 'image', value: heroImage, type: 'image' },
      // Studio info
      { page: 'studio-dock-one', section: 'studio', key: 'subtitle', value: studioSubtitle, type: 'text' },
      { page: 'studio-dock-one', section: 'studio', key: 'title', value: studioTitle, type: 'text' },
      { page: 'studio-dock-one', section: 'studio', key: 'description', value: studioDescription, type: 'text' },
      // Features
      { page: 'studio-dock-one', section: 'features', key: 'items', value: JSON.stringify(features), type: 'array' },
      // Pricing
      { page: 'studio-dock-one', section: 'pricing', key: 'image', value: pricingImage, type: 'image' },
      { page: 'studio-dock-one', section: 'pricing', key: 'plans', value: JSON.stringify(pricingPlans), type: 'array' },
      // Gallery
      { page: 'studio-dock-one', section: 'gallery', key: 'images', value: JSON.stringify(galleryImages), type: 'array' },
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

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    const newFeatures = [...features];
    newFeatures[index][field] = value;
    setFeatures(newFeatures);
    markChanged();
  };

  const updateGalleryImage = (index: number, value: string) => {
    const newImages = [...galleryImages];
    newImages[index] = value;
    setGalleryImages(newImages);
    markChanged();
  };

  const addGalleryImage = () => {
    setGalleryImages([...galleryImages, ""]);
    markChanged();
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
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
            <h1 className="text-4xl font-light text-black">Studio Dock One Page</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/studios/studio-dock-one"
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
          <Section title="Hero Section" description="Main banner image">
            <ImageUpload
              label="Hero Background Image"
              value={heroImage}
              onChange={(v) => { setHeroImage(v); markChanged(); }}
            />
          </Section>
        </motion.div>

        {/* Studio Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Section title="Studio Information" description="Main content about the studio">
            <div className="grid md:grid-cols-2 gap-6">
              <TextInput
                label="Subtitle"
                value={studioSubtitle}
                onChange={(v) => { setStudioSubtitle(v); markChanged(); }}
              />
              <TextInput
                label="Title"
                value={studioTitle}
                onChange={(v) => { setStudioTitle(v); markChanged(); }}
              />
            </div>
            <TextInput
              label="Description"
              value={studioDescription}
              onChange={(v) => { setStudioDescription(v); markChanged(); }}
              multiline
              rows={4}
            />
          </Section>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section title="Features" description="Studio feature cards">
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={`feature-${feature.title}-${index}`} className="bg-black/5 p-4 space-y-4">
                  <TextInput
                    label="Feature Title"
                    value={feature.title}
                    onChange={(v) => updateFeature(index, 'title', v)}
                  />
                  <TextInput
                    label="Description"
                    value={feature.description}
                    onChange={(v) => updateFeature(index, 'description', v)}
                  />
                </div>
              ))}
            </div>
          </Section>
        </motion.div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Section title="Pricing Section" description="Pricing plans and background">
            <ImageUpload
              label="Pricing Section Background"
              value={pricingImage}
              onChange={(v) => { setPricingImage(v); markChanged(); }}
            />
            <div className="mt-6">
              <label className="block text-sm tracking-wide text-black/70 uppercase mb-4">
                Pricing Plans
              </label>
              <PricingEditor
                plans={pricingPlans}
                onChange={(plans) => { setPricingPlans(plans); markChanged(); }}
              />
            </div>
          </Section>
        </motion.div>

        {/* Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Section title="Gallery" description="Gallery images">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image, index) => (
                <div key={`gallery-image-${index}`} className="relative">
                  <ImageUpload
                    label={`Image ${index + 1}`}
                    value={image}
                    onChange={(v) => updateGalleryImage(index, v)}
                  />
                  <button
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-0 right-0 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addGalleryImage}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 border border-dashed border-black/30 text-black/60 text-sm tracking-widest hover:border-black hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              ADD IMAGE
            </button>
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
