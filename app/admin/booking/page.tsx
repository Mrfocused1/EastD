"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import ImageUpload from "@/components/admin/ImageUpload";

interface DropdownOption {
  value: string;
  label: string;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "datetime" | "select" | "textarea";
  required: boolean;
  placeholder?: string;
  options?: DropdownOption[];
  order: number;
}

const defaultFields: FormField[] = [
  {
    id: "studio",
    name: "studio",
    label: "Studios",
    type: "select",
    required: true,
    options: [
      { value: "e16", label: "E16 SET" },
      { value: "e20", label: "E20 SET" },
      { value: "lux", label: "LUX SET" },
    ],
    order: 1,
  },
  {
    id: "name",
    name: "name",
    label: "NAME",
    type: "text",
    required: true,
    placeholder: "Enter your name",
    order: 2,
  },
  {
    id: "bookingDate",
    name: "bookingDate",
    label: "DATE OF ENQUIRED BOOKING",
    type: "datetime",
    required: true,
    order: 3,
  },
  {
    id: "email",
    name: "email",
    label: "EMAIL",
    type: "email",
    required: true,
    placeholder: "Enter your email",
    order: 4,
  },
  {
    id: "phone",
    name: "phone",
    label: "NUMBER",
    type: "tel",
    required: true,
    placeholder: "Enter your phone number",
    order: 5,
  },
  {
    id: "bookingLength",
    name: "bookingLength",
    label: "BOOKING LENGTH/TYPE",
    type: "select",
    required: true,
    options: [
      { value: "minimum2hrs", label: "MINIMUM 2HRS" },
      { value: "halfday4hrs", label: "HALF DAY (4HRS)" },
      { value: "fullday8hrs", label: "FULL DAY (8HRS)" },
    ],
    order: 6,
  },
  {
    id: "cameraLens",
    name: "cameraLens",
    label: "CAMERA AND LENS",
    type: "select",
    required: false,
    options: [
      { value: "quantity2more", label: "QUANTITY, UPTO 2MORE (AS EACH BOOKING COMES WITH TWO CAMERAS ALREADY) - £30 EACH" },
    ],
    order: 7,
  },
  {
    id: "videoSwitcher",
    name: "videoSwitcher",
    label: "VIDEO SWITCHER",
    type: "select",
    required: false,
    options: [
      { value: "halfday", label: "ENGINEER FOR UPTO HALF DAY SESSION - £35" },
      { value: "fullday", label: "FULL DAY - £60" },
    ],
    order: 8,
  },
  {
    id: "accessories",
    name: "accessories",
    label: "ACCESSORIES",
    type: "select",
    required: false,
    options: [
      { value: "teleprompter", label: "TELEPROMPTER - £25" },
    ],
    order: 9,
  },
  {
    id: "comments",
    name: "comments",
    label: "COMMENTS",
    type: "textarea",
    required: false,
    placeholder: "Enter any additional comments (optional)",
    order: 10,
  },
];

