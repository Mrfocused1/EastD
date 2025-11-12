"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Ruler, Users, Camera, Palette } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const studioFeatures = [
  {
    icon: Ruler,
    title: "22ft x 20ft Studio",
    description: "Spacious layout perfect for any production"
  },
  {
    icon: Users,
    title: "1-4 Person Layout",
    description: "Intimate setting for focused shoots"
  },
  {
    icon: Camera,
    title: "2-4 Camera Set-Up",
    description: "Professional multi-cam capabilities"
  },
  {
    icon: Palette,
    title: "Customisable Backdrop",
    description: "Tailor the set to your vision"
  }
];

export default function E16Page() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fdfbf8]">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="E16 SET"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <p className="text-sm tracking-[0.3em] mb-4 text-white">EASTDOC STUDIOS</p>
            <h1 className="text-7xl font-light tracking-wider mb-8 text-white">E16 SET</h1>
            <Link
              href="/booking?studio=e16"
              className="inline-block border-2 border-white px-8 py-3 text-sm tracking-widest text-white hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
            >
              BOOK NOW
            </Link>
          </motion.div>
        </div>
      </section>

      {/* The Studio Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm tracking-[0.3em] text-black mb-4">THE STUDIO</p>
            <h2 className="text-5xl font-light text-black mb-6">E16 SET</h2>
            <div className="w-24 h-px bg-black/30 mx-auto mb-8"></div>
            <p className="max-w-3xl mx-auto text-black leading-relaxed">
              A vintage leather sofa in a lush, deep green color creates an ambiance reminiscent of an
              exclusive lounge. The large sofa can accommodate up to four guests. Enhance the atmosphere
              with your choice of art décor or vintage industrial-inspired lighting.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {studioFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 text-center border border-black/10"
              >
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-black" strokeWidth={1} />
                <h3 className="text-lg font-medium mb-2 text-black">{feature.title}</h3>
                <p className="text-sm text-black">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Pricing"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm tracking-[0.3em] text-white/80 mb-4">EASTDOC STUDIOS</p>
            <h2 className="text-5xl font-light text-white">PRICING</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { title: "STANDARD", price: "£70", duration: "(Min 2 Hours)", details: ["Comes with Setup Engineer", "2x BMPCC 6K Cameras", "Professional Lighting", "Up to 4 Mics", "Files sent in 24hours"] },
              { title: "HALF DAY", price: "£200", duration: "(4 Hours)", details: ["Comes with Setup Engineer", "2x BMPCC 6K Cameras", "Professional Lighting", "Up to 4 Mics", "Files sent in 24hours"] },
              { title: "FULL DAY", price: "£400", duration: "(8 Hours)", details: ["Comes with Setup Engineer", "2x BMPCC 6K Cameras", "Professional Lighting", "Up to 4 Mics", "Files sent in 48hours"] }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="border-2 border-white p-8 text-center text-white"
              >
                <h3 className="text-2xl font-light mb-4 text-white">{plan.title}</h3>
                <p className="text-4xl font-light mb-2 text-white">{plan.price}</p>
                <p className="text-sm mb-2 text-white">excl. VAT</p>
                <p className="text-sm mb-6 text-white">{plan.duration}</p>
                <div className="space-y-2 mb-8">
                  {plan.details.map((detail, i) => (
                    <p key={i} className="text-sm text-white">- {detail}</p>
                  ))}
                </div>
                <Link
                  href="/booking?studio=e16"
                  className="inline-block border border-white px-6 py-2 text-xs tracking-widest text-white hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
                >
                  BOOK NOW
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-0"
          >
            <h2 className="text-5xl font-light text-black">Gallery</h2>
          </motion.div>

          {/* Scrolling Gallery Cards */}
          <div className="relative h-[450px] flex items-center justify-center -mt-12">
            <div className="relative w-[1200px]" style={{ left: '100px' }}>
              {[
                {
                  image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
                  translateXPercent: -121.72,
                  translateYPercent: -24.99,
                },
                {
                  image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
                  translateXPercent: 0,
                  translateYPercent: -11.91,
                },
                {
                  image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
                  translateXPercent: 108.9,
                  translateYPercent: 0,
                },
                {
                  image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
                  translateXPercent: 246.43,
                  translateYPercent: -18.5,
                },
                {
                  image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
                  translateXPercent: 355.33,
                  translateYPercent: -8.2,
                },
              ].map((item, index) => {
                const leftPx = (280 * item.translateXPercent) / 100;
                const topPx = (340 * item.translateYPercent) / 100;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    style={{
                      position: 'absolute',
                      left: `${leftPx}px`,
                      top: `${topPx}px`,
                    }}
                    className="transition-transform hover:scale-105"
                  >
                    <div className="rounded-xl overflow-hidden w-[280px] h-[340px] shadow-2xl relative">
                      <Image
                        src={item.image}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
