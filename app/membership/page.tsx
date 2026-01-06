"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useMemo, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { supabase } from "@/lib/supabase";
import { Check, X, Users, Briefcase, TrendingUp, DollarSign, Gift, Calendar, Sparkles, Network, Zap } from "lucide-react";

interface MembershipContent {
  heroImage: string;
  heroHeadline: string;
  heroSubheadline: string;
  introTitle: string;
  introText: string;
  essentialTitle: string;
  essentialFeatures: string[];
  fullProductionTitle: string;
  fullProductionFeatures: string[];
  creativeAdvantages: { title: string; description: string }[];
  financialAdvantages: { title: string; description: string }[];
  communityAdvantages: { title: string; description: string }[];
  disadvantages: string[];
  whoIsForItems: string[];
  howItWorksSteps: string[];
  perks: string[];
  ctaTitle: string;
  ctaText: string;
}

const defaultContent: MembershipContent = {
  heroImage: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920",
  heroHeadline: "Unlock Unlimited Creative Potential at East Dock Studios",
  heroSubheadline: "Flexible memberships designed for every creator — from minimal support to full-scale production.",
  introTitle: "What Membership Includes",
  introText: "Membership at East Dock Studios gives creators access to our space, resources, and production expertise. Whether you're a solo creative, production company, or brand, we tailor your membership to the scale of your needs.",
  essentialTitle: "Essential Membership",
  essentialFeatures: [
    "Access to studio space based on availability",
    "Basic equipment usage",
    "Community access (networking, events, creator groups)",
    "Discounted rates on additional rental needs",
    "Pay-as-you-go production services",
  ],
  fullProductionTitle: "Full Production Membership",
  fullProductionFeatures: [
    "Priority booking for all studio spaces",
    "Access to full equipment inventory",
    "Dedicated production coordination",
    "On-set crew support (camera, lighting, sound — as per plan)",
    "Editing and post-production packages",
    "Creative consultation and project planning support",
    "Exclusive member-only studio hours",
  ],
  creativeAdvantages: [
    { title: "Flexible usage", description: "Book spaces and equipment according to your production cycles." },
    { title: "Professional support", description: "Access skilled in-house crew when needed." },
    { title: "Tailored scaling", description: "Grow from smaller shoots to fully staffed productions seamlessly." },
  ],
  financialAdvantages: [
    { title: "Member discounts", description: "Reduced rates on equipment, studio hire, and production services." },
    { title: "Referral credits", description: "Bring in fellow creatives and earn credits towards bookings." },
    { title: "Predictable budgeting", description: "Custom membership pricing lets you plan ahead." },
  ],
  communityAdvantages: [
    { title: "Exclusive events & workshops", description: "Hosted by industry professionals." },
    { title: "Networking opportunities", description: "Connect with filmmakers, photographers, content creators, and brands." },
    { title: "Early access", description: "Get first access to new studio features, gear, and membership upgrades." },
  ],
  disadvantages: [
    "Membership fees may not suit creators with very irregular production schedules. Pay-as-you-go may be more economical for those who produce only occasionally.",
    "Spots and availability may be competitive during peak periods (although Full Production Members receive priority booking).",
    "Unused membership benefits do not roll over unless otherwise stated in a custom package.",
  ],
  whoIsForItems: [
    "Content creators growing their output",
    "Production companies needing consistent studio access",
    "Brands producing recurring digital content",
    "Filmmakers seeking a reliable creative home base",
    "Photographers and videographers looking for a flexible professional environment",
  ],
  howItWorksSteps: [
    "Browse the membership options above.",
    "Fill out the enquiry form below.",
    "Our team will contact you to discuss your goals and suggest a custom membership plan.",
    "You choose a tier (Essential or Full Production) or a hybrid package.",
    "Start creating with East Dock Studios.",
  ],
  perks: [
    "Discounted studio and equipment rental",
    "Priority booking for Full Production Members",
    "Referral rewards and loyalty benefits",
    "Access to community events & workshops",
    "Ability to scale production services",
    "Dedicated support team depending on tier",
  ],
  ctaTitle: "Ready to join the East Dock Studios community?",
  ctaText: "Fill out the form below and our team will tailor a membership that fits your needs.",
};

