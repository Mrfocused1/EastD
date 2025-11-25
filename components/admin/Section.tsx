"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function Section({
  title,
  description,
  children,
  defaultOpen = true,
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white border border-black/10 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-black/5 transition-colors"
      >
        <div>
          <h3 className="text-lg font-medium text-black">{title}</h3>
          {description && (
            <p className="text-sm text-black/60 mt-1">{description}</p>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-black/40" />
        ) : (
          <ChevronDown className="w-5 h-5 text-black/40" />
        )}
      </button>
      {isOpen && (
        <div className="p-6 pt-0 border-t border-black/10">
          <div className="pt-6 space-y-6">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
