"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload?: (file: File) => Promise<string | null>;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  onUpload,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload if handler provided
    if (onUpload) {
      setIsUploading(true);
      try {
        const url = await onUpload(file);
        if (url) {
          onChange(url);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setPreview(null);
  };

  const clearImage = () => {
    onChange('');
    setPreview(null);
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
          <Image
            src={currentImage}
            alt="Preview"
            fill
            className="object-cover"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload area */}
      {!currentImage && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-black/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black/40 transition-colors"
        >
          <ImageIcon className="w-12 h-12 text-black/30 mb-3" />
          <p className="text-sm text-black/60">Click to upload an image</p>
          <p className="text-xs text-black/40 mt-1">or drag and drop</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={handleUrlChange}
          placeholder="Or enter image URL..."
          className="flex-1 px-4 py-2 bg-white border border-black/20 text-black text-sm focus:outline-none focus:border-black transition-colors"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors disabled:opacity-50"
        >
          {isUploading ? 'UPLOADING...' : 'UPLOAD'}
        </button>
      </div>
    </div>
  );
}
