"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studiosDropdownOpen, setStudiosDropdownOpen] = useState(false);
  const [mobileStudiosOpen, setMobileStudiosOpen] = useState(false);
  const [studioTitles, setStudioTitles] = useState({
    e16: "E16 SET",
    e20: "E20 SET",
    lux: "LUX SET",
    photography: "Photography",
  });

  useEffect(() => {
    async function loadStudioTitles() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value')
          .eq('page', 'global')
          .eq('section', 'settings')
          .in('key', ['e16_title', 'e20_title', 'lux_title', 'photography_title']);

        if (error) {
          console.error('Error loading studio titles:', error);
          return;
        }

        if (data && data.length > 0) {
          const newTitles = { e16: "E16 SET", e20: "E20 SET", lux: "LUX SET", photography: "Photography" };
          data.forEach((item: { key: string; value: string }) => {
            if (item.key === 'e16_title') newTitles.e16 = item.value;
            if (item.key === 'e20_title') newTitles.e20 = item.value;
            if (item.key === 'lux_title') newTitles.lux = item.value;
            if (item.key === 'photography_title') newTitles.photography = item.value;
          });
          setStudioTitles(newTitles);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadStudioTitles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm px-6 py-3 md:px-[100px] md:py-0"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="md:-ml-[50px]">
            <Image
              src="/10.png"
              alt="EASTDOCK Studios"
              width={150}
              height={60}
              className="object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#contact"
              className="text-white font-roboto text-sm tracking-wider hover:text-[#DC143C] transition-colors"
            >
              CONTACT
            </Link>

            <Link
              href="/gallery"
              className="text-white font-roboto text-sm tracking-wider hover:text-[#DC143C] transition-colors"
            >
              GALLERY
            </Link>

            <Link
              href="/membership"
              className="text-white font-roboto text-sm tracking-wider hover:text-[#DC143C] transition-colors"
            >
              MEMBERSHIP
            </Link>

            {/* Studios Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setStudiosDropdownOpen(true)}
              onMouseLeave={() => setStudiosDropdownOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-white font-roboto text-sm tracking-wider hover:text-[#DC143C] transition-colors"
              >
                STUDIOS FOR HIRE
                <ChevronDown className={`w-4 h-4 transition-transform ${studiosDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {studiosDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 bg-black/95 backdrop-blur-sm border border-white/10 min-w-[180px]"
                  >
                    <Link
                      href="/studios/e16"
                      className="block px-6 py-3 text-white font-roboto text-sm tracking-wider hover:bg-[#DC143C] transition-colors"
                    >
                      {studioTitles.e16}
                    </Link>
                    <Link
                      href="/studios/e20"
                      className="block px-6 py-3 text-white font-roboto text-sm tracking-wider hover:bg-[#DC143C] transition-colors"
                    >
                      {studioTitles.e20}
                    </Link>
                    <Link
                      href="/studios/lux"
                      className="block px-6 py-3 text-white font-roboto text-sm tracking-wider hover:bg-[#DC143C] transition-colors"
                    >
                      {studioTitles.lux}
                    </Link>
                    <Link
                      href="/studios/photography"
                      className="block px-6 py-3 text-white font-roboto text-sm tracking-wider hover:bg-[#DC143C] transition-colors"
                    >
                      {studioTitles.photography}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Desktop Book Now Button */}
          <Link
            href="/booking"
            className="hidden md:block border border-white text-white px-6 py-2 text-xs tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
          >
            BOOK NOW!
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-md md:hidden"
            style={{ top: '60px' }}
          >
            <nav className="flex flex-col items-center justify-center h-full space-y-6 px-6">
              <Link
                href="/#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-roboto text-lg tracking-wider hover:text-[#DC143C] transition-colors"
              >
                CONTACT
              </Link>

              <Link
                href="/gallery"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-roboto text-lg tracking-wider hover:text-[#DC143C] transition-colors"
              >
                GALLERY
              </Link>

              <Link
                href="/membership"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-roboto text-lg tracking-wider hover:text-[#DC143C] transition-colors"
              >
                MEMBERSHIP
              </Link>

              {/* Mobile Studios Accordion */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setMobileStudiosOpen(!mobileStudiosOpen)}
                  className="flex items-center gap-2 text-white font-roboto text-lg tracking-wider hover:text-[#DC143C] transition-colors"
                >
                  STUDIOS FOR HIRE
                  <ChevronDown className={`w-5 h-5 transition-transform ${mobileStudiosOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {mobileStudiosOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center space-y-4 mt-4 overflow-hidden"
                    >
                      <Link
                        href="/studios/e16"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-white/80 font-roboto text-base tracking-wider hover:text-[#DC143C] transition-colors"
                      >
                        {studioTitles.e16}
                      </Link>
                      <Link
                        href="/studios/e20"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-white/80 font-roboto text-base tracking-wider hover:text-[#DC143C] transition-colors"
                      >
                        {studioTitles.e20}
                      </Link>
                      <Link
                        href="/studios/lux"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-white/80 font-roboto text-base tracking-wider hover:text-[#DC143C] transition-colors"
                      >
                        {studioTitles.lux}
                      </Link>
                      <Link
                        href="/studios/photography"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-white/80 font-roboto text-base tracking-wider hover:text-[#DC143C] transition-colors"
                      >
                        {studioTitles.photography}
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="border border-white text-white px-8 py-3 text-sm tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300 mt-4"
              >
                BOOK NOW!
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
