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

export default function E20Editor() {
  const [isLoading, setIsLoading] = useState(true);

  // Hero section
  const [heroImage, setHeroImage] = useState("/BLACKPR%20X%20WANNI171.JPG");

  // Studio info
  const [studioSubtitle, setStudioSubtitle] = useState("THE STUDIO");
  const [studioTitle, setStudioTitle] = useState("E20 SET");
  const [studioDescription, setStudioDescription] = useState(
    "Spacious modern interior with staircase and leather sofas, perfect for creating cinematic content. This versatile space offers the ideal backdrop for sophisticated productions."
  );

  // Features
  const [features, setFeatures] = useState([
    { title: "1 - 4 Layout Possible", description: "WHITE SOFA AVAILABLE" },
    { title: "1 - 4 Camera Setup", description: "Professional multi-angle filming capabilities" },
    { title: "Customisable Set/Backdrop", description: "Create your perfect aesthetic" },
  ]);

  // Inclusive features
  const [inclusiveFeatures, setInclusiveFeatures] = useState([
    { title: "Free Facilities", description: "Access to our workspace area and Wi-Fi, perfect for your PA or Producer to work whilst you film." },
    { title: "High End Equipment", description: "Access to our equipment library, with some of the best in industry gear available as well as the experts to use them." },
    { title: "Central Location", description: "Located in the heart of East London, only 3 minutes walk from the station, the perfect location for all guests traveling." },
    { title: "Customisable Sets", description: "Access to a host of different chairs, tables and background props. Giving you the freedom to make the set as unique as you." },
  ]);

  // Pricing
  const [pricingImage, setPricingImage] = useState("https://images.pexels.com/photos/6957097/pexels-photo-6957097.jpeg?auto=compress&cs=tinysrgb&w=1920");
  const [pricingPlans, setPricingPlans] = useState([
    { title: "STANDARD", price: "£75", duration: "per hour (Min 2 Hours)", details: ["2x Blackmagic 6K Cameras", "Comes with Setup Engineer", "Professional Lighting", "Upto 4 Mics", "Files sent in 24hours"] },
    { title: "HALF DAY", price: "£250", duration: "", details: ["2x Blackmagic 6K Cameras", "Comes with Setup Engineer", "Professional Lighting", "Upto 4 Mics", "Files sent in 24hours"] },
    { title: "FULL DAY", price: "£450", duration: "", details: ["2x Blackmagic 6K Cameras", "Comes with Setup Engineer", "Professional Lighting", "Upto 4 Mics", "Files sent in 48hours"] },
  ]);

  // Gallery
  const [galleryImages, setGalleryImages] = useState([
    "/Gallery%202/BLACKPR%20X%20WANNI161.JPG",
    "/Gallery%202/BLACKPR%20X%20WANNI163.JPG",
    "/Gallery%202/BLACKPR%20X%20WANNI164.JPG",
    "/Gallery%202/BLACKPR%20X%20WANNI166.JPG",
    "/Gallery%202/BLACKPR%20X%20WANNI168.JPG",
  ]);

  const [hasChanges, setHasChanges] = useState(false);

  // Load content from Supabase on mount
  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'e20');

        if (error) {
          console.error('Error loading content:', error);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          data.forEach((item: { section: string; key: string; value: string }) => {
            const { section, key, value } = item;

            if (section === 'hero' && key === 'image') setHeroImage(value);
            if (section === 'studio' && key === 'subtitle') setStudioSubtitle(value);
            if (section === 'studio' && key === 'title') setStudioTitle(value);
            if (section === 'studio' && key === 'description') setStudioDescription(value);
            if (section === 'features' && key === 'items') {
              try { setFeatures(JSON.parse(value)); } catch (e) { console.error('Error parsing features:', e); }
            }
            if (section === 'inclusive' && key === 'items') {
              try { setInclusiveFeatures(JSON.parse(value)); } catch (e) { console.error('Error parsing inclusive:', e); }
            }
            if (section === 'pricing' && key === 'image') setPricingImage(value);
            if (section === 'pricing' && key === 'plans') {
              try { setPricingPlans(JSON.parse(value)); } catch (e) { console.error('Error parsing pricing:', e); }
            }
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
      { page: 'e20', section: 'hero', key: 'image', value: heroImage, type: 'image' },
      { page: 'e20', section: 'studio', key: 'subtitle', value: studioSubtitle, type: 'text' },
      { page: 'e20', section: 'studio', key: 'title', value: studioTitle, type: 'text' },
      { page: 'e20', section: 'studio', key: 'description', value: studioDescription, type: 'text' },
      { page: 'e20', section: 'features', key: 'items', value: JSON.stringify(features), type: 'array' },
      { page: 'e20', section: 'inclusive', key: 'items', value: JSON.stringify(inclusiveFeatures), type: 'array' },
      { page: 'e20', section: 'pricing', key: 'image', value: pricingImage, type: 'image' },
      { page: 'e20', section: 'pricing', key: 'plans', value: JSON.stringify(pricingPlans), type: 'array' },
      { page: 'e20', section: 'gallery', key: 'images', value: JSON.stringify(galleryImages), type: 'array' },
    ];

    try {
      for (const item of contentToSave) {
        const { error } = await supabase
          .from('site_content')
          .upsert(
            { ...item, updated_at: new Date().toISOString() },
            { onConflict: 'page,section,key' }
          );
        if (error) throw error;
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

  const updateInclusiveFeature = (index: number, field: 'title' | 'description', value: string) => {
    const newFeatures = [...inclusiveFeatures];
    newFeatures[index][field] = value;
    setInclusiveFeatures(newFeatures);
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
            <h1 className="text-4xl font-light text-black">E20 Set Page</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/studios/e20"
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Section title="Hero Section" description="Main banner image">
            <ImageUpload label="Hero Background Image" value={heroImage} onChange={(v) => { setHeroImage(v); markChanged(); }} />
          </Section>
        </motion.div>

        {/* Studio Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          <Section title="Studio Information" description="Main content about the studio">
            <div className="grid md:grid-cols-2 gap-6">
              <TextInput label="Subtitle" value={studioSubtitle} onChange={(v) => { setStudioSubtitle(v); markChanged(); }} />
              <TextInput label="Title" value={studioTitle} onChange={(v) => { setStudioTitle(v); markChanged(); }} />
            </div>
            <TextInput label="Description" value={studioDescription} onChange={(v) => { setStudioDescription(v); markChanged(); }} multiline rows={4} />
          </Section>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Section title="Features" description="Studio feature cards">
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-black/5 p-4 space-y-4">
                  <TextInput label="Feature Title" value={feature.title} onChange={(v) => updateFeature(index, 'title', v)} />
                  <TextInput label="Description" value={feature.description} onChange={(v) => updateFeature(index, 'description', v)} />
                </div>
              ))}
            </div>
          </Section>
        </motion.div>

        {/* Inclusive Features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.22 }}>
          <Section title="All Inclusive Features" description="The inclusive features section">
            <div className="grid md:grid-cols-2 gap-6">
              {inclusiveFeatures.map((feature, index) => (
                <div key={index} className="bg-black/5 p-4 space-y-4">
                  <TextInput label="Feature Title" value={feature.title} onChange={(v) => updateInclusiveFeature(index, 'title', v)} />
                  <TextInput label="Description" value={feature.description} onChange={(v) => updateInclusiveFeature(index, 'description', v)} multiline rows={3} />
                </div>
              ))}
            </div>
          </Section>
        </motion.div>

        {/* Pricing */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}>
          <Section title="Pricing Section" description="Pricing plans and background">
            <ImageUpload label="Pricing Section Background" value={pricingImage} onChange={(v) => { setPricingImage(v); markChanged(); }} />
            <div className="mt-6">
              <label className="block text-sm tracking-wide text-black/70 uppercase mb-4">Pricing Plans</label>
              <PricingEditor plans={pricingPlans} onChange={(plans) => { setPricingPlans(plans); markChanged(); }} />
            </div>
          </Section>
        </motion.div>

        {/* Gallery */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <Section title="Gallery" description="Gallery images">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image, index) => (
                <div key={index} className="relative">
                  <ImageUpload label={`Image ${index + 1}`} value={image} onChange={(v) => updateGalleryImage(index, v)} />
                  <button onClick={() => removeGalleryImage(index)} className="absolute top-0 right-0 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addGalleryImage} className="mt-4 inline-flex items-center gap-2 px-6 py-3 border border-dashed border-black/30 text-black/60 text-sm tracking-widest hover:border-black hover:text-black transition-colors">
              <Plus className="w-4 h-4" />
              ADD IMAGE
            </button>
          </Section>
        </motion.div>
      </div>

      {hasChanges && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-8 right-8">
          <SaveButton onSave={handleSave} hasChanges={hasChanges} />
        </motion.div>
      )}
    </div>
  );
}
