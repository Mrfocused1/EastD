"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Studios from "@/components/Studios";
import OurStory from "@/components/OurStory";
import MembersSection from "@/components/MembersSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PageLoader from "@/components/PageLoader";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { supabase } from "@/lib/supabase";

interface WelcomeContent {
  subtitle: string;
  title: string;
  text: string;
}

interface HomepageImages {
  heroImage: string;
  studio1Image: string;
  studio2Image: string;
  studio3Image: string;
}

export default function Home() {
  const [welcomeContent, setWelcomeContent] = useState<WelcomeContent>({
    subtitle: "EASTDOCK STUDIOS",
    title: "WELCOME",
    text: "Welcome to East Dock Studios Premium Studio High where creativity meets craftsmanship. High-end production quality is now within reach.",
  });
  const [images, setImages] = useState<HomepageImages>({
    heroImage: "",
    studio1Image: "",
    studio2Image: "",
    studio3Image: "",
  });
  const [contentLoaded, setContentLoaded] = useState(false);

  // Build dynamic image preload array from loaded content
  const imagesToPreload = useMemo(() => {
    const imageList = [
      images.heroImage,
      images.studio1Image,
      images.studio2Image,
      images.studio3Image,
    ].filter(Boolean); // Filter out empty strings
    return imageList;
  }, [images.heroImage, images.studio1Image, images.studio2Image, images.studio3Image]);

  // Only start preloading after content is loaded
  const imagesLoading = useImagePreloader(contentLoaded ? imagesToPreload : []);
  const isLoading = !contentLoaded || imagesLoading;

  useEffect(() => {
    async function loadContent() {
      try {
        // Load all homepage content (welcome section + images)
        const { data, error } = await supabase
          .from('site_content')
          .select('section, key, value')
          .eq('page', 'homepage')
          .in('section', ['welcome', 'hero', 'studios']);

        if (error) {
          console.error('Error loading homepage content:', error);
          setContentLoaded(true);
          return;
        }

        if (data && data.length > 0) {
          const newWelcomeContent = { ...welcomeContent };
          const newImages = { ...images };

          data.forEach((item: { section: string; key: string; value: string }) => {
            // Welcome section
            if (item.section === 'welcome') {
              if (item.key === 'subtitle') newWelcomeContent.subtitle = item.value;
              if (item.key === 'title') newWelcomeContent.title = item.value;
              if (item.key === 'text') newWelcomeContent.text = item.value;
            }

            // Hero section
            if (item.section === 'hero' && item.key === 'image') {
              newImages.heroImage = item.value;
            }

            // Studios section
            if (item.section === 'studios') {
              if (item.key === 'studio1_image') newImages.studio1Image = item.value;
              if (item.key === 'studio2_image') newImages.studio2Image = item.value;
              if (item.key === 'studio3_image') newImages.studio3Image = item.value;
            }
          });

          setWelcomeContent(newWelcomeContent);
          setImages(newImages);
        }
        setContentLoaded(true);
      } catch (err) {
        console.error('Error:', err);
        setContentLoaded(true);
      }
    }

    loadContent();
  }, []);

  return (
    <main className="min-h-screen">
      <PageLoader isLoading={isLoading} />
      <Header />
      <Hero />

      {/* Welcome Section */}
      <section id="welcome" className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p className="text-sm text-black tracking-widest mb-2">{welcomeContent.subtitle}</p>
          <h2 className="text-5xl font-light text-black mb-8">{welcomeContent.title}</h2>
          <div className="w-24 h-px bg-black/30 mx-auto mb-12"></div>
          <p className="text-lg text-black leading-relaxed italic mb-8">
            "{welcomeContent.text}"
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <a href="#" className="w-10 h-10 border border-black/30 flex items-center justify-center hover:bg-[#DC143C] hover:text-white hover:border-[#DC143C] transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
              </svg>
            </a>
            <a href="#" className="w-10 h-10 border border-black/30 flex items-center justify-center hover:bg-[#DC143C] hover:text-white hover:border-[#DC143C] transition-all duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      <OurStory />
      <Studios />
      <MembersSection />
      <Contact />
      <Footer />
    </main>
  );
}
