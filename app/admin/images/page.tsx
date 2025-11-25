"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, Trash2, Search, Grid, List, Copy, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock data for existing images
const mockImages = [
  { id: 1, name: "BLACKPR X WANNI115.JPG", path: "/BLACKPR X WANNI115.JPG", size: "2.4 MB", usedIn: ["E16 Hero"] },
  { id: 2, name: "BLACKPR X WANNI121.JPG", path: "/BLACKPR X WANNI121.JPG", size: "1.8 MB", usedIn: ["Homepage - E16 Card"] },
  { id: 3, name: "BLACKPR X WANNI133.JPG", path: "/BLACKPR X WANNI133.JPG", size: "2.1 MB", usedIn: ["E16 Pricing"] },
  { id: 4, name: "BLACKPR X WANNI171.JPG", path: "/BLACKPR X WANNI171.JPG", size: "1.9 MB", usedIn: ["Homepage Hero", "E20 Hero"] },
  { id: 5, name: "BLACKPR X WANNI174.JPG", path: "/BLACKPR X WANNI174.JPG", size: "2.2 MB", usedIn: ["Homepage - E20 Card"] },
  { id: 6, name: "10.png", path: "/10.png", size: "156 KB", usedIn: ["Logo"] },
];

export default function ImagesPage() {
  const [images, setImages] = useState(mockImages);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filteredImages = images.filter(img =>
    img.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyPath = (id: number, path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // TODO: Handle file upload to Supabase
    const files = Array.from(e.dataTransfer.files);
    console.log("Files to upload:", files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // TODO: Handle file upload to Supabase
      console.log("Files to upload:", Array.from(files));
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
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
            <p className="text-sm tracking-[0.3em] text-black/60 mb-2">MEDIA LIBRARY</p>
            <h1 className="text-4xl font-light text-black">Images</h1>
          </div>
          <label className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm tracking-widest hover:bg-black/80 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            UPLOAD
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`
          mb-8 border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${isDragging ? 'border-black bg-black/5' : 'border-black/20'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-black/30 mb-4" />
        <p className="text-lg text-black/60 mb-2">Drag and drop images here</p>
        <p className="text-sm text-black/40">or click the upload button above</p>
      </motion.div>

      {/* Search and View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/20 text-black focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 border transition-colors ${viewMode === "grid" ? 'bg-black text-white border-black' : 'border-black/20 text-black/60 hover:border-black'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-3 border transition-colors ${viewMode === "list" ? 'bg-black text-white border-black' : 'border-black/20 text-black/60 hover:border-black'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Images */}
      {viewMode === "grid" ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="bg-white border border-black/10 overflow-hidden group"
            >
              <div className="relative h-48 bg-black/5">
                <Image
                  src={image.path}
                  alt={image.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => copyPath(image.id, image.path)}
                    className="p-2 bg-white text-black rounded-full mr-2 hover:bg-black hover:text-white transition-colors"
                  >
                    {copiedId === image.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button className="p-2 bg-white text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm font-medium text-black truncate">{image.name}</p>
                <p className="text-xs text-black/60 mt-1">{image.size}</p>
                {image.usedIn.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {image.usedIn.map((location, i) => (
                      <span key={i} className="text-xs bg-black/5 px-2 py-1 text-black/60">
                        {location}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white border border-black/10 overflow-hidden"
        >
          <table className="w-full">
            <thead className="bg-black/5">
              <tr>
                <th className="text-left text-sm font-medium text-black/70 px-6 py-4 tracking-wide uppercase">Preview</th>
                <th className="text-left text-sm font-medium text-black/70 px-6 py-4 tracking-wide uppercase">Name</th>
                <th className="text-left text-sm font-medium text-black/70 px-6 py-4 tracking-wide uppercase">Size</th>
                <th className="text-left text-sm font-medium text-black/70 px-6 py-4 tracking-wide uppercase">Used In</th>
                <th className="text-right text-sm font-medium text-black/70 px-6 py-4 tracking-wide uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredImages.map((image) => (
                <tr key={image.id} className="border-t border-black/10 hover:bg-black/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-16 bg-black/5 overflow-hidden">
                      <Image
                        src={image.path}
                        alt={image.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-black">{image.name}</p>
                    <p className="text-xs text-black/40 mt-1">{image.path}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-black/60">{image.size}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {image.usedIn.map((location, i) => (
                        <span key={i} className="text-xs bg-black/5 px-2 py-1 text-black/60">
                          {location}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => copyPath(image.id, image.path)}
                        className="p-2 text-black/40 hover:text-black transition-colors"
                      >
                        {copiedId === image.id ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button className="p-2 text-black/40 hover:text-red-600 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {filteredImages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-black/60">No images found</p>
        </div>
      )}
    </div>
  );
}
