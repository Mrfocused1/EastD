"use client";

import { useState, useEffect } from "react";

export interface FocalPoint {
  x: number;
  y: number;
}

export interface FocalPoints {
  desktop: FocalPoint;
  mobile: FocalPoint;
}

const DEFAULT_FOCAL_POINT: FocalPoint = { x: 50, y: 50 };

export const DEFAULT_FOCAL_POINTS: FocalPoints = {
  desktop: { ...DEFAULT_FOCAL_POINT },
  mobile: { ...DEFAULT_FOCAL_POINT },
};

const MOBILE_BREAKPOINT = 768;

export function useFocalPoint(focalPoints?: FocalPoints | null): FocalPoint {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!focalPoints) {
    return DEFAULT_FOCAL_POINT;
  }

  return isMobile ? focalPoints.mobile : focalPoints.desktop;
}

export function getFocalPointStyle(focalPoint?: FocalPoint | null): string {
  if (!focalPoint) {
    return "50% 50%";
  }
  return `${focalPoint.x}% ${focalPoint.y}%`;
}

export function parseFocalPoints(value: string | null | undefined): FocalPoints {
  if (!value) {
    return DEFAULT_FOCAL_POINTS;
  }
  try {
    const parsed = JSON.parse(value);
    return {
      desktop: parsed.desktop || DEFAULT_FOCAL_POINT,
      mobile: parsed.mobile || DEFAULT_FOCAL_POINT,
    };
  } catch {
    return DEFAULT_FOCAL_POINTS;
  }
}

export function stringifyFocalPoints(focalPoints: FocalPoints): string {
  return JSON.stringify(focalPoints);
}
