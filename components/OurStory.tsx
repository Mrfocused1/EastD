"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const services = [
  {
    title: "PODCASTS",
    image: "https://images.pexels.com/photos/7034272/pexels-photo-7034272.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "VOICEOVERS",
    image: "https://images.pexels.com/photos/7087833/pexels-photo-7087833.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "COMMERCIALS",
    image: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "INTERVIEWS",
    image: "https://images.pexels.com/photos/5717546/pexels-photo-5717546.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "DOCUMENTARIES",
    image: "https://images.pexels.com/photos/7991316/pexels-photo-7991316.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "ROUND TABLES",
    image: "https://images.pexels.com/photos/7034620/pexels-photo-7034620.jpeg?auto=compress&cs=tinysrgb&w=800"
  }
];

export default function OurStory() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={`service-${service.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative h-[350px] overflow-hidden group cursor-pointer"
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h3 className="text-3xl font-light mb-6 text-white tracking-wider">{service.title}</h3>
                <Link
                  href="/booking"
                  className="border-2 border-white text-white px-8 py-2 text-xs tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300"
                >
                  BOOK NOW
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
