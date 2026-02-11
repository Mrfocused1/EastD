"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/uploadImage";
import FocalPointPicker, { FocalPoints, DEFAULT_FOCAL_POINTS } from "./FocalPointPicker";

export interface ImageWithFocalPoints {
  url: string;
  focalPoints: FocalPoints;
}

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  focalPoints?: FocalPoints;
  onFocalPointsChange?: (focalPoints: FocalPoints) => void;
  showFocalPointPicker?: boolean;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  focalPoints = DEFAULT_FOCAL_POINTS,
  onFocalPointsChange,
  showFocalPointPicker = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage with optimization and auto-deletion of old image
    setIsUploading(true);
    try {
      const url = await uploadImage(file, {
        oldImageUrl: value, // Pass current image URL so it gets deleted after upload
      });
      if (url) {
        onChange(url);
        setPreview(null); // Clear preview, use actual URL
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setPreview(null);
    setError(null);
  };

  const clearImage = () => {
    onChange('');
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentImage = preview || value;

  return (
    <div className="space-y-3">
      <label className="block text-sm tracking-wide text-black/70 uppercase">
        {label}
      </label>

      {/* Preview */}
      {currentImage && (
        <div className="relative w-full h-48 bg-black/5 rounded-lg overflow-hidden">
          {/* Use img tag for blob URLs and data URLs, Next Image for regular URLs */}
          {currentImage.startsWith('data:') || currentImage.startsWith('blob:') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={currentImage}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
          <button
            onClick={clearImage}
            disabled={isUploading}
            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload area */}
      {!currentImage && (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed border-black/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black/40 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-black/30 mb-3 animate-spin" />
              <p className="text-sm text-black/60">Uploading...</p>
            </>
          ) : (
            <>
              <ImageIcon className="w-12 h-12 text-black/30 mb-3" />
              <p className="text-sm text-black/60">Click to upload an image</p>
              <p className="text-xs text-black/40 mt-1">or drag and drop</p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={handleUrlChange}
          placeholder="Or enter image URL..."
          className="flex-1 px-4 py-2 bg-white border border-black/20 text-black text-sm focus:outline-none focus:border-black transition-colors"
          disabled={isUploading}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {isUploading ? 'UPLOADING...' : 'UPLOAD'}
        </button>
      </div>

      {/* Focal Point Picker */}
      {showFocalPointPicker && currentImage && onFocalPointsChange && (
        <FocalPointPicker
          imageUrl={currentImage}
          focalPoints={focalPoints}
          onChange={onFocalPointsChange}
        />
      )}
    </div>
  );
}

export { DEFAULT_FOCAL_POINTS };
export type { FocalPoints };
