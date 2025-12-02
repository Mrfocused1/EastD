"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FocalPoints, DEFAULT_FOCAL_POINTS } from "@/hooks/useFocalPoint";
import FocalPointImage from "./FocalPointImage";

interface Member {
  id: string;
  name: string;
  role: string;
  color: string;
  image: string;
  focalPoints?: FocalPoints;
  translateXPercent: number;
  translateYPercent: number;
  rotation: number;
  parallaxSpeed: number;
  zIndex: number;
}

// Default members as fallback
const defaultMembers: Member[] = [
  {
    id: "member-1",
    name: "Sarah Chen",
    role: "Content Creator",
    color: "#8b5a4a",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
    focalPoints: DEFAULT_FOCAL_POINTS,
    translateXPercent: -121.72,
    translateYPercent: -24.99,
    rotation: 0,
    parallaxSpeed: 0.3,
    zIndex: 5,
  },
  {
    id: "member-2",
    name: "Marcus Williams",
    role: "Director / Producer",
    color: "#c45d4a",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
    focalPoints: DEFAULT_FOCAL_POINTS,
    translateXPercent: 0,
    translateYPercent: -11.91,
    rotation: 0,
    parallaxSpeed: 0.5,
    zIndex: 4,
  },
  {
    id: "member-3",
    name: "Emma Rodriguez",
    role: "Photographer",
    color: "#2d2d2d",
    image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
    focalPoints: DEFAULT_FOCAL_POINTS,
    translateXPercent: 108.9,
    translateYPercent: 0,
    rotation: 0,
    parallaxSpeed: 0.4,
    zIndex: 3,
  },
  {
    id: "member-4",
    name: "David Park",
    role: "Brand Strategist",
    color: "#d4a574",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
    focalPoints: DEFAULT_FOCAL_POINTS,
    translateXPercent: 246.43,
    translateYPercent: -18.5,
    rotation: 0,
    parallaxSpeed: 0.6,
    zIndex: 2,
  },
  {
    id: "member-5",
    name: "Alex Thompson",
    role: "Filmmaker",
    color: "#6b8e7f",
    image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400&h=500",
    focalPoints: DEFAULT_FOCAL_POINTS,
    translateXPercent: 355.33,
    translateYPercent: -8.2,
    rotation: 0,
    parallaxSpeed: 0.35,
    zIndex: 1,
  },
];

function MemberCard({ member, index, scrollYProgress }: { member: typeof defaultMembers[0]; index: number; scrollYProgress: MotionValue<number> }) {
  const parallaxX = useTransform(
    scrollYProgress,
    [0, 1],
    [100, -150 * member.parallaxSpeed]
  );

  // Convert percentage to pixels: 280px card width * percentage / 100
  const leftPx = (280 * member.translateXPercent) / 100;
  const topPx = (340 * member.translateYPercent) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      style={{
        position: 'absolute',
        left: `${leftPx}px`,
        top: `${topPx}px`,
        rotate: member.rotation,
        x: parallaxX,
        zIndex: member.zIndex,
      }}
      className="transition-transform hover:scale-105"
    >
      <div
        className="rounded-xl overflow-hidden w-[280px] h-[340px] shadow-2xl relative"
        style={{
          backgroundColor: member.color,
        }}
      >
        <FocalPointImage
          src={member.image}
          alt={member.name}
          focalPoints={member.focalPoints || DEFAULT_FOCAL_POINTS}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        {/* Text positioned inside card at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center z-10">
          <h3 className="text-2xl font-semibold mb-1 font-lora italic">
            {member.name}
          </h3>
          <p className="text-sm opacity-90">{member.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface ClientsContent {
  subtitle: string;
  title: string;
}

export default function MembersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const [content, setContent] = useState<ClientsContent>({
    subtitle: "OUR CLIENTS",
    title: "THE CREATIVES WHO MAKE EAST DOCK STUDIOS THEIR PRODUCTION HOME.",
  });

  const [members, setMembers] = useState(defaultMembers);

  useEffect(() => {
    async function loadContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('key, value, type')
          .eq('page', 'homepage')
          .eq('section', 'clients');

        if (error) {
          console.error('Error loading clients content:', error);
          return;
        }

        if (data && data.length > 0) {
          const newContentData: { subtitle?: string; title?: string } = {};
          data.forEach((item: { key: string; value: string; type?: string }) => {
            if (item.key === 'subtitle') newContentData.subtitle = item.value;
            if (item.key === 'title') newContentData.title = item.value;

            // Load members array from database
            if (item.key === 'members' && item.type === 'array') {
              try {
                const membersData = JSON.parse(item.value);
                if (Array.isArray(membersData) && membersData.length > 0) {
                  setMembers(membersData);
                }
              } catch (err) {
                console.error('Error parsing members data:', err);
              }
            }
          });

          if (newContentData.subtitle || newContentData.title) {
            setContent({
              subtitle: newContentData.subtitle || content.subtitle,
              title: newContentData.title || content.title,
            });
          }
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }

    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={sectionRef} className="pt-32 pb-48 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center -mb-16"
        >
          <p className="text-sm text-black tracking-widest mb-2">{content.subtitle}</p>
          <h2 className="text-5xl font-light text-black mb-6">
            {content.title}
          </h2>
          <div className="w-24 h-px bg-black/30 mx-auto"></div>
        </motion.div>

        {/* Scrolling Members with individual parallax */}
        <div className="relative h-[450px] flex items-center justify-center">
          <div className="relative w-[1200px]" style={{ left: '100px' }}>
            {members.map((member, index) => (
              <MemberCard key={member.id || `member-${index}`} member={member} index={index} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
