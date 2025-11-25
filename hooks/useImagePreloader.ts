"use client";

import { useState, useEffect } from "react";

export function useImagePreloader(imageUrls: string[]): boolean {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageUrls.filter(url => url && url.length > 0).length;

    if (totalImages === 0) {
      setIsLoading(false);
      return;
    }

    const preloadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        if (!src || src.length === 0) {
          resolve();
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          loadedCount++;
          if (loadedCount >= totalImages) {
            setIsLoading(false);
          }
          resolve();
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount >= totalImages) {
            setIsLoading(false);
          }
          resolve();
        };
        img.src = src;
      });
    };

    // Start preloading all images
    imageUrls.forEach(url => {
      if (url && url.length > 0) {
        preloadImage(url);
      }
    });

    // Fallback timeout - hide loader after 5 seconds even if images haven't loaded
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [imageUrls]);

  return isLoading;
}
