"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              alt="EASTDOC Studios"
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
              href="/studios/e16"
              className="text-white font-roboto text-sm tracking-wider hover:text-[#DC143C] transition-colors"
            >
              E16 SET
            </Link>
            <Link
              href="/studios/e20"
              className="text-white font-roboto text-sm tracking-wider hover:text-[#DC143C] transition-colors"
            >
              E20 SET
            </Link>
            <Link
              href="/studios/lux"
              className="text-white font-roboto text-sm tracking-wider hover:text-[#DC143C] transition-colors"
            >
              LUX SET
            </Link>
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
            <nav className="flex flex-col items-center justify-center h-full space-y-8 px-6">
              <Link
                href="/#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-roboto text-lg tracking-wider hover:text-[#DC143C] transition-colors"
              >
                CONTACT
              </Link>
              <Link
                href="/studios/e16"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-roboto text-lg tracking-wider hover:text-[#DC143C] transition-colors"
              >
                E16 SET
              </Link>
              <Link
                href="/studios/e20"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-roboto text-lg tracking-wider hover:text-[#DC143C] transition-colors"
              >
                E20 SET
              </Link>
              <Link
                href="/studios/lux"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-roboto text-lg tracking-wider hover:text-[#DC143C] transition-colors"
              >
                LUX SET
              </Link>
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="border border-white text-white px-8 py-3 text-sm tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
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