export default function BookingFormAdmin() {
  const [fields, setFields] = useState<FormField[]>(defaultFields);
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Hero section state
  const [heroImage, setHeroImage] = useState("https://images.pexels.com/photos/6794963/pexels-photo-6794963.jpeg?auto=compress&cs=tinysrgb&w=1920");
  const [heroSubtitle, setHeroSubtitle] = useState("REQUEST BOOKING");
  const [heroTitle, setHeroTitle] = useState("SELECT A STUDIO");

  useEffect(() => {
    loadFormConfig();
    loadHeroContent();
  }, []);

  async function loadHeroContent() {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("key, value")
        .eq("page", "booking")
        .eq("section", "hero");

      if (error) {
        console.error("Error loading hero content:", error);
        return;
      }

      if (data && data.length > 0) {
        data.forEach((item: { key: string; value: string }) => {
          if (item.key === "image") setHeroImage(item.value);
          if (item.key === "subtitle") setHeroSubtitle(item.value);
          if (item.key === "title") setHeroTitle(item.value);
        });
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function loadFormConfig() {
    try {
      const { data, error } = await supabase
        .from("site_content")
        .select("value")
        .eq("page", "booking")
        .eq("section", "form")
        .eq("key", "fields")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading form config:", error);
        return;
      }

      if (data?.value) {
        try {
          const parsedFields = JSON.parse(data.value);
          setFields(parsedFields);
        } catch (e) {
          console.error("Error parsing form config:", e);
        }
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }

  async function saveFormConfig() {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      // Save form fields
      const { error: fieldsError } = await supabase.from("site_content").upsert(
        {
          page: "booking",
          section: "form",
          key: "fields",
          value: JSON.stringify(fields),
        },
        { onConflict: "page,section,key" }
      );

      if (fieldsError) {
        console.error("Error saving form config:", fieldsError);
        setSaveStatus("error");
        return;
      }

      // Save hero content
      const heroItems = [
        { page: "booking", section: "hero", key: "image", value: heroImage },
        { page: "booking", section: "hero", key: "subtitle", value: heroSubtitle },
        { page: "booking", section: "hero", key: "title", value: heroTitle },
      ];

      for (const item of heroItems) {
        const { error } = await supabase.from("site_content").upsert(item, {
          onConflict: "page,section,key",
        });
        if (error) {
          console.error("Error saving hero content:", error);
          setSaveStatus("error");
          return;
        }
      }

      setSaveStatus("success");
      setHasChanges(false);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Error:", err);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }

  function updateField(fieldId: string, updates: Partial<FormField>) {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, ...updates } : f))
    );
    setHasChanges(true);
    if (selectedField?.id === fieldId) {
      setSelectedField((prev) => (prev ? { ...prev, ...updates } : null));
    }
  }

  function addDropdownOption(fieldId: string) {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const newOption: DropdownOption = {
      value: `option_${Date.now()}`,
      label: "New Option",
    };

    updateField(fieldId, {
      options: [...(field.options || []), newOption],
    });
  }

  function updateDropdownOption(
    fieldId: string,
    optionIndex: number,
    updates: Partial<DropdownOption>
  ) {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;

    const newOptions = [...field.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
    updateField(fieldId, { options: newOptions });
  }

  function removeDropdownOption(fieldId: string, optionIndex: number) {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;

    const newOptions = field.options.filter((_, i) => i !== optionIndex);
    updateField(fieldId, { options: newOptions });
  }

  function addNewField() {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "",
      order: fields.length + 1,
    };
    setFields((prev) => [...prev, newField]);
    setSelectedField(newField);
    setHasChanges(true);
  }

  function removeField(fieldId: string) {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
    setHasChanges(true);
  }

  function moveField(fieldId: string, direction: "up" | "down") {
    const index = fields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === fields.length - 1) return;

    const newFields = [...fields];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newFields[index], newFields[swapIndex]] = [newFields[swapIndex], newFields[index]];

    // Update order numbers
    newFields.forEach((f, i) => {
      f.order = i + 1;
    });

    setFields(newFields);
    setHasChanges(true);
  }

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
          className="inline-flex items-center gap-2 text-black/60 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm tracking-[0.3em] text-black/60 mb-2">MANAGE</p>
            <h1 className="text-4xl font-light text-black">Booking Form</h1>
          </div>
          <button
            onClick={saveFormConfig}
            disabled={isSaving || !hasChanges}
            className={`flex items-center gap-2 px-6 py-3 text-sm tracking-widest transition-all duration-300 ${
              hasChanges
                ? "bg-black text-white hover:bg-black/80"
                : "bg-black/20 text-black/40 cursor-not-allowed"
            }`}
          >
            <Save className="w-4 h-4" />
            {isSaving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
        {saveStatus === "success" && (
          <p className="text-green-600 mt-2">Changes saved successfully!</p>
        )}
        {saveStatus === "error" && (
          <p className="text-red-600 mt-2">Error saving changes. Please try again.</p>
        )}
      </motion.div>

      {/* Hero Section Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="mb-8"
      >
        <Section title="Hero Section" description="Background image and text for the booking page header">
          <ImageUpload
            label="Background Image"
            value={heroImage}
            onChange={(v) => { setHeroImage(v); setHasChanges(true); }}
            showFocalPointPicker={false}
          />
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <TextInput
              label="Subtitle"
              value={heroSubtitle}
              onChange={(v) => { setHeroSubtitle(v); setHasChanges(true); }}
              placeholder="REQUEST BOOKING"
            />
            <TextInput
              label="Title"
              value={heroTitle}
              onChange={(v) => { setHeroTitle(v); setHasChanges(true); }}
              placeholder="SELECT A STUDIO"
            />
          </div>
        </Section>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Field List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white border border-black/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium">Form Fields</h2>
              <button
                onClick={addNewField}
                className="flex items-center gap-2 px-4 py-2 border border-black text-sm hover:bg-black hover:text-white transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            <div className="space-y-2">
              {fields
                .sort((a, b) => a.order - b.order)
                .map((field, index) => (
                  <div
                    key={field.id}
                    onClick={() => setSelectedField(field)}
                    className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${
                      selectedField?.id === field.id
                        ? "border-black bg-black/5"
                        : "border-black/10 hover:border-black/30"
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-black/30" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{field.label}</p>
                      <p className="text-xs text-black/50">
                        {field.type} {field.required && "• required"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveField(field.id, "up");
                        }}
                        disabled={index === 0}
                        className="p-1 text-black/30 hover:text-black disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveField(field.id, "down");
                        }}
                        disabled={index === fields.length - 1}
                        className="p-1 text-black/30 hover:text-black disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeField(field.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* Field Editor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {selectedField ? (
            <div className="bg-white border border-black/10 p-6">
              <h2 className="text-xl font-medium mb-6">Edit Field</h2>

              <div className="space-y-6">
                {/* Label */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Field Label
                  </label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={(e) =>
                      updateField(selectedField.id, { label: e.target.value })
                    }
                    className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black"
                  />
                </div>

                {/* Field Name (for form submission) */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Field Name (internal)
                  </label>
                  <input
                    type="text"
                    value={selectedField.name}
                    onChange={(e) =>
                      updateField(selectedField.id, { name: e.target.value })
                    }
                    className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black font-mono text-sm"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Field Type
                  </label>
                  <select
                    value={selectedField.type}
                    onChange={(e) =>
                      updateField(selectedField.id, {
                        type: e.target.value as FormField["type"],
                        options: e.target.value === "select" ? [] : undefined,
                      })
                    }
                    className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black"
                  >
                    <option value="text">Text</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="date">Date</option>
                    <option value="datetime">Date & Time</option>
                    <option value="select">Dropdown</option>
                    <option value="textarea">Text Area</option>
                  </select>
                </div>

                {/* Required */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="required"
                    checked={selectedField.required}
                    onChange={(e) =>
                      updateField(selectedField.id, { required: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                  <label htmlFor="required" className="text-sm font-medium">
                    Required field
                  </label>
                </div>

                {/* Placeholder */}
                {selectedField.type !== "select" && selectedField.type !== "datetime" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={selectedField.placeholder || ""}
                      onChange={(e) =>
                        updateField(selectedField.id, {
                          placeholder: e.target.value,
                        })
                      }
                      className="w-full border border-black/20 px-4 py-3 focus:outline-none focus:border-black"
                    />
                  </div>
                )}

                {/* Dropdown Options */}
                {selectedField.type === "select" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium">
                        Dropdown Options
                      </label>
                      <button
                        onClick={() => addDropdownOption(selectedField.id)}
                        className="flex items-center gap-1 text-sm text-black/60 hover:text-black"
                      >
                        <Plus className="w-4 h-4" />
                        Add Option
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(selectedField.options || []).map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 bg-black/5 border border-black/10"
                        >
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={option.label}
                              onChange={(e) =>
                                updateDropdownOption(selectedField.id, index, {
                                  label: e.target.value,
                                })
                              }
                              placeholder="Display label"
                              className="w-full border border-black/20 px-3 py-2 text-sm focus:outline-none focus:border-black"
                            />
                            <input
                              type="text"
                              value={option.value}
                              onChange={(e) =>
                                updateDropdownOption(selectedField.id, index, {
                                  value: e.target.value,
                                })
                              }
                              placeholder="Value (internal)"
                              className="w-full border border-black/20 px-3 py-2 text-sm font-mono focus:outline-none focus:border-black"
                            />
                          </div>
                          <button
                            onClick={() =>
                              removeDropdownOption(selectedField.id, index)
                            }
                            className="p-2 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {(!selectedField.options ||
                        selectedField.options.length === 0) && (
                        <p className="text-sm text-black/50 text-center py-4">
                          No options yet. Click "Add Option" to create one.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-black/10 p-6 flex items-center justify-center h-full min-h-[400px]">
              <p className="text-black/50">Select a field to edit</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
