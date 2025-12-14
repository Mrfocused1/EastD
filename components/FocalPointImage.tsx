"use client";

import Image from "next/image";
import { useFocalPoint, FocalPoints, DEFAULT_FOCAL_POINTS } from "@/hooks/useFocalPoint";

interface FocalPointImageProps {
  src: string;
  alt: string;
  focalPoints?: FocalPoints;
  className?: string;
  priority?: boolean;
}

export default function FocalPointImage({
  src,
  alt,
  focalPoints = DEFAULT_FOCAL_POINTS,
  className = "",
  priority = false,
}: FocalPointImageProps) {
  const focalPoint = useFocalPoint(focalPoints);

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={85}
      className={className}
      style={{
        objectFit: "cover",
        objectPosition: `${focalPoint.x}% ${focalPoint.y}%`,
      }}
    />
  );
}
