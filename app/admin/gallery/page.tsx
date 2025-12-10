"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, ArrowLeft, Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import { supabase } from "@/lib/supabase";

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: string;
}

const defaultImages: GalleryImage[] = [
  { id: "1", url: "/BLACKPR X WANNI115.JPG", title: "E16 Studio", category: "E16 SET" },
  { id: "2", url: "/BLACKPR X WANNI121.JPG", title: "E16 Studio", category: "E16 SET" },
  { id: "3", url: "/BLACKPR X WANNI171.JPG", title: "E20 Studio", category: "E20 SET" },
  { id: "4", url: "/BLACKPR X WANNI174.JPG", title: "E20 Studio", category: "E20 SET" },
];

export default function GalleryEditor() {
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<GalleryImage[]>(defaultImages);
  const [hasChanges, setHasChanges] = useState(false);

  // Load content from Supabase on mount
  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('value')
          .eq('page', 'gallery')
          .eq('section', 'images')
          .eq('key', 'items')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading gallery:', error);
          setIsLoading(false);
          return;
        }

        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setImages(parsed);
            }
          } catch (e) {
            console.error('Error parsing gallery:', e);
          }
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, []);

  const updateImage = useCallback((index: number, field: keyof GalleryImage, value: string) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = { ...newImages[index], [field]: value };
      return newImages;
    });
    setHasChanges(true);
  }, []);

  const addImage = useCallback(() => {
    const newId = `img-${Date.now()}`;
    setImages(prev => [...prev, { id: newId, url: "", title: "", category: "E16 SET" }]);
    setHasChanges(true);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  }, []);

  const moveImage = useCallback((fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= images.length) return;

    setImages(prev => {
      const newImages = [...prev];
      [newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]];
      return newImages;
    });
    setHasChanges(true);
  }, [images.length]);

  async function handleSave() {
    try {
      // Upsert gallery images
      const { error } = await supabase
        .from('site_content')
        .upsert({
          page: 'gallery',
          section: 'images',
          key: 'items',
          value: JSON.stringify(images)
        }, {
          onConflict: 'page,section,key'
        });

      if (error) {
        console.error('Error saving gallery:', error);
        alert('Failed to save gallery. Please try again.');
        return;
      }

      setHasChanges(false);
      alert('Gallery saved successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to save gallery. Please try again.');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
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
            <p className="text-sm tracking-[0.3em] text-black/60 mb-2">PAGE EDITOR</p>
            <h1 className="text-4xl font-light text-black">Gallery</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/gallery"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 border border-black/20 text-sm tracking-widest hover:border-black transition-colors"
            >
              <Eye className="w-4 h-4" />
              PREVIEW
            </Link>
            <SaveButton onSave={handleSave} hasChanges={hasChanges} />
          </div>
        </div>
      </motion.div>

      {/* Gallery Images Section */}
      <Section
        title="Gallery Images"
        description="Manage the images displayed in the gallery. Add, remove, or reorder images."
      >
        <div className="space-y-6">
          {images.map((image, index) => (
            <div key={image.id} className="border border-black/10 p-6 bg-white">
              <div className="flex items-start gap-4">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-1 pt-2">
                  <button
                    onClick={() => moveImage(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-black/40 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <GripVertical className="w-4 h-4 text-black/20" />
                  <button
                    onClick={() => moveImage(index, 'down')}
                    disabled={index === images.length - 1}
                    className="p-1 text-black/40 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Image Preview */}
                <div className="relative w-32 h-40 bg-black/5 overflow-hidden flex-shrink-0">
                  {image.url ? (
                    <Image
                      src={image.url}
                      alt={image.title || "Gallery image"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-black/30">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput
                      label="Title"
                      value={image.title}
                      onChange={(value) => updateImage(index, 'title', value)}
                      placeholder="Image title"
                    />
                    <div>
                      <label className="block text-sm font-medium text-black/70 mb-2 tracking-wide">
                        Category
                      </label>
                      <select
                        value={image.category}
                        onChange={(e) => updateImage(index, 'category', e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-black/20 text-black focus:outline-none focus:border-black transition-colors"
                      >
                        <option value="E16 SET">E16 SET</option>
                        <option value="E20 SET">E20 SET</option>
                        <option value="LUX SET">LUX SET</option>
                      </select>
                    </div>
                  </div>
                  <ImageUpload
                    label="Image URL"
                    value={image.url}
                    onChange={(value) => updateImage(index, 'url', value)}
                  />
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeImage(index)}
                  className="p-2 text-black/40 hover:text-red-600 transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Image Button */}
          <button
            onClick={addImage}
            className="w-full py-4 border-2 border-dashed border-black/20 text-black/60 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Image
          </button>
        </div>
      </Section>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-8 p-6 bg-black/5 border border-black/10"
      >
        <h3 className="text-sm font-medium text-black/70 tracking-wide mb-3">TIPS</h3>
        <ul className="text-sm text-black/60 space-y-2">
          <li>• Images are displayed in the order shown here</li>
          <li>• Use the arrows to reorder images</li>
          <li>• Categories are used for filtering on the gallery page</li>
          <li>• Recommended image size: 1200x1500px (4:5 aspect ratio)</li>
          <li>• Upload images to the Media Library first, then paste the URL here</li>
        </ul>
      </motion.div>
    </div>
  );
}
