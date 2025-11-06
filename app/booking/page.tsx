"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const studios = [
  { value: "e16", label: "E16 SET", image: "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { value: "e20", label: "E20 SET", image: "https://images.pexels.com/photos/6957097/pexels-photo-6957097.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { value: "lux", label: "LUX SET", image: "https://images.pexels.com/photos/6957089/pexels-photo-6957089.jpeg?auto=compress&cs=tinysrgb&w=800" }
];

function BookingContent() {
  const searchParams = useSearchParams();
  const preselectedStudio = searchParams.get("studio");

  const [selectedStudio, setSelectedStudio] = useState(preselectedStudio || "");
  const [formData, setFormData] = useState({
    bookingType: "",
    audio: [] as string[],
    cameras: [] as string[],
    lighting: [] as string[],
    lenses: [] as string[],
    accessories: [] as string[],
    recording: [] as string[],
    name: "",
    date: "",
    mobile: "",
    email: "",
    comments: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ selectedStudio, ...formData });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fdfbf8]">
      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        <Image
          src="https://images.pexels.com/photos/6794963/pexels-photo-6794963.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Booking"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <p className="text-sm tracking-[0.3em] mb-4">REQUEST BOOKING</p>
            <h1 className="text-6xl font-light tracking-wider">SELECT A STUDIO</h1>
            <div className="w-24 h-px bg-white mx-auto mt-6"></div>
          </motion.div>
        </div>
      </section>

      {/* Studio Selection */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {studios.map((studio) => (
              <motion.div
                key={studio.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative h-[400px] overflow-hidden cursor-pointer group ${
                  selectedStudio === studio.value ? 'ring-4 ring-black' : ''
                }`}
                onClick={() => setSelectedStudio(studio.value)}
              >
                <Image
                  src={studio.image}
                  alt={studio.label}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 transition-colors ${
                  selectedStudio === studio.value ? 'bg-black/30' : 'bg-black/50'
                } group-hover:bg-black/40`}></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center mb-4">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z" />
                    </svg>
                  </div>
                  <h3 className="text-4xl font-light mb-4">{studio.label}</h3>
                  <button className="border-2 border-white px-6 py-2 text-xs tracking-widest hover:bg-[#DC143C] hover:border-[#DC143C] transition-all duration-300">
                    {selectedStudio === studio.value ? 'SELECTED' : 'BOOK NOW'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      {selectedStudio && (
        <section className="py-16 bg-[#fdfbf8]">
          <div className="container mx-auto px-6 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-light text-center mb-12">Booking Request</h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Studios & Booking Types */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Studios <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedStudio}
                      onChange={(e) => setSelectedStudio(e.target.value)}
                      className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                      }}
                      required
                    >
                      <option value="">Select</option>
                      {studios.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Booking Types <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.bookingType}
                      onChange={(e) => setFormData({...formData, bookingType: e.target.value})}
                      className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000000' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                      }}
                      required
                    >
                      <option value="">Select</option>
                      <option value="standard">Standard (Min 2 Hours)</option>
                      <option value="half-day">Half Day (4 Hours)</option>
                      <option value="full-day">Full Day (8 Hours)</option>
                    </select>
                  </div>
                </div>

                {/* Equipment & Dry Hire */}
                <div>
                  <h3 className="text-2xl font-light mb-6">Equipment &amp; Dry Hire</h3>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Audio</label>
                      <select className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors cursor-pointer" multiple>
                        <option>Multi Select</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Cameras</label>
                      <select className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors cursor-pointer" multiple>
                        <option>Multi Select</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-2">
                        *All camera hires must include our camera operator @£300 per day
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Lighting</label>
                      <select className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors cursor-pointer" multiple>
                        <option>Multi Select</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Lense/Filters</label>
                      <select className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors cursor-pointer" multiple>
                        <option>Multi Select</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Accessories</label>
                      <select className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors cursor-pointer" multiple>
                        <option>Multi Select</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Recording & Monitoring</label>
                      <select className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors cursor-pointer" multiple>
                        <option>Multi Select</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors"
                      required
                    />
                    <p className="text-xs text-gray-400 mt-1">Enter your name here</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: +1 212-695-1962"
                      value={formData.mobile}
                      onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                      className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Ex: user@website.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white border border-black/20 p-4 focus:outline-none focus:border-black transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Comments */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Write your comment here
                  </label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({...formData, comments: e.target.value})}
                    rows={6}
                    className="w-full bg-white border border-black/20 p-4 resize-none focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <div className="text-left">
                  <button
                    type="submit"
                    className="border-2 border-black px-12 py-4 text-sm tracking-widest hover:bg-[#DC143C] hover:text-white hover:border-[#DC143C] transition-all duration-300"
                  >
                    Submit Now
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </section>
      )}
      </main>
      <Footer />
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}