export default function MembershipPage() {
  const heroRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(heroScrollProgress, [0, 1], ["0%", "30%"]);

  const [content, setContent] = useState<MembershipContent>(defaultContent);
  const [contentLoaded, setContentLoaded] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    creatorType: "",
    productionNeeds: "",
    membershipType: "",
    budgetRange: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Failsafe: force loading to complete after 5 seconds maximum
  const [forceLoaded, setForceLoaded] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setForceLoaded(true), 5000);
    return () => clearTimeout(timeout);
  }, []);

  const imagesToPreload = useMemo(() => {
    return [content.heroImage].filter(Boolean);
  }, [content.heroImage]);

  const imagesLoading = useImagePreloader(contentLoaded ? imagesToPreload : []);
  const isLoading = !forceLoaded && (!contentLoaded || imagesLoading);

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from("site_content")
          .select("section, key, value")
          .eq("page", "membership");

        if (error) {
          console.error("Error loading membership content:", error);
          setContentLoaded(true);
          return;
        }

        if (data && data.length > 0) {
          const newContent = { ...defaultContent };
          data.forEach((item: { section: string; key: string; value: string }) => {
            if (item.section === "hero" && item.key === "image") newContent.heroImage = item.value;
            if (item.section === "hero" && item.key === "headline") newContent.heroHeadline = item.value;
            if (item.section === "hero" && item.key === "subheadline") newContent.heroSubheadline = item.value;
            if (item.section === "intro" && item.key === "title") newContent.introTitle = item.value;
            if (item.section === "intro" && item.key === "text") newContent.introText = item.value;
            if (item.section === "essential" && item.key === "title") newContent.essentialTitle = item.value;
            if (item.section === "essential" && item.key === "features") {
              try { newContent.essentialFeatures = JSON.parse(item.value); } catch (e) { console.error(e); }
            }
            if (item.section === "fullproduction" && item.key === "title") newContent.fullProductionTitle = item.value;
            if (item.section === "fullproduction" && item.key === "features") {
              try { newContent.fullProductionFeatures = JSON.parse(item.value); } catch (e) { console.error(e); }
            }
            if (item.section === "benefits" && item.key === "creative") {
              try { newContent.creativeAdvantages = JSON.parse(item.value); } catch (e) { console.error(e); }
            }
            if (item.section === "benefits" && item.key === "financial") {
              try { newContent.financialAdvantages = JSON.parse(item.value); } catch (e) { console.error(e); }
            }
            if (item.section === "benefits" && item.key === "community") {
              try { newContent.communityAdvantages = JSON.parse(item.value); } catch (e) { console.error(e); }
            }
            if (item.section === "transparency" && item.key === "disadvantages") {
              try { newContent.disadvantages = JSON.parse(item.value); } catch (e) { console.error(e); }
            }
            if (item.section === "whofor" && item.key === "items") {
              try { newContent.whoIsForItems = JSON.parse(item.value); } catch (e) { console.error(e); }
            }
            if (item.section === "howitworks" && item.key === "steps") {
              try { newContent.howItWorksSteps = JSON.parse(item.value); } catch (e) { console.error(e); }
            }
            if (item.section === "perks" && item.key === "items") {
              try { newContent.perks = JSON.parse(item.value); } catch (e) { console.error(e); }
            }
            if (item.section === "cta" && item.key === "title") newContent.ctaTitle = item.value;
            if (item.section === "cta" && item.key === "text") newContent.ctaText = item.value;
          });
          setContent(newContent);
        }
        setContentLoaded(true);
      } catch (err) {
        console.error("Error:", err);
        setContentLoaded(true);
      }
    }

    loadContent();
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email address";
    if (!formData.creatorType.trim()) newErrors.creatorType = "Please select your creator type";
    if (!formData.membershipType) newErrors.membershipType = "Please select a membership type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          phone: "",
          creatorType: "",
          productionNeeds: "",
          membershipType: "",
          budgetRange: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='black' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 1rem center",
  };

  return (
    <>
      <PageLoader isLoading={isLoading} />
      <Header />
      <main className="min-h-screen bg-[#fdfbf8]">
        {/* Hero Section */}
        <section ref={heroRef} className="relative h-[80vh] overflow-hidden">
          <motion.div style={{ y: heroY }} className="absolute inset-0 h-[130%] -top-[15%]">
            <Image
              src={content.heroImage}
              alt="Membership"
              fill
              sizes="100vw"
              quality={85}
              className="object-cover"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center text-white max-w-4xl px-6"
            >
              <p className="text-sm tracking-[0.3em] mb-4 text-white">EASTDOCK STUDIOS</p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-wide leading-tight mb-6 text-white">{content.heroHeadline}</h1>
              <p className="text-base md:text-lg lg:text-xl font-light mb-8 text-white/90">{content.heroSubheadline}</p>
              <button
                onClick={scrollToForm}
                className="inline-block border-2 border-white px-10 py-4 text-sm tracking-widest text-white hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
              >
                BECOME A MEMBER
              </button>
            </motion.div>
          </div>
        </section>

        {/* What Membership Includes */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto mb-16"
            >
              <p className="text-sm tracking-[0.3em] text-gray-400 mb-4">MEMBERSHIP</p>
              <h2 className="text-5xl font-light text-black mb-6">{content.introTitle}</h2>
              <div className="w-24 h-px bg-gray-300 mx-auto mb-8"></div>
              <p className="text-lg text-gray-600 leading-relaxed">{content.introText}</p>
            </motion.div>

            {/* Two Membership Paths */}
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Essential Membership */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-[#fdfbf8] border border-gray-200 p-8"
              >
                <div className="text-center mb-8">
                  <p className="text-xs tracking-[0.2em] text-gray-400 mb-2">BARE MINIMUM SUPPORT</p>
                  <h3 className="text-3xl font-light text-black">{content.essentialTitle}</h3>
                </div>
                <ul className="space-y-4">
                  {content.essentialFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 text-center">
                  <button
                    onClick={scrollToForm}
                    className="border border-black px-8 py-3 text-sm tracking-widest hover:bg-black hover:text-white transition-all duration-300"
                  >
                    ENQUIRE NOW
                  </button>
                </div>
              </motion.div>

              {/* Full Production Membership */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-black text-white p-8"
              >
                <div className="text-center mb-8">
                  <p className="text-xs tracking-[0.2em] text-gray-400 mb-2">COMPLETE SUPPORT</p>
                  <h3 className="text-3xl font-light">{content.fullProductionTitle}</h3>
                </div>
                <ul className="space-y-4">
                  {content.fullProductionFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#DC143C] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 text-center">
                  <button
                    onClick={scrollToForm}
                    className="border border-white px-8 py-3 text-sm tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
                  >
                    ENQUIRE NOW
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-[#fdfbf8]">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm tracking-[0.3em] text-gray-400 mb-4">WHY JOIN</p>
              <h2 className="text-5xl font-light text-black">Benefits of Becoming a Member</h2>
              <div className="w-24 h-px bg-gray-300 mx-auto mt-6"></div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {/* Creative Advantages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-8 h-8 text-[#DC143C]" />
                  <h3 className="text-2xl font-light text-black">Creative Advantages</h3>
                </div>
                <ul className="space-y-4">
                  {content.creativeAdvantages.map((item, index) => (
                    <li key={index} className="border-l-2 border-gray-200 pl-4">
                      <p className="font-medium text-black">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Financial Advantages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-8 h-8 text-[#DC143C]" />
                  <h3 className="text-2xl font-light text-black">Financial Advantages</h3>
                </div>
                <ul className="space-y-4">
                  {content.financialAdvantages.map((item, index) => (
                    <li key={index} className="border-l-2 border-gray-200 pl-4">
                      <p className="font-medium text-black">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Community Advantages */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <Network className="w-8 h-8 text-[#DC143C]" />
                  <h3 className="text-2xl font-light text-black">Community Advantages</h3>
                </div>
                <ul className="space-y-4">
                  {content.communityAdvantages.map((item, index) => (
                    <li key={index} className="border-l-2 border-gray-200 pl-4">
                      <p className="font-medium text-black">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Transparency Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <p className="text-sm tracking-[0.3em] text-gray-400 mb-4">TRANSPARENCY</p>
                <h2 className="text-4xl font-light text-black">Potential Considerations</h2>
                <div className="w-24 h-px bg-gray-300 mx-auto mt-6 mb-8"></div>
                <p className="text-gray-600">Membership isn&apos;t always the perfect fit for everyone. It&apos;s important to understand when joining may or may not benefit you.</p>
              </div>

              <div className="space-y-4">
                {content.disadvantages.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 border-l-4 border-gray-300"
                  >
                    <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Who Is Membership For */}
        <section className="py-24 bg-[#fdfbf8]">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-sm tracking-[0.3em] text-gray-400 mb-4">IDEAL FOR</p>
              <h2 className="text-5xl font-light text-black">Who Is Membership For?</h2>
              <div className="w-24 h-px bg-gray-300 mx-auto mt-6"></div>
            </motion.div>

            <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {content.whoIsForItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-white border border-gray-200"
                >
                  <Users className="w-10 h-10 mx-auto mb-4 text-[#DC143C]" />
                  <p className="text-sm text-gray-700">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-black text-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <p className="text-sm tracking-[0.3em] text-gray-400 mb-4">PROCESS</p>
              <h2 className="text-5xl font-light">How It Works</h2>
              <div className="w-24 h-px bg-gray-600 mx-auto mt-6"></div>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {content.howItWorksSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-6 mb-8"
                >
                  <div className="w-12 h-12 bg-[#DC143C] flex items-center justify-center flex-shrink-0 text-xl font-light">
                    {index + 1}
                  </div>
                  <p className="text-lg text-gray-300 pt-2">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Membership Perks Summary */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <p className="text-sm tracking-[0.3em] text-gray-400 mb-4">SUMMARY</p>
              <h2 className="text-5xl font-light text-black">Membership Perks</h2>
              <div className="w-24 h-px bg-gray-300 mx-auto mt-6"></div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {content.perks.map((perk, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-4 bg-[#fdfbf8] border border-gray-200"
                >
                  <Check className="w-5 h-5 text-[#DC143C] flex-shrink-0" />
                  <span className="text-gray-700">{perk}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA & Form */}
        <section ref={formRef} id="membership-form" className="py-24 bg-[#fdfbf8]">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-light text-black mb-4">{content.ctaTitle}</h2>
              <p className="text-lg text-gray-600">{content.ctaText}</p>
            </motion.div>

            <motion.form
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="bg-white p-8 md:p-12 border border-gray-200"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm text-black font-medium mb-2">NAME *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm text-black font-medium mb-2">EMAIL *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm text-black font-medium mb-2">PHONE NUMBER (OPTIONAL)</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-black font-medium mb-2">TYPE OF CREATOR/COMPANY *</label>
                  <select
                    name="creatorType"
                    value={formData.creatorType}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                    style={selectStyle}
                  >
                    <option value="">Select type</option>
                    <option value="content_creator">Content Creator</option>
                    <option value="production_company">Production Company</option>
                    <option value="brand">Brand</option>
                    <option value="filmmaker">Filmmaker</option>
                    <option value="photographer">Photographer</option>
                    <option value="videographer">Videographer</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.creatorType && <p className="text-red-600 text-sm mt-1">{errors.creatorType}</p>}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-black font-medium mb-2">YOUR PRODUCTION NEEDS</label>
                <textarea
                  name="productionNeeds"
                  value={formData.productionNeeds}
                  onChange={handleChange}
                  placeholder="Tell us about your production needs and goals"
                  rows={4}
                  className="w-full bg-white border border-gray-300 px-4 py-3 text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors resize-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm text-black font-medium mb-2">PREFERRED MEMBERSHIP TYPE *</label>
                  <select
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                    style={selectStyle}
                  >
                    <option value="">Select membership type</option>
                    <option value="essential">Essential Membership</option>
                    <option value="full_production">Full Production Membership</option>
                    <option value="not_sure">Not sure yet</option>
                  </select>
                  {errors.membershipType && <p className="text-red-600 text-sm mt-1">{errors.membershipType}</p>}
                </div>
                <div>
                  <label className="block text-sm text-black font-medium mb-2">MONTHLY BUDGET RANGE (OPTIONAL)</label>
                  <select
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-300 px-4 py-3 text-black focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                    style={selectStyle}
                  >
                    <option value="">Select budget range</option>
                    <option value="under_500">Under £500/month</option>
                    <option value="500_1000">£500 - £1,000/month</option>
                    <option value="1000_2500">£1,000 - £2,500/month</option>
                    <option value="2500_5000">£2,500 - £5,000/month</option>
                    <option value="over_5000">Over £5,000/month</option>
                  </select>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white px-12 py-4 text-sm tracking-widest hover:bg-[#DC143C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "SUBMITTING..." : "ENQUIRE ABOUT MEMBERSHIP"}
                </button>
              </div>

              {submitStatus === "success" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-green-600 mt-6"
                >
                  Thank you for your enquiry! Our team will be in touch shortly to discuss your membership options.
                </motion.p>
              )}

              {submitStatus === "error" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-red-600 mt-6"
                >
                  Something went wrong. Please try again.
                </motion.p>
              )}
            </motion.form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
