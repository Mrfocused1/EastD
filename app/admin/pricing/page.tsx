"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Plus, Trash2, PoundSterling } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import SaveButton from "@/components/admin/SaveButton";

interface StudioPricing {
  id: string;
  name: string;
  packages: {
    id: string;
    label: string;
    hours: number;
    price: number; // in pence
  }[];
}

interface AddonPricing {
  id: string;
  category: string;
  label: string;
  price: number; // in pence
  maxQuantity: number; // Maximum quantity a customer can order
}

const defaultStudios: StudioPricing[] = [
  {
    id: "studio-dock-one",
    name: "Studio Dock One (E16)",
    packages: [
      { id: "minimum2hrs", label: "Minimum 2 Hours", hours: 2, price: 15000 },
      { id: "halfday4hrs", label: "Half Day (4 Hours)", hours: 4, price: 28000 },
      { id: "fullday8hrs", label: "Full Day (8 Hours)", hours: 8, price: 50000 },
    ],
  },
  {
    id: "studio-dock-two",
    name: "Studio Dock Two (E20)",
    packages: [
      { id: "minimum2hrs", label: "Minimum 2 Hours", hours: 2, price: 15000 },
      { id: "halfday4hrs", label: "Half Day (4 Hours)", hours: 4, price: 28000 },
      { id: "fullday8hrs", label: "Full Day (8 Hours)", hours: 8, price: 50000 },
    ],
  },
  {
    id: "studio-wharf",
    name: "Studio Wharf (LUX)",
    packages: [
      { id: "minimum2hrs", label: "Minimum 2 Hours", hours: 2, price: 20000 },
      { id: "halfday4hrs", label: "Half Day (4 Hours)", hours: 4, price: 38000 },
      { id: "fullday8hrs", label: "Full Day (8 Hours)", hours: 8, price: 70000 },
    ],
  },
];

const defaultAddons: AddonPricing[] = [
  { id: "camera", category: "cameraLens", label: "Additional Camera & Lens", price: 3000, maxQuantity: 2 },
  { id: "switcher_half", category: "videoSwitcher", label: "Video Switcher Engineer - Half Day", price: 3500, maxQuantity: 1 },
  { id: "switcher_full", category: "videoSwitcher", label: "Video Switcher Engineer - Full Day", price: 6000, maxQuantity: 1 },
  { id: "teleprompter", category: "accessories", label: "Teleprompter", price: 2500, maxQuantity: 2 },
  { id: "guest", category: "guests", label: "Additional Guest (per person)", price: 500, maxQuantity: 10 },
];

