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
