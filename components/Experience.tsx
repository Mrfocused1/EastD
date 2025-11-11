"use client";

import { motion } from "framer-motion";
import { Crown, Wine, Utensils, Diamond } from "lucide-react";

const features = [
  {
    icon: Crown,
    title: "Personalized Service",
    description: "Personal on hand experts ready and waiting to create perfection.",
  },
  {
    icon: Wine,
    title: "Drinks",
    description: "Providing a range of non-alcoholic and alcoholic drinks.",
  },
  {
    icon: Utensils,
    title: "Canapés",
    description: "Half Day or Full Day booking includes a selection of delicious Canapés.",
  },
  {
    icon: Diamond,
    title: "Exclusivity",
    description: "We offer tailor made looks exclusive to each brand.",
  },
];

export default function Experience() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <p className="text-sm tracking-[0.3em] text-black mb-6 uppercase">
                Exclusive
              </p>
              <h2 className="text-5xl lg:text-6xl font-light text-black mb-8 leading-tight">
                Your Vision, Our Space
              </h2>
              <div className="w-16 h-px bg-black/30 mx-auto lg:mx-0 mb-8"></div>
              <p className="text-base text-black leading-relaxed max-w-lg mx-auto lg:mx-0">
                Our three sets let you film multiple projects in one session. Modular furnishings, expert
                lighting, and professional equipment make it perfect for live streams, interviews, online
                shows, talking head shots, beauty content, and photography.
                Every session is tailor-made to your vision — a polished, flexible space where creativity thrives.
              </p>
            </motion.div>

            {/* Right Column - Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center border border-black/10"
                >
                  <div className="flex justify-center mb-4">
                    <feature.icon className="w-12 h-12 text-black" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium text-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-black leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
