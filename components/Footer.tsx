"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface FooterContent {
  dlrStations: { name: string; link: string; walkTime: string }[];
  busStops: { name: string; link: string; routes: string; direction: string }[];
  bikeParking: string;
  carParking: string;
  companyInfo: string;
  copyright: string;
}

export default function Footer() {
  const [content, setContent] = useState<FooterContent>({
    dlrStations: [
      { name: "Royal Victoria DLR Station", link: "https://maps.google.com", walkTime: "approx 1 min walk" },
      { name: "Custom House for ExCeL (DLR & Elizabeth Line)", link: "https://maps.google.com", walkTime: "approx 9-12 min walk" },
    ],
    busStops: [
      { name: "Munday Road / Royal Victoria (Stop J)", link: "https://maps.google.com", direction: "towards Canning Town & beyond", routes: "Bus Nos: 147, 474, N551" },
      { name: "Seagull Lane (Stop S)", link: "https://maps.google.com", direction: "short walk from studio", routes: "Bus No: SCS" },
    ],
    bikeParking: "Cyclists are welcome! Secure bike-parking/locking facilities are available near the studio entrance for chaining your bike safely.",
    carParking: "If you're driving: Park on 232-236 Victoria Dock Road, E16 (opposite Royal Victoria DLR Station) — just a short walk over the bridge to the studio entrance. On-street/driveway spaces near Victoria Dock Road start at approximately £1.10 per hour. (justpark.com)",
    companyInfo: "EASTDOCK STUDIOS is a part of the Acumen International Media Family. Acumen is an Award Winning International Film Production and Distribution media group, specialising in crafting stories and sharing insights from the business world, through the power of cinematic visuals.",
    copyright: "©2024 EASTDOCK STUDIOS Copyright All Rights Reserved.",
  });

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('section, key, value')
          .eq('page', 'global')
          .eq('section', 'footer');

        if (error) {
          console.error('Error loading footer content:', error);
          return;
        }

        if (data && data.length > 0) {
          const newContent = { ...content };
          data.forEach((item: { section: string; key: string; value: string }) => {
            if (item.key === 'dlrStations') {
              try { newContent.dlrStations = JSON.parse(item.value); } catch (e) { console.error('Error parsing dlrStations:', e); }
            }
            if (item.key === 'busStops') {
              try { newContent.busStops = JSON.parse(item.value); } catch (e) { console.error('Error parsing busStops:', e); }
            }
            if (item.key === 'bikeParking') newContent.bikeParking = item.value;
            if (item.key === 'carParking') newContent.carParking = item.value;
            if (item.key === 'companyInfo') newContent.companyInfo = item.value;
            if (item.key === 'copyright') newContent.copyright = item.value;
          });
          setContent(newContent);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadContent();
  }, []);

  return (
    <footer className="bg-[#1c1c1c] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Transport Information */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 text-sm">
            {/* DLR/Rail Stations */}
            <div>
              <h3 className="text-white font-semibold mb-3 tracking-wider">Nearest DLR / Rail Stations</h3>
              <ul className="space-y-2 text-gray-400">
                {content.dlrStations.map((station, index) => (
                  <li key={`dlr-${station.name}-${index}`}>
                    <a href={station.link} target="_blank" rel="noopener noreferrer" className="hover:text-[#DC143C] transition-colors">
                      {station.name}
                    </a>
                    <span className="block text-xs text-gray-500">{station.walkTime}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bus Stops */}
            <div>
              <h3 className="text-white font-semibold mb-3 tracking-wider">Nearest Bus Stops & Routes</h3>
              <ul className="space-y-2 text-gray-400">
                {content.busStops.map((stop, index) => (
                  <li key={`bus-${stop.name}-${index}`}>
                    <a href={stop.link} target="_blank" rel="noopener noreferrer" className="hover:text-[#DC143C] transition-colors">
                      {stop.name}
                    </a>
                    <span className="block text-xs text-gray-500">{stop.direction}</span>
                    <span className="block text-xs text-gray-500">{stop.routes}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bike Parking */}
            <div>
              <h3 className="text-white font-semibold mb-3 tracking-wider">Bike Parking</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                {content.bikeParking}
              </p>
            </div>

            {/* Car Parking */}
            <div>
              <h3 className="text-white font-semibold mb-3 tracking-wider">Car Parking & Driving</h3>
              <div className="text-gray-400 text-xs leading-relaxed space-y-2">
                <p>{content.carParking}</p>
              </div>
            </div>
          </div>

          {/* Download App Banner */}
          <div className="bg-gradient-to-r from-[#DC143C]/20 to-[#DC143C]/10 border border-[#DC143C]/30 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-white font-semibold text-lg tracking-wider mb-1">Download Our App</h3>
                <p className="text-gray-400 text-sm">Book studios on the go with our mobile app</p>
              </div>
              <div className="flex gap-3">
                {/* App Store Button */}
                <a
                  href="#"
                  className="flex items-center gap-2 bg-black border border-gray-600 hover:border-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 leading-none">Download on the</p>
                    <p className="text-sm font-semibold leading-tight">App Store</p>
                  </div>
                </a>
                {/* Google Play Button */}
                <a
                  href="#"
                  className="flex items-center gap-2 bg-black border border-gray-600 hover:border-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 leading-none">GET IT ON</p>
                    <p className="text-sm font-semibold leading-tight">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="text-center border-t border-gray-700 pt-8">
            <div className="flex justify-center gap-6 mb-4">
              <Link
                href="/terms"
                className="text-xs text-gray-400 hover:text-[#DC143C] transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            <p className="text-xs text-gray-500">
              {content.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
