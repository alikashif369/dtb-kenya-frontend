"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface Partner {
  id: number;
  name?: string;
  logoUrl: string;
}

interface PartnersSliderProps {
  partners?: Partner[];
}

export default function PartnersSlider({ partners = [] }: PartnersSliderProps) {
  // Fallback data if no props provided
  const defaultPartners = [
    { id: 101, name: "WWF", logoUrl: "/partners/wwf.png" },
    { id: 102, name: "AKRSP", logoUrl: "/partners/akrsp.jpg" },
    { id: 103, name: "NUST", logoUrl: "/partners/nust.jpg" },
    { id: 104, name: "WeClean", logoUrl: "/partners/weclean.jpg" },
    { id: 105, name: "Ministry of Climate Change", logoUrl: "/logos/logo3.png" }, // Added to ensure length
  ];

  const displayPartners = partners.length > 0 ? partners : defaultPartners;
  
  // Tripling the array to ensure smooth seamless looping even on wide screens
  const marqueePartners = [...displayPartners, ...displayPartners, ...displayPartners, ...displayPartners];

  return (
    <section className="relative w-full overflow-hidden bg-white py-12">
      {/* Gradient Masks for smooth fade in/out */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-linear-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-white to-transparent" />

      <div className="flex w-full">
        <motion.div
          className="flex min-w-full items-center gap-16 px-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 40,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {marqueePartners.map((partner, idx) => (
            <div
              key={`${partner.id}-${idx}`}
              className="group relative flex h-24 w-40 shrink-0 items-center justify-center grayscale transition-all duration-300 hover:grayscale-0 opacity-60 hover:opacity-100"
            >
              <div className="relative h-full w-full">
                {/* 
                  Using standard img tag or Next Image with objectFit contain.
                  Since we don't know exact dimensions, object-contain is key.
                */}
                <Image
                  src={partner.logoUrl}
                  alt={partner.name || "Partner Logo"}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100px, 160px"
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
