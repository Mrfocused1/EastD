"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

interface SaveButtonProps {
  onSave: () => Promise<void>;
  hasChanges?: boolean;
}

export default function SaveButton({ onSave, hasChanges = true }: SaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    try {
      await onSave();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving || !hasChanges}
      className={`
        inline-flex items-center gap-2 px-8 py-3 text-sm tracking-widest
        transition-all duration-300
        ${saved
          ? 'bg-green-600 text-white'
          : hasChanges
            ? 'bg-black text-white hover:bg-black/80'
            : 'bg-black/20 text-black/40 cursor-not-allowed'
        }
      `}
    >
      {isSaving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          SAVING...
        </>
      ) : saved ? (
        <>
          <Check className="w-4 h-4" />
          SAVED
        </>
      ) : (
        'SAVE CHANGES'
      )}
    </button>
  );
}
