"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const studios = [
  {
    id: "e16",
    title: "E16 SET",
    subtitle: "Studio 1",
    image: "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Professional studio space in East London",
  },
  {
    id: "e20",
    title: "E20 SET",
    subtitle: "Studio 2",
    image: "https://images.pexels.com/photos/6957097/pexels-photo-6957097.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "State-of-the-art recording facility",
  },
  {
    id: "lux",
    title: "LUX SET",
    subtitle: "Studio 3",
    image: "https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description: "Premium luxury studio experience",
  },
];

export default function Studios() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-black tracking-widest mb-2">EASTDOC STUDIOS</p>
          <h2 className="text-5xl font-light text-black mb-6">OUR STUDIOS</h2>
          <div className="w-24 h-px bg-black/30 mx-auto"></div>
        </motion.div>

        {/* Studio Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {studios.map((studio, index) => (
            <motion.div
              key={studio.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="group cursor-pointer"
            >
              <div className="relative h-[500px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                <Image
                  src={studio.image}
                  alt={studio.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Title and Button Overlay */}
                <div className="absolute inset-0 z-20 flex flex-col justify-end items-center md:items-start p-8">
                  <h3 className="text-3xl font-light text-white mb-6 tracking-wider text-center md:text-left">{studio.title}</h3>
                  <Link
                    href={`/studios/${studio.id}`}
                    className="border-2 border-white text-white px-8 py-3 text-sm tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300 w-fit text-center"
                  >
                    {studio.subtitle}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
