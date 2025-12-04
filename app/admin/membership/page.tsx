"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import ImageUpload from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import { supabase } from "@/lib/supabase";

interface Advantage {
  title: string;
  description: string;
}

export default function MembershipEditor() {
  const [isLoading, setIsLoading] = useState(true);

  // Hero section
  const [heroImage, setHeroImage] = useState("https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920");
  const [heroHeadline, setHeroHeadline] = useState("Unlock Unlimited Creative Potential at East Dock Studios");
  const [heroSubheadline, setHeroSubheadline] = useState("Flexible memberships designed for every creator — from minimal support to full-scale production.");

  // Intro section
  const [introTitle, setIntroTitle] = useState("What Membership Includes");
  const [introText, setIntroText] = useState("Membership at East Dock Studios gives creators access to our space, resources, and production expertise. Whether you're a solo creative, production company, or brand, we tailor your membership to the scale of your needs.");

  // Essential Membership
  const [essentialTitle, setEssentialTitle] = useState("Essential Membership");
  const [essentialFeatures, setEssentialFeatures] = useState([
    "Access to studio space based on availability",
    "Basic equipment usage",
    "Community access (networking, events, creator groups)",
    "Discounted rates on additional rental needs",
    "Pay-as-you-go production services",
  ]);

  // Full Production Membership
  const [fullProductionTitle, setFullProductionTitle] = useState("Full Production Membership");
  const [fullProductionFeatures, setFullProductionFeatures] = useState([
    "Priority booking for all studio spaces",
    "Access to full equipment inventory",
    "Dedicated production coordination",
    "On-set crew support (camera, lighting, sound — as per plan)",
    "Editing and post-production packages",
    "Creative consultation and project planning support",
    "Exclusive member-only studio hours",
  ]);

  // Benefits
  const [creativeAdvantages, setCreativeAdvantages] = useState<Advantage[]>([
    { title: "Flexible usage", description: "Book spaces and equipment according to your production cycles." },
    { title: "Professional support", description: "Access skilled in-house crew when needed." },
    { title: "Tailored scaling", description: "Grow from smaller shoots to fully staffed productions seamlessly." },
  ]);
  const [financialAdvantages, setFinancialAdvantages] = useState<Advantage[]>([
    { title: "Member discounts", description: "Reduced rates on equipment, studio hire, and production services." },
    { title: "Referral credits", description: "Bring in fellow creatives and earn credits towards bookings." },
    { title: "Predictable budgeting", description: "Custom membership pricing lets you plan ahead." },
  ]);
  const [communityAdvantages, setCommunityAdvantages] = useState<Advantage[]>([
    { title: "Exclusive events & workshops", description: "Hosted by industry professionals." },
    { title: "Networking opportunities", description: "Connect with filmmakers, photographers, content creators, and brands." },
    { title: "Early access", description: "Get first access to new studio features, gear, and membership upgrades." },
  ]);

  // Transparency
  const [disadvantages, setDisadvantages] = useState([
    "Membership fees may not suit creators with very irregular production schedules. Pay-as-you-go may be more economical for those who produce only occasionally.",
    "Spots and availability may be competitive during peak periods (although Full Production Members receive priority booking).",
    "Unused membership benefits do not roll over unless otherwise stated in a custom package.",
  ]);

  // Who Is For
  const [whoIsForItems, setWhoIsForItems] = useState([
    "Content creators growing their output",
    "Production companies needing consistent studio access",
    "Brands producing recurring digital content",
    "Filmmakers seeking a reliable creative home base",
    "Photographers and videographers looking for a flexible professional environment",
  ]);

  // How It Works
  const [howItWorksSteps, setHowItWorksSteps] = useState([
    "Browse the membership options above.",
    "Fill out the enquiry form below.",
    "Our team will contact you to discuss your goals and suggest a custom membership plan.",
    "You choose a tier (Essential or Full Production) or a hybrid package.",
    "Start creating with East Dock Studios.",
  ]);

  // Perks
  const [perks, setPerks] = useState([
    "Discounted studio and equipment rental",
    "Priority booking for Full Production Members",
    "Referral rewards and loyalty benefits",
    "Access to community events & workshops",
    "Ability to scale production services",
    "Dedicated support team depending on tier",
  ]);

  // CTA
  const [ctaTitle, setCtaTitle] = useState("Ready to join the East Dock Studios community?");
  const [ctaText, setCtaText] = useState("Fill out the form below and our team will tailor a membership that fits your needs.");

  const [hasChanges, setHasChanges] = useState(false);

  // Load content from Supabase on mount
  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from("site_content")
          .select("*")
          .eq("page", "membership");

        if (error) {
          console.error("Error loading content:", error);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          data.forEach((item: { section: string; key: string; value: string }) => {
            const { section, key, value } = item;

            // Hero section
            if (section === "hero" && key === "image") setHeroImage(value);
            if (section === "hero" && key === "headline") setHeroHeadline(value);
            if (section === "hero" && key === "subheadline") setHeroSubheadline(value);

            // Intro section
            if (section === "intro" && key === "title") setIntroTitle(value);
            if (section === "intro" && key === "text") setIntroText(value);

            // Essential
            if (section === "essential" && key === "title") setEssentialTitle(value);
            if (section === "essential" && key === "features") {
              try { setEssentialFeatures(JSON.parse(value)); } catch (e) { console.error(e); }
            }

            // Full Production
            if (section === "fullproduction" && key === "title") setFullProductionTitle(value);
            if (section === "fullproduction" && key === "features") {
              try { setFullProductionFeatures(JSON.parse(value)); } catch (e) { console.error(e); }
            }

            // Benefits
            if (section === "benefits" && key === "creative") {
              try { setCreativeAdvantages(JSON.parse(value)); } catch (e) { console.error(e); }
            }
            if (section === "benefits" && key === "financial") {
              try { setFinancialAdvantages(JSON.parse(value)); } catch (e) { console.error(e); }
            }
            if (section === "benefits" && key === "community") {
              try { setCommunityAdvantages(JSON.parse(value)); } catch (e) { console.error(e); }
            }

            // Transparency
            if (section === "transparency" && key === "disadvantages") {
              try { setDisadvantages(JSON.parse(value)); } catch (e) { console.error(e); }
            }

            // Who For
            if (section === "whofor" && key === "items") {
              try { setWhoIsForItems(JSON.parse(value)); } catch (e) { console.error(e); }
            }

            // How It Works
            if (section === "howitworks" && key === "steps") {
              try { setHowItWorksSteps(JSON.parse(value)); } catch (e) { console.error(e); }
            }

            // Perks
            if (section === "perks" && key === "items") {
              try { setPerks(JSON.parse(value)); } catch (e) { console.error(e); }
            }

            // CTA
            if (section === "cta" && key === "title") setCtaTitle(value);
            if (section === "cta" && key === "text") setCtaText(value);
          });
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadContent();
  }, []);

  const handleSave = async () => {
    const contentToSave = [
      // Hero
      { page: "membership", section: "hero", key: "image", value: heroImage, type: "image" },
      { page: "membership", section: "hero", key: "headline", value: heroHeadline, type: "text" },
      { page: "membership", section: "hero", key: "subheadline", value: heroSubheadline, type: "text" },
      // Intro
      { page: "membership", section: "intro", key: "title", value: introTitle, type: "text" },
      { page: "membership", section: "intro", key: "text", value: introText, type: "text" },
      // Essential
      { page: "membership", section: "essential", key: "title", value: essentialTitle, type: "text" },
      { page: "membership", section: "essential", key: "features", value: JSON.stringify(essentialFeatures), type: "array" },
      // Full Production
      { page: "membership", section: "fullproduction", key: "title", value: fullProductionTitle, type: "text" },
      { page: "membership", section: "fullproduction", key: "features", value: JSON.stringify(fullProductionFeatures), type: "array" },
      // Benefits
      { page: "membership", section: "benefits", key: "creative", value: JSON.stringify(creativeAdvantages), type: "array" },
      { page: "membership", section: "benefits", key: "financial", value: JSON.stringify(financialAdvantages), type: "array" },
      { page: "membership", section: "benefits", key: "community", value: JSON.stringify(communityAdvantages), type: "array" },
      // Transparency
      { page: "membership", section: "transparency", key: "disadvantages", value: JSON.stringify(disadvantages), type: "array" },
      // Who For
      { page: "membership", section: "whofor", key: "items", value: JSON.stringify(whoIsForItems), type: "array" },
      // How It Works
      { page: "membership", section: "howitworks", key: "steps", value: JSON.stringify(howItWorksSteps), type: "array" },
      // Perks
      { page: "membership", section: "perks", key: "items", value: JSON.stringify(perks), type: "array" },
      // CTA
      { page: "membership", section: "cta", key: "title", value: ctaTitle, type: "text" },
      { page: "membership", section: "cta", key: "text", value: ctaText, type: "text" },
    ];

    try {
      for (const item of contentToSave) {
        const { error } = await supabase
          .from("site_content")
          .upsert(
            {
              ...item,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "page,section,key",
            }
          );

        if (error) {
          console.error("Error saving:", error);
          throw error;
        }
      }
      setHasChanges(false);
    } catch (err) {
      console.error("Save failed:", err);
      throw err;
    }
  };

  const markChanged = () => setHasChanges(true);

  // Helper functions for list management
  const updateListItem = (list: string[], setList: (list: string[]) => void, index: number, value: string) => {
    const newList = [...list];
    newList[index] = value;
    setList(newList);
    markChanged();
  };

  const addListItem = (list: string[], setList: (list: string[]) => void) => {
    setList([...list, ""]);
    markChanged();
  };

  const removeListItem = (list: string[], setList: (list: string[]) => void, index: number) => {
    const newList = list.filter((_, i) => i !== index);
    setList(newList);
    markChanged();
  };

  const updateAdvantage = (advantages: Advantage[], setAdvantages: (a: Advantage[]) => void, index: number, field: "title" | "description", value: string) => {
    const newAdvantages = [...advantages];
    newAdvantages[index][field] = value;
    setAdvantages(newAdvantages);
    markChanged();
  };

  const addAdvantage = (advantages: Advantage[], setAdvantages: (a: Advantage[]) => void) => {
    setAdvantages([...advantages, { title: "", description: "" }]);
    markChanged();
  };

  const removeAdvantage = (advantages: Advantage[], setAdvantages: (a: Advantage[]) => void, index: number) => {
    const newAdvantages = advantages.filter((_, i) => i !== index);
    setAdvantages(newAdvantages);
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
            <h1 className="text-4xl font-light text-black">Membership Page</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/membership"
              target="_blank"
              className="inline-flex items-center gap-2 px-6 py-3 border border-black/20 text-black text-sm tracking-widest hover:bg-black/5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              PREVIEW
            </Link>
            <SaveButton onSave={handleSave} hasChanges={hasChanges} />
          </div>
        </div>
      </motion.div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Section title="Hero Section" description="Page header banner">
            <ImageUpload
              label="Background Image"
              value={heroImage}
              onChange={(v) => { setHeroImage(v); markChanged(); }}
            />
            <TextInput
              label="Headline"
              value={heroHeadline}
              onChange={(v) => { setHeroHeadline(v); markChanged(); }}
            />
            <TextInput
              label="Subheadline"
              value={heroSubheadline}
              onChange={(v) => { setHeroSubheadline(v); markChanged(); }}
              multiline
              rows={2}
            />
          </Section>
        </motion.div>

        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Section title="Intro Section" description="What membership includes">
            <TextInput
              label="Title"
              value={introTitle}
              onChange={(v) => { setIntroTitle(v); markChanged(); }}
            />
            <TextInput
              label="Description"
              value={introText}
              onChange={(v) => { setIntroText(v); markChanged(); }}
              multiline
              rows={3}
            />
          </Section>
        </motion.div>

        {/* Essential Membership */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section title="Essential Membership" description="Bare minimum support tier">
            <TextInput
              label="Title"
              value={essentialTitle}
              onChange={(v) => { setEssentialTitle(v); markChanged(); }}
            />
            <div className="space-y-3">
              <label className="block text-sm font-medium text-black/80">Features</label>
              {essentialFeatures.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateListItem(essentialFeatures, setEssentialFeatures, index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={() => removeListItem(essentialFeatures, setEssentialFeatures, index)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem(essentialFeatures, setEssentialFeatures)}
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            </div>
          </Section>
        </motion.div>

        {/* Full Production Membership */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Section title="Full Production Membership" description="Complete support tier">
            <TextInput
              label="Title"
              value={fullProductionTitle}
              onChange={(v) => { setFullProductionTitle(v); markChanged(); }}
            />
            <div className="space-y-3">
              <label className="block text-sm font-medium text-black/80">Features</label>
              {fullProductionFeatures.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateListItem(fullProductionFeatures, setFullProductionFeatures, index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={() => removeListItem(fullProductionFeatures, setFullProductionFeatures, index)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem(fullProductionFeatures, setFullProductionFeatures)}
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            </div>
          </Section>
        </motion.div>

        {/* Creative Advantages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Section title="Creative Advantages" description="Benefits for creative work">
            {creativeAdvantages.map((adv, index) => (
              <div key={index} className="flex gap-4 items-start bg-black/5 p-4 mb-4">
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <TextInput
                    label="Title"
                    value={adv.title}
                    onChange={(v) => updateAdvantage(creativeAdvantages, setCreativeAdvantages, index, "title", v)}
                  />
                  <TextInput
                    label="Description"
                    value={adv.description}
                    onChange={(v) => updateAdvantage(creativeAdvantages, setCreativeAdvantages, index, "description", v)}
                  />
                </div>
                <button
                  onClick={() => removeAdvantage(creativeAdvantages, setCreativeAdvantages, index)}
                  className="p-2 text-red-600 hover:bg-red-50 transition-colors mt-6"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addAdvantage(creativeAdvantages, setCreativeAdvantages)}
              className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Creative Advantage
            </button>
          </Section>
        </motion.div>

        {/* Financial Advantages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <Section title="Financial Advantages" description="Money-saving benefits">
            {financialAdvantages.map((adv, index) => (
              <div key={index} className="flex gap-4 items-start bg-black/5 p-4 mb-4">
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <TextInput
                    label="Title"
                    value={adv.title}
                    onChange={(v) => updateAdvantage(financialAdvantages, setFinancialAdvantages, index, "title", v)}
                  />
                  <TextInput
                    label="Description"
                    value={adv.description}
                    onChange={(v) => updateAdvantage(financialAdvantages, setFinancialAdvantages, index, "description", v)}
                  />
                </div>
                <button
                  onClick={() => removeAdvantage(financialAdvantages, setFinancialAdvantages, index)}
                  className="p-2 text-red-600 hover:bg-red-50 transition-colors mt-6"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addAdvantage(financialAdvantages, setFinancialAdvantages)}
              className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Financial Advantage
            </button>
          </Section>
        </motion.div>

        {/* Community Advantages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Section title="Community Advantages" description="Community and networking benefits">
            {communityAdvantages.map((adv, index) => (
              <div key={index} className="flex gap-4 items-start bg-black/5 p-4 mb-4">
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <TextInput
                    label="Title"
                    value={adv.title}
                    onChange={(v) => updateAdvantage(communityAdvantages, setCommunityAdvantages, index, "title", v)}
                  />
                  <TextInput
                    label="Description"
                    value={adv.description}
                    onChange={(v) => updateAdvantage(communityAdvantages, setCommunityAdvantages, index, "description", v)}
                  />
                </div>
                <button
                  onClick={() => removeAdvantage(communityAdvantages, setCommunityAdvantages, index)}
                  className="p-2 text-red-600 hover:bg-red-50 transition-colors mt-6"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addAdvantage(communityAdvantages, setCommunityAdvantages)}
              className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Community Advantage
            </button>
          </Section>
        </motion.div>

        {/* Transparency Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Section title="Transparency Section" description="Potential considerations/disadvantages">
            <div className="space-y-3">
              {disadvantages.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    value={item}
                    onChange={(e) => updateListItem(disadvantages, setDisadvantages, index, e.target.value)}
                    rows={2}
                    className="flex-1 px-4 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors resize-none"
                  />
                  <button
                    onClick={() => removeListItem(disadvantages, setDisadvantages, index)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem(disadvantages, setDisadvantages)}
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Consideration
              </button>
            </div>
          </Section>
        </motion.div>

        {/* Who Is For */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Section title="Who Is Membership For" description="Target audience items">
            <div className="space-y-3">
              {whoIsForItems.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateListItem(whoIsForItems, setWhoIsForItems, index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={() => removeListItem(whoIsForItems, setWhoIsForItems, index)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem(whoIsForItems, setWhoIsForItems)}
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Target Audience
              </button>
            </div>
          </Section>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
        >
          <Section title="How It Works" description="Step-by-step process">
            <div className="space-y-3">
              {howItWorksSteps.map((step, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateListItem(howItWorksSteps, setHowItWorksSteps, index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={() => removeListItem(howItWorksSteps, setHowItWorksSteps, index)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem(howItWorksSteps, setHowItWorksSteps)}
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>
          </Section>
        </motion.div>

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Section title="Membership Perks" description="Summary of all perks">
            <div className="space-y-3">
              {perks.map((perk, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={perk}
                    onChange={(e) => updateListItem(perks, setPerks, index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-black/20 bg-white focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={() => removeListItem(perks, setPerks, index)}
                    className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem(perks, setPerks)}
                className="flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Perk
              </button>
            </div>
          </Section>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <Section title="Call to Action" description="Final CTA above the form">
            <TextInput
              label="Title"
              value={ctaTitle}
              onChange={(v) => { setCtaTitle(v); markChanged(); }}
            />
            <TextInput
              label="Description"
              value={ctaText}
              onChange={(v) => { setCtaText(v); markChanged(); }}
              multiline
              rows={2}
            />
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
