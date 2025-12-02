"use client";

import { useState, useRef, useEffect } from "react";
import { Monitor, Smartphone } from "lucide-react";

export interface FocalPoint {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
}

export interface FocalPoints {
  desktop: FocalPoint;
  mobile: FocalPoint;
}

interface FocalPointPickerProps {
  imageUrl: string;
  focalPoints: FocalPoints;
  onChange: (focalPoints: FocalPoints) => void;
}

const DEFAULT_FOCAL_POINT: FocalPoint = { x: 50, y: 50 };

export const DEFAULT_FOCAL_POINTS: FocalPoints = {
  desktop: { ...DEFAULT_FOCAL_POINT },
  mobile: { ...DEFAULT_FOCAL_POINT },
};

export default function FocalPointPicker({
  imageUrl,
  focalPoints,
  onChange,
}: FocalPointPickerProps) {
  const [activeMode, setActiveMode] = useState<"desktop" | "mobile">("desktop");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentFocalPoint = focalPoints[activeMode];

  const updateFocalPoint = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    onChange({
      ...focalPoints,
      [activeMode]: { x: Math.round(x), y: Math.round(y) },
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    updateFocalPoint(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFocalPoint(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  if (!imageUrl) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm tracking-wide text-black/70 uppercase">
          Focal Point
        </label>
        <div className="flex gap-1 bg-black/5 p-1 rounded">
          <button
            onClick={() => setActiveMode("desktop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
              activeMode === "desktop"
                ? "bg-black text-white"
                : "text-black/60 hover:text-black"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Desktop
          </button>
          <button
            onClick={() => setActiveMode("mobile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
              activeMode === "mobile"
                ? "bg-black text-white"
                : "text-black/60 hover:text-black"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Mobile
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative w-full h-48 bg-black/5 rounded-lg overflow-hidden cursor-crosshair select-none"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: `${currentFocalPoint.x}% ${currentFocalPoint.y}%`,
        }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
        </div>

        {/* Focal point marker */}
        <div
          className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${currentFocalPoint.x}%`,
            top: `${currentFocalPoint.y}%`,
          }}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white shadow-lg" />
          {/* Inner dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white shadow-md" />
          </div>
          {/* Crosshair lines */}
          <div className="absolute left-1/2 -top-2 w-px h-2 bg-white -translate-x-1/2" />
          <div className="absolute left-1/2 -bottom-2 w-px h-2 bg-white -translate-x-1/2" />
          <div className="absolute -left-2 top-1/2 w-2 h-px bg-white -translate-y-1/2" />
          <div className="absolute -right-2 top-1/2 w-2 h-px bg-white -translate-y-1/2" />
        </div>

        {/* Mode indicator */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded flex items-center gap-1.5">
          {activeMode === "desktop" ? (
            <Monitor className="w-3 h-3" />
          ) : (
            <Smartphone className="w-3 h-3" />
          )}
          {activeMode === "desktop" ? "Desktop" : "Mobile"}
        </div>
      </div>

      <p className="text-xs text-black/50">
        Click or drag on the image to set the focal point for {activeMode}. Position: {currentFocalPoint.x}%, {currentFocalPoint.y}%
      </p>
    </div>
  );
}
