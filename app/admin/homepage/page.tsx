"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import Section from "@/components/admin/Section";
import TextInput from "@/components/admin/TextInput";
import ImageUpload, { FocalPoints, DEFAULT_FOCAL_POINTS } from "@/components/admin/ImageUpload";
import SaveButton from "@/components/admin/SaveButton";
import { supabase } from "@/lib/supabase";
import { stringifyFocalPoints, parseFocalPoints } from "@/hooks/useFocalPoint";

export default function HomepageEditor() {
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoadedFromDB, setDataLoadedFromDB] = useState(false);

  // Hero section state - 5 slideshow images with focal points
  const [heroImages, setHeroImages] = useState([
    "/BLACKPR%20X%20WANNI171.JPG",
    "",
    "",
    "",
    "",
  ]);
  const [heroImageFocalPoints, setHeroImageFocalPoints] = useState<FocalPoints[]>([
    DEFAULT_FOCAL_POINTS,
    DEFAULT_FOCAL_POINTS,
    DEFAULT_FOCAL_POINTS,
    DEFAULT_FOCAL_POINTS,
    DEFAULT_FOCAL_POINTS,
  ]);
  const [heroTagline, setHeroTagline] = useState("BESPOKE STUDIO HIRE");

  // Welcome section state
  const [welcomeSubtitle, setWelcomeSubtitle] = useState("EASTDOCK STUDIOS");
  const [welcomeTitle, setWelcomeTitle] = useState("WELCOME");
  const [welcomeText, setWelcomeText] = useState(
    "Welcome to East Dock Studios Premium Studio High where creativity meets craftsmanship. High-end production quality is now within reach."
  );

  // Experience section state
  const [experienceSubtitle, setExperienceSubtitle] = useState("Exclusive");
  const [experienceTitle, setExperienceTitle] = useState("Your Vision, Our Space");
  const [experienceText, setExperienceText] = useState(
    "Our three sets let you film multiple projects in one session. Modular furnishings, expert lighting, and professional equipment make it perfect for live streams, interviews, online shows, talking head shots, beauty content, and photography. Every session is tailor-made to your vision — a polished, flexible space where creativity thrives."
  );

  // Studios section state with focal points
  const [studiosSubtitle, setStudiosSubtitle] = useState("EASTDOCK STUDIOS");
  const [studiosTitle, setStudiosTitle] = useState("OUR STUDIOS");
  const [studio1Image, setStudio1Image] = useState("/BLACKPR%20X%20WANNI121.JPG");
  const [studio1ImageFocal, setStudio1ImageFocal] = useState<FocalPoints>(DEFAULT_FOCAL_POINTS);
  const [studio1Title, setStudio1Title] = useState("E16 SET");
  const [studio2Image, setStudio2Image] = useState("/BLACKPR%20X%20WANNI174.JPG");
  const [studio2ImageFocal, setStudio2ImageFocal] = useState<FocalPoints>(DEFAULT_FOCAL_POINTS);
  const [studio2Title, setStudio2Title] = useState("E20 SET");
  const [studio3Image, setStudio3Image] = useState("https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=1200");
  const [studio3ImageFocal, setStudio3ImageFocal] = useState<FocalPoints>(DEFAULT_FOCAL_POINTS);
  const [studio3Title, setStudio3Title] = useState("LUX SET");

  // Clients section state
  const [clientsSubtitle, setClientsSubtitle] = useState("OUR CLIENTS");
  const [clientsTitle, setClientsTitle] = useState("THE CREATIVES WHO MAKE EAST DOCK STUDIOS THEIR PRODUCTION HOME.");

  // Services/Capabilities section
  const [services, setServices] = useState([
    { title: "PODCASTS", image: "https://images.pexels.com/photos/7034272/pexels-photo-7034272.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { title: "VOICEOVERS", image: "https://images.pexels.com/photos/7087833/pexels-photo-7087833.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { title: "COMMERCIALS", image: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { title: "INTERVIEWS", image: "https://images.pexels.com/photos/5717546/pexels-photo-5717546.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { title: "DOCUMENTARIES", image: "https://images.pexels.com/photos/7991316/pexels-photo-7991316.jpeg?auto=compress&cs=tinysrgb&w=800" },
    { title: "ROUND TABLES", image: "https://images.pexels.com/photos/7034620/pexels-photo-7034620.jpeg?auto=compress&cs=tinysrgb&w=800" },
  ]);

  // Members state (scrolling images)
  // IMPORTANT: Initial state is synced with database (last updated: 2026-01-02)
  // These values are loaded from Supabase on component mount
  // The useEffect below will override these with current database values
  const [members, setMembers] = useState([
    {
      id: "member-1",
      name: "The Uncut Podcast",
      role: "Podcasters / Content Creators",
      color: "#8b5a4a",
      image: "https://fhgvnjwiasusjfevimcw.supabase.co/storage/v1/object/public/images/uploads/1767373182873-bczdftgd0vn.jpg",
      translateXPercent: -121.72,
      translateYPercent: -24.99,
      rotation: 0,
      parallaxSpeed: 0.3,
      zIndex: 5,
    },
    {
      id: "member-2",
      name: "BMoni & Mr Ugandan Shnack",
      role: "Online Personality & Fashion Model",
      color: "#c45d4a",
      image: "https://fhgvnjwiasusjfevimcw.supabase.co/storage/v1/object/public/images/uploads/1767373193356-wmn2zmh4nac.jpg",
      translateXPercent: 0,
      translateYPercent: -11.91,
      rotation: 0,
      parallaxSpeed: 0.5,
      zIndex: 4,
    },
    {
      id: "member-3",
      name: "Get the Gist Podcast",
      role: "Podcasters / Content Creators",
      color: "#2d2d2d",
      image: "https://fhgvnjwiasusjfevimcw.supabase.co/storage/v1/object/public/images/uploads/1767373200589-4dwqjv7wsgu.jpg",
      translateXPercent: 108.9,
      translateYPercent: 0,
      rotation: 0,
      parallaxSpeed: 0.4,
      zIndex: 3,
    },
    {
      id: "member-4",
      name: "Septimus ",
      role: "Content Creator",
      color: "#d4a574",
      image: "https://fhgvnjwiasusjfevimcw.supabase.co/storage/v1/object/public/images/uploads/1767375442358-2i2e0uale9h.jpg",
      translateXPercent: 246.43,
      translateYPercent: -18.5,
      rotation: 0,
      parallaxSpeed: 0.6,
      zIndex: 2,
    },
    {
      id: "member-5",
      name: "Ratings & Reviews",
      role: "Youtube Show",
      color: "#6b8e7f",
      image: "https://fhgvnjwiasusjfevimcw.supabase.co/storage/v1/object/public/images/uploads/1767375448034-ja8z6veuvpg.jpg",
      translateXPercent: 355.33,
      translateYPercent: -8.2,
      rotation: 0,
      parallaxSpeed: 0.35,
      zIndex: 1,
    },
  ]);

  const [hasChanges, setHasChanges] = useState(false);

  // Load content from Supabase on mount
  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .eq('page', 'homepage');

        if (error) {
          console.error('Error loading content:', error);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          data.forEach((item: { section: string; key: string; value: string }) => {
            const { section, key, value } = item;

            // Hero section - support old 'image' key and new hero_image_X keys
            if (section === 'hero' && key === 'tagline') setHeroTagline(value);
            if (section === 'hero' && key === 'image') {
              setHeroImages(prev => {
                const updated = [...prev];
                updated[0] = value;
                return updated;
              });
            }
            if (section === 'hero' && key.startsWith('hero_image_') && !key.endsWith('_focal')) {
              const index = parseInt(key.replace('hero_image_', '')) - 1;
              if (index >= 0 && index < 5) {
                setHeroImages(prev => {
                  const updated = [...prev];
                  updated[index] = value;
                  return updated;
                });
              }
            }
            // Hero focal points
            if (section === 'hero' && key.startsWith('hero_image_') && key.endsWith('_focal')) {
              const index = parseInt(key.replace('hero_image_', '').replace('_focal', '')) - 1;
              if (index >= 0 && index < 5) {
                setHeroImageFocalPoints(prev => {
                  const updated = [...prev];
                  updated[index] = parseFocalPoints(value);
                  return updated;
                });
              }
            }

            // Welcome section
            if (section === 'welcome' && key === 'subtitle') setWelcomeSubtitle(value);
            if (section === 'welcome' && key === 'title') setWelcomeTitle(value);
            if (section === 'welcome' && key === 'text') setWelcomeText(value);

            // Experience section
            if (section === 'experience' && key === 'subtitle') setExperienceSubtitle(value);
            if (section === 'experience' && key === 'title') setExperienceTitle(value);
            if (section === 'experience' && key === 'text') setExperienceText(value);

            // Studios section
            if (section === 'studios' && key === 'subtitle') setStudiosSubtitle(value);
            if (section === 'studios' && key === 'title') setStudiosTitle(value);
            if (section === 'studios' && key === 'studio1_image') setStudio1Image(value);
            if (section === 'studios' && key === 'studio1_image_focal') setStudio1ImageFocal(parseFocalPoints(value));
            if (section === 'studios' && key === 'studio1_title') setStudio1Title(value);
            if (section === 'studios' && key === 'studio2_image') setStudio2Image(value);
            if (section === 'studios' && key === 'studio2_image_focal') setStudio2ImageFocal(parseFocalPoints(value));
            if (section === 'studios' && key === 'studio2_title') setStudio2Title(value);
            if (section === 'studios' && key === 'studio3_image') setStudio3Image(value);
            if (section === 'studios' && key === 'studio3_image_focal') setStudio3ImageFocal(parseFocalPoints(value));
            if (section === 'studios' && key === 'studio3_title') setStudio3Title(value);

            // Clients section
            if (section === 'clients' && key === 'subtitle') setClientsSubtitle(value);
            if (section === 'clients' && key === 'title') setClientsTitle(value);

            // Members data
            if (section === 'clients' && key === 'members') {
              try {
                const parsedMembers = JSON.parse(value);
                if (Array.isArray(parsedMembers)) {
                  setMembers(parsedMembers);
                }
              } catch (err) {
                console.error('Error parsing members:', err);
              }
            }

            // Services data
            if (section === 'services' && key === 'items') {
              try {
                const parsedServices = JSON.parse(value);
                if (Array.isArray(parsedServices)) {
                  setServices(parsedServices);
                }
              } catch (err) {
                console.error('Error parsing services:', err);
              }
            }
          });
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
        setDataLoadedFromDB(true);
      }
    }

    loadContent();
  }, []);

  const handleSave = async () => {
    // CRITICAL: Prevent saving if data hasn't been loaded from database yet
    // This prevents overwriting database content with stale hardcoded defaults
    if (!dataLoadedFromDB) {
      console.error('Cannot save: Data has not been loaded from database yet');
      throw new Error('Data not loaded from database. Please wait for the page to fully load before saving.');
    }

    const contentToSave = [
      // Hero - 5 slideshow images with focal points
      { page: 'homepage', section: 'hero', key: 'hero_image_1', value: heroImages[0], type: 'image' },
      { page: 'homepage', section: 'hero', key: 'hero_image_1_focal', value: stringifyFocalPoints(heroImageFocalPoints[0]), type: 'text' },
      { page: 'homepage', section: 'hero', key: 'hero_image_2', value: heroImages[1], type: 'image' },
      { page: 'homepage', section: 'hero', key: 'hero_image_2_focal', value: stringifyFocalPoints(heroImageFocalPoints[1]), type: 'text' },
      { page: 'homepage', section: 'hero', key: 'hero_image_3', value: heroImages[2], type: 'image' },
      { page: 'homepage', section: 'hero', key: 'hero_image_3_focal', value: stringifyFocalPoints(heroImageFocalPoints[2]), type: 'text' },
      { page: 'homepage', section: 'hero', key: 'hero_image_4', value: heroImages[3], type: 'image' },
      { page: 'homepage', section: 'hero', key: 'hero_image_4_focal', value: stringifyFocalPoints(heroImageFocalPoints[3]), type: 'text' },
      { page: 'homepage', section: 'hero', key: 'hero_image_5', value: heroImages[4], type: 'image' },
      { page: 'homepage', section: 'hero', key: 'hero_image_5_focal', value: stringifyFocalPoints(heroImageFocalPoints[4]), type: 'text' },
      { page: 'homepage', section: 'hero', key: 'tagline', value: heroTagline, type: 'text' },
      // Welcome
      { page: 'homepage', section: 'welcome', key: 'subtitle', value: welcomeSubtitle, type: 'text' },
      { page: 'homepage', section: 'welcome', key: 'title', value: welcomeTitle, type: 'text' },
      { page: 'homepage', section: 'welcome', key: 'text', value: welcomeText, type: 'text' },
      // Experience
      { page: 'homepage', section: 'experience', key: 'subtitle', value: experienceSubtitle, type: 'text' },
      { page: 'homepage', section: 'experience', key: 'title', value: experienceTitle, type: 'text' },
      { page: 'homepage', section: 'experience', key: 'text', value: experienceText, type: 'text' },
      // Studios with focal points
      { page: 'homepage', section: 'studios', key: 'subtitle', value: studiosSubtitle, type: 'text' },
      { page: 'homepage', section: 'studios', key: 'title', value: studiosTitle, type: 'text' },
      { page: 'homepage', section: 'studios', key: 'studio1_image', value: studio1Image, type: 'image' },
      { page: 'homepage', section: 'studios', key: 'studio1_image_focal', value: stringifyFocalPoints(studio1ImageFocal), type: 'text' },
      { page: 'homepage', section: 'studios', key: 'studio1_title', value: studio1Title, type: 'text' },
      { page: 'homepage', section: 'studios', key: 'studio2_image', value: studio2Image, type: 'image' },
      { page: 'homepage', section: 'studios', key: 'studio2_image_focal', value: stringifyFocalPoints(studio2ImageFocal), type: 'text' },
      { page: 'homepage', section: 'studios', key: 'studio2_title', value: studio2Title, type: 'text' },
      { page: 'homepage', section: 'studios', key: 'studio3_image', value: studio3Image, type: 'image' },
      { page: 'homepage', section: 'studios', key: 'studio3_image_focal', value: stringifyFocalPoints(studio3ImageFocal), type: 'text' },
      { page: 'homepage', section: 'studios', key: 'studio3_title', value: studio3Title, type: 'text' },
      // Clients
      { page: 'homepage', section: 'clients', key: 'subtitle', value: clientsSubtitle, type: 'text' },
      { page: 'homepage', section: 'clients', key: 'title', value: clientsTitle, type: 'text' },
      { page: 'homepage', section: 'clients', key: 'members', value: JSON.stringify(members), type: 'array' },
      // Services/Capabilities
      { page: 'homepage', section: 'services', key: 'items', value: JSON.stringify(services), type: 'array' },
    ];

    try {
      // Use Promise.all for parallel saves - much faster!
      const savePromises = contentToSave.map(item =>
        supabase
          .from('site_content')
          .upsert(
            {
              ...item,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: 'page,section,key',
            }
          )
      );

      const results = await Promise.all(savePromises);

      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        console.error('Save errors:', errors);
        throw new Error(`Failed to save ${errors.length} item(s)`);
      }

      setHasChanges(false);
    } catch (err) {
      console.error('Save failed:', err);
      throw err;
    }
  };

  const markChanged = () => setHasChanges(true);

  // Memoized member update handlers
  const updateMemberField = useCallback((index: number, field: string, value: string) => {
    setMembers(prev => {
      const newMembers = [...prev];
      newMembers[index] = { ...newMembers[index], [field]: value };
      return newMembers;
    });
    markChanged();
  }, []);

  // Service update handler
  const updateServiceField = useCallback((index: number, field: 'title' | 'image', value: string) => {
    setServices(prev => {
      const newServices = [...prev];
      newServices[index] = { ...newServices[index], [field]: value };
      return newServices;
    });
    markChanged();
  }, []);

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
            <h1 className="text-4xl font-light text-black">Homepage</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
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
          <Section title="Hero Section" description="Slideshow banner with 5 rotating background images">
            <p className="text-sm text-black/60 mb-4">
              Upload up to 5 images that will fade in and out automatically. Images cycle every 5 seconds.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {heroImages.map((image, index) => (
                <ImageUpload
                  key={`hero-image-${index}`}
                  label={`Slideshow Image ${index + 1}`}
                  value={image}
                  onChange={(v) => {
                    setHeroImages(prev => {
                      const updated = [...prev];
                      updated[index] = v;
                      return updated;
                    });
                    markChanged();
                  }}
                  focalPoints={heroImageFocalPoints[index]}
                  onFocalPointsChange={(fp) => {
                    setHeroImageFocalPoints(prev => {
                      const updated = [...prev];
                      updated[index] = fp;
                      return updated;
                    });
                    markChanged();
                  }}
                />
              ))}
            </div>
            <TextInput
              label="Tagline"
              value={heroTagline}
              onChange={(v) => { setHeroTagline(v); markChanged(); }}
              placeholder="Enter tagline text"
            />
          </Section>
        </motion.div>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Section title="Welcome Section" description="Introduction text below the hero">
            <TextInput
              label="Subtitle"
              value={welcomeSubtitle}
              onChange={(v) => { setWelcomeSubtitle(v); markChanged(); }}
            />
            <TextInput
              label="Title"
              value={welcomeTitle}
              onChange={(v) => { setWelcomeTitle(v); markChanged(); }}
            />
            <TextInput
              label="Description"
              value={welcomeText}
              onChange={(v) => { setWelcomeText(v); markChanged(); }}
              multiline
              rows={4}
            />
          </Section>
        </motion.div>

        {/* Experience Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Section title="Experience Section" description="Your Vision, Our Space content">
            <TextInput
              label="Subtitle"
              value={experienceSubtitle}
              onChange={(v) => { setExperienceSubtitle(v); markChanged(); }}
            />
            <TextInput
              label="Title"
              value={experienceTitle}
              onChange={(v) => { setExperienceTitle(v); markChanged(); }}
            />
            <TextInput
              label="Description"
              value={experienceText}
              onChange={(v) => { setExperienceText(v); markChanged(); }}
              multiline
              rows={5}
            />
          </Section>
        </motion.div>

        {/* Studios Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Section title="Our Studios Section" description="Studio cards displayed on homepage">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <TextInput
                label="Section Subtitle"
                value={studiosSubtitle}
                onChange={(v) => { setStudiosSubtitle(v); markChanged(); }}
              />
              <TextInput
                label="Section Title"
                value={studiosTitle}
                onChange={(v) => { setStudiosTitle(v); markChanged(); }}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-4 bg-black/5 p-4">
                <h4 className="font-medium text-black">E16 Set Card</h4>
                <ImageUpload
                  label="Image"
                  value={studio1Image}
                  onChange={(v) => { setStudio1Image(v); markChanged(); }}
                  focalPoints={studio1ImageFocal}
                  onFocalPointsChange={(fp) => { setStudio1ImageFocal(fp); markChanged(); }}
                />
                <TextInput
                  label="Title"
                  value={studio1Title}
                  onChange={(v) => { setStudio1Title(v); markChanged(); }}
                />
              </div>

              <div className="space-y-4 bg-black/5 p-4">
                <h4 className="font-medium text-black">E20 Set Card</h4>
                <ImageUpload
                  label="Image"
                  value={studio2Image}
                  onChange={(v) => { setStudio2Image(v); markChanged(); }}
                  focalPoints={studio2ImageFocal}
                  onFocalPointsChange={(fp) => { setStudio2ImageFocal(fp); markChanged(); }}
                />
                <TextInput
                  label="Title"
                  value={studio2Title}
                  onChange={(v) => { setStudio2Title(v); markChanged(); }}
                />
              </div>

              <div className="space-y-4 bg-black/5 p-4">
                <h4 className="font-medium text-black">LUX Set Card</h4>
                <ImageUpload
                  label="Image"
                  value={studio3Image}
                  onChange={(v) => { setStudio3Image(v); markChanged(); }}
                  focalPoints={studio3ImageFocal}
                  onFocalPointsChange={(fp) => { setStudio3ImageFocal(fp); markChanged(); }}
                />
                <TextInput
                  label="Title"
                  value={studio3Title}
                  onChange={(v) => { setStudio3Title(v); markChanged(); }}
                />
              </div>
            </div>
          </Section>
        </motion.div>

        {/* Services/Capabilities Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Section title="Services/Capabilities" description="Service cards shown on homepage and about page">
            <p className="text-sm text-black/60 mb-4">
              These service cards appear in the capabilities section. Edit titles and images for each service type.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service, index) => (
                <div key={`service-${index}`} className="p-4 bg-black/5 border border-black/10 rounded-lg space-y-4">
                  <TextInput
                    label="Service Title"
                    value={service.title}
                    onChange={(v) => updateServiceField(index, 'title', v)}
                  />
                  <ImageUpload
                    label="Service Image"
                    value={service.image}
                    onChange={(v) => updateServiceField(index, 'image', v)}
                    showFocalPointPicker={false}
                  />
                </div>
              ))}
            </div>
          </Section>
        </motion.div>

        {/* Clients Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <Section title="Our Clients Section" description="Client showcase section">
            <TextInput
              label="Subtitle"
              value={clientsSubtitle}
              onChange={(v) => { setClientsSubtitle(v); markChanged(); }}
            />
            <TextInput
              label="Title"
              value={clientsTitle}
              onChange={(v) => { setClientsTitle(v); markChanged(); }}
            />
          </Section>
        </motion.div>

        {/* Members Section (Scrolling Images) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <Section title="Scrolling Member Cards" description="Edit the scrolling member images and details">
            <div className="space-y-6">
              {members.map((member, index) => (
                <div key={member.id || `member-${index}`} className="p-6 bg-black/5 border border-black/10 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-black text-lg">Member {index + 1}</h4>
                    <span className="text-sm text-black/50">z-index: {member.zIndex}</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <ImageUpload
                      label="Image"
                      value={member.image}
                      onChange={(v) => updateMemberField(index, 'image', v)}
                    />
                    <div className="space-y-4">
                      <TextInput
                        label="Name"
                        value={member.name}
                        onChange={(v) => updateMemberField(index, 'name', v)}
                      />
                      <TextInput
                        label="Role"
                        value={member.role}
                        onChange={(v) => updateMemberField(index, 'role', v)}
                      />
                      <div>
                        <label className="block text-sm text-black/60 mb-2">Card Color</label>
                        <input
                          type="color"
                          value={member.color}
                          onChange={(e) => updateMemberField(index, 'color', e.target.value)}
                          className="h-10 w-full border border-black/20 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
