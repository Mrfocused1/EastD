"use client";

import { useState, useEffect } from "react";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

export default function TextInput({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 3,
}: TextInputProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const inputClasses = `
    w-full px-4 py-3 bg-white border border-black/20
    text-black text-sm
    focus:outline-none focus:border-black
    transition-colors duration-200
  `;

  return (
    <div className="space-y-2">
      <label className="block text-sm tracking-wide text-black/70 uppercase">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
    </div>
  );
}
