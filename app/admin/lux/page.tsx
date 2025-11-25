"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import PricingEditor from "@/components/admin/PricingEditor";

export default function LuxEditor() {
  // Hero section
  const [heroImage, setHeroImage] = useState("https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=1920");

  // Studio info
  const [studioSubtitle, setStudioSubtitle] = useState("THE STUDIO");
  const [studioTitle, setStudioTitle] = useState("LUX SET");
  const [studioDescription, setStudioDescription] = useState(
    "Our premium luxury studio experience. Perfect for high-end productions, brand campaigns, and exclusive content creation."
  );

  // Features
  const [features, setFeatures] = useState([
    { title: "Premium Setup", description: "Luxury furnishings and premium finishes" },
    { title: "1 - 4 Camera Setup", description: "Professional multi-angle filming capabilities" },
    { title: "Customisable Set/Backdrop", description: "Fully customizable luxury environment" },
  ]);

  // Pricing
  const [pricingImage, setPricingImage] = useState("https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=1920");
  const [pricingPlans, setPricingPlans] = useState([
    { title: "STANDARD", price: "£100", duration: "per hour (Min 2 Hours)", details: ["2x BMPCC 6K Cameras", "Comes with Setup Engineer", "Professional Lighting", "Up to 4 Mics", "Files sent in 24hours"] },
    { title: "HALF DAY", price: "£350", duration: "(4 Hours)", details: ["2x BMPCC 6K Cameras", "Comes with Setup Engineer", "Professional Lighting", "Up to 4 Mics", "Files sent in 24hours"] },
    { title: "FULL DAY", price: "£600", duration: "(8 Hours)", details: ["2x BMPCC 6K Cameras", "Comes with Setup Engineer", "Professional Lighting", "Up to 4 Mics", "Files sent in 48hours"] },
  ]);

  // Gallery
  const [galleryImages, setGalleryImages] = useState([
    "https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
    "https://images.pexels.com/photos/6957097/pexels-photo-6957097.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
    "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
  ]);

  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    console.log("Saving LUX content...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasChanges(false);
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
            <h1 className="text-4xl font-light text-black">LUX Set Page</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/studios/lux"
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
                <div key={index} className="bg-black/5 p-4 space-y-4">
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
                <div key={index} className="relative">
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