export default function PricingEditor() {
  const [isLoading, setIsLoading] = useState(true);
  const [studios, setStudios] = useState<StudioPricing[]>(defaultStudios);
  const [addons, setAddons] = useState<AddonPricing[]>(defaultAddons);
  const [hasChanges, setHasChanges] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string; details?: string } | null>(null);

  useEffect(() => {
    loadPricing();
    // Failsafe: ensure page loads within 5 seconds
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  async function loadPricing() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/admin/pricing", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();

      // API now always returns data (with defaults if needed)
      if (data.studios) {
        setStudios(data.studios);
      }
      if (data.addons) {
        setAddons(data.addons);
      }
      if (data.fromDefaults) {
        const dbStatus = data.usingServiceRole
          ? "Service role key is set but database data not found."
          : "Using anon key (no service role key). Database data may not be accessible.";
        setLoadError(`Using default pricing data. ${dbStatus}`);
      }
    } catch (err) {
      console.error("Error loading pricing:", err);
      setLoadError("Failed to load pricing data. Using defaults.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async () => {
    setSaveStatus(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for save

      const response = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studios, addons }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json();
      console.log("[Pricing Page] Save response:", data);

      if (!response.ok) {
        console.error("Error saving:", data);
        const details = data.usingServiceRole !== undefined
          ? `Service Role Key: ${data.usingServiceRole ? 'Yes' : 'No (using anon key - cannot write)'}. ${data.hint || ''}`
          : '';
        setSaveStatus({
          success: false,
          message: data.error || "Failed to save pricing",
          details: details + (data.details ? ` Details: ${data.details}` : '')
        });
        throw new Error(data.error || "Failed to save pricing");
      }

      // Show success details
      const details = data.usingServiceRole !== undefined
        ? `Service Role Key: ${data.usingServiceRole ? 'Yes' : 'No'}. Rows saved: ${data.results?.map((r: { key: string; rowsAffected: number }) => `${r.key}: ${r.rowsAffected}`).join(', ') || 'unknown'}`
        : '';
      setSaveStatus({
        success: true,
        message: "Pricing saved successfully!",
        details
      });

      setHasChanges(false);
      setLoadError(null); // Clear any previous errors on successful save
    } catch (err) {
      console.error("Save failed:", err);
      if (err instanceof Error && err.name === 'AbortError') {
        setSaveStatus({
          success: false,
          message: "Save timed out",
          details: "Please check your internet connection and try again."
        });
        throw new Error("Save timed out. Please check your internet connection and try again.");
      }
      throw err;
    }
  };

  const markChanged = () => setHasChanges(true);

  const formatPriceDisplay = (priceInPence: number) => {
    return (priceInPence / 100).toFixed(2);
  };

  const parsePriceInput = (value: string) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : Math.round(parsed * 100);
  };

  const updateStudioName = (studioIndex: number, name: string) => {
    const newStudios = [...studios];
    newStudios[studioIndex].name = name;
    setStudios(newStudios);
    markChanged();
  };

  const updatePackagePrice = (studioIndex: number, packageIndex: number, price: string) => {
    const newStudios = [...studios];
    newStudios[studioIndex].packages[packageIndex].price = parsePriceInput(price);
    setStudios(newStudios);
    markChanged();
  };

  const updatePackageLabel = (studioIndex: number, packageIndex: number, label: string) => {
    const newStudios = [...studios];
    newStudios[studioIndex].packages[packageIndex].label = label;
    setStudios(newStudios);
    markChanged();
  };

  const updatePackageHours = (studioIndex: number, packageIndex: number, hours: string) => {
    const newStudios = [...studios];
    newStudios[studioIndex].packages[packageIndex].hours = parseInt(hours) || 0;
    setStudios(newStudios);
    markChanged();
  };

  const addPackage = (studioIndex: number) => {
    const newStudios = [...studios];
    newStudios[studioIndex].packages.push({
      id: `package_${Date.now()}`,
      label: "New Package",
      hours: 1,
      price: 10000,
    });
    setStudios(newStudios);
    markChanged();
  };

  const removePackage = (studioIndex: number, packageIndex: number) => {
    const newStudios = [...studios];
    newStudios[studioIndex].packages = newStudios[studioIndex].packages.filter((_, i) => i !== packageIndex);
    setStudios(newStudios);
    markChanged();
  };

  const updateAddon = (index: number, field: keyof AddonPricing, value: string) => {
    const newAddons = [...addons];
    if (field === "price") {
      newAddons[index].price = parsePriceInput(value);
    } else if (field === "label") {
      newAddons[index].label = value;
    } else if (field === "category") {
      newAddons[index].category = value;
    } else if (field === "id") {
      newAddons[index].id = value;
    } else if (field === "maxQuantity") {
      newAddons[index].maxQuantity = parseInt(value) || 1;
    }
    setAddons(newAddons);
    markChanged();
  };

  const addAddon = () => {
    setAddons([
      ...addons,
      {
        id: `addon_${Date.now()}`,
        category: "accessories",
        label: "New Add-on",
        price: 1000,
        maxQuantity: 1,
      },
    ]);
    markChanged();
  };

  const removeAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
    markChanged();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-black/40" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
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
            <p className="text-sm tracking-[0.3em] text-black/60 mb-2">EDITING</p>
            <h1 className="text-4xl font-light text-black">Pricing & Packages</h1>
          </div>
          <SaveButton onSave={handleSave} hasChanges={hasChanges} />
        </div>
      </motion.div>

      {loadError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-amber-50 border border-amber-200 p-4 mb-6 text-amber-800"
        >
          <p className="font-medium">Note</p>
          <p className="text-sm">{loadError}</p>
          <p className="text-xs mt-2">To enable database storage, ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables.</p>
        </motion.div>
      )}

      {saveStatus && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-4 mb-6 ${saveStatus.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}
        >
          <p className="font-medium">{saveStatus.success ? 'Success' : 'Error'}</p>
          <p className="text-sm">{saveStatus.message}</p>
          {saveStatus.details && <p className="text-xs mt-2 font-mono">{saveStatus.details}</p>}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Studio Pricing */}
        {studios.map((studio, studioIndex) => (
          <motion.div
            key={studio.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: studioIndex * 0.1 }}
          >
            <Section
              title={studio.name}
              description={`Pricing packages for ${studio.id.toUpperCase()} studio`}
            >
              <TextInput
                label="Studio Display Name"
                value={studio.name}
                onChange={(v) => updateStudioName(studioIndex, v)}
              />

              <div className="mt-6">
                <label className="block text-sm font-medium text-black/80 mb-3">Packages</label>
                <div className="space-y-4">
                  {studio.packages.map((pkg, pkgIndex) => (
                    <div
                      key={pkg.id}
                      className="bg-black/5 p-4 flex flex-wrap items-end gap-4"
                    >
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-black/60 mb-1">Label</label>
                        <input
                          type="text"
                          value={pkg.label}
                          onChange={(e) => updatePackageLabel(studioIndex, pkgIndex, e.target.value)}
                          className="w-full px-3 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors text-sm"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-black/60 mb-1">Hours</label>
                        <input
                          type="number"
                          value={pkg.hours}
                          onChange={(e) => updatePackageHours(studioIndex, pkgIndex, e.target.value)}
                          className="w-full px-3 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors text-sm"
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-xs text-black/60 mb-1">Price (£)</label>
                        <div className="relative">
                          <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                          <input
                            type="number"
                            step="0.01"
                            value={formatPriceDisplay(pkg.price)}
                            onChange={(e) => updatePackagePrice(studioIndex, pkgIndex, e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removePackage(studioIndex, pkgIndex)}
                        className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => addPackage(studioIndex)}
                  className="mt-4 flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Package
                </button>
              </div>
            </Section>
          </motion.div>
        ))}

        {/* Add-ons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Section title="Add-ons & Extras" description="Additional services and equipment">
            <div className="space-y-4">
              {addons.map((addon, index) => (
                <div
                  key={addon.id}
                  className="bg-black/5 p-4 flex flex-wrap items-end gap-4"
                >
                  <div className="w-40">
                    <label className="block text-xs text-black/60 mb-1">Category</label>
                    <select
                      value={addon.category}
                      onChange={(e) => updateAddon(index, "category", e.target.value)}
                      className="w-full px-3 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors text-sm"
                    >
                      <option value="cameraLens">Camera & Lens</option>
                      <option value="videoSwitcher">Video Switcher</option>
                      <option value="accessories">Accessories</option>
                      <option value="guests">Guests</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-black/60 mb-1">Label</label>
                    <input
                      type="text"
                      value={addon.label}
                      onChange={(e) => updateAddon(index, "label", e.target.value)}
                      className="w-full px-3 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors text-sm"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-black/60 mb-1">Price (£)</label>
                    <div className="relative">
                      <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                      <input
                        type="number"
                        step="0.01"
                        value={formatPriceDisplay(addon.price)}
                        onChange={(e) => updateAddon(index, "price", e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-black/60 mb-1">Max Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={addon.maxQuantity || 1}
                      onChange={(e) => updateAddon(index, "maxQuantity", e.target.value)}
                      className="w-full px-3 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeAddon(index)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addAddon}
              className="mt-4 flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add New Add-on
            </button>
          </Section>
        </motion.div>
      </div>

      {/* Floating Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8"
        >
          <SaveButton onSave={handleSave} hasChanges={hasChanges} />
        </motion.div>
      )}
    </div>
  );
}
