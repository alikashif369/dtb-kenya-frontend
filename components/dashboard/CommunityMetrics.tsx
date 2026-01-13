"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Flame,
  Leaf,
  Sun,
  Sprout,
  Users,
  Heart,
  Home,
  Camera,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import type { Site, Photo } from "./types";

interface CommunityMetricsProps {
  site: Site;
  photos: Photo[];
  selectedYear: number | null;
  loading?: boolean;
}

// Initiative type configuration with icons and gradients
const initiativeConfig: Record<
  string,
  { icon: any; gradient: string; iconColor: string; label: string }
> = {
  // Fuel Efficient Stoves variations
  stoves: {
    icon: Flame,
    gradient: "bg-gradient-to-br from-orange-400 to-red-500",
    iconColor: "text-white",
    label: "Fuel Efficient Stoves",
  },
  "Fuel Efficient Stoves": {
    icon: Flame,
    gradient: "bg-gradient-to-br from-orange-400 to-red-500",
    iconColor: "text-white",
    label: "Fuel Efficient Stoves",
  },
  fuel_stoves: {
    icon: Flame,
    gradient: "bg-gradient-to-br from-orange-400 to-red-500",
    iconColor: "text-white",
    label: "Fuel Efficient Stoves",
  },

  // Seeds - Fodder variations
  seeds_fodder: {
    icon: Leaf,
    gradient: "bg-gradient-to-br from-green-400 to-emerald-600",
    iconColor: "text-white",
    label: "Fodder Seeds Provided",
  },
  "Fodder Seeds": {
    icon: Leaf,
    gradient: "bg-gradient-to-br from-green-400 to-emerald-600",
    iconColor: "text-white",
    label: "Fodder Seeds Provided",
  },
  fodder_seeds: {
    icon: Leaf,
    gradient: "bg-gradient-to-br from-green-400 to-emerald-600",
    iconColor: "text-white",
    label: "Fodder Seeds Provided",
  },

  // Seeds - Kitchen variations
  seeds_kitchen: {
    icon: Sprout,
    gradient: "bg-gradient-to-br from-lime-400 to-green-500",
    iconColor: "text-white",
    label: "Kitchen Garden Seeds",
  },
  "Kitchen Seeds": {
    icon: Sprout,
    gradient: "bg-gradient-to-br from-lime-400 to-green-500",
    iconColor: "text-white",
    label: "Kitchen Garden Seeds",
  },
  kitchen_seeds: {
    icon: Sprout,
    gradient: "bg-gradient-to-br from-lime-400 to-green-500",
    iconColor: "text-white",
    label: "Kitchen Garden Seeds",
  },

  // Solar Geysers variations
  geysers: {
    icon: Sun,
    gradient: "bg-gradient-to-br from-amber-400 to-orange-500",
    iconColor: "text-white",
    label: "Solar Geysers",
  },
  "Solar Geysers": {
    icon: Sun,
    gradient: "bg-gradient-to-br from-amber-400 to-orange-500",
    iconColor: "text-white",
    label: "Solar Geysers",
  },
  solar_geysers: {
    icon: Sun,
    gradient: "bg-gradient-to-br from-amber-400 to-orange-500",
    iconColor: "text-white",
    label: "Solar Geysers",
  },

  // Households/Beneficiaries
  households: {
    icon: Home,
    gradient: "bg-gradient-to-br from-blue-400 to-indigo-600",
    iconColor: "text-white",
    label: "Households Reached",
  },
  beneficiaries: {
    icon: Users,
    gradient: "bg-gradient-to-br from-purple-400 to-violet-600",
    iconColor: "text-white",
    label: "Beneficiaries",
  },
  lives_impacted: {
    icon: Heart,
    gradient: "bg-gradient-to-br from-pink-400 to-rose-500",
    iconColor: "text-white",
    label: "Lives Impacted",
  },
};

// Default config for unknown initiatives
const defaultConfig = {
  icon: Users,
  gradient: "bg-gradient-to-br from-slate-500 to-slate-700",
  iconColor: "text-white",
  label: "Community Initiative",
};

// Initiative Card Component
function InitiativeCard({
  title,
  value,
  unit,
  config,
  index,
}: {
  title: string;
  value: number | string;
  unit?: string;
  config: typeof defaultConfig;
  index: number;
}) {
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`relative overflow-hidden p-6 rounded-3xl ${config.gradient} border border-white/20 shadow-xl group hover:shadow-2xl transition-all duration-500`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />

      <div className="flex items-center gap-4 mb-5 relative z-10">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
          <Icon className={`w-7 h-7 ${config.iconColor}`} />
        </div>
        <span className="text-xs font-black uppercase tracking-[0.15em] text-white/80 leading-tight">
          {config.label}
        </span>
      </div>

      <div className="flex items-baseline gap-2 relative z-10">
        <p className="text-4xl font-black text-white tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {unit && (
          <span className="text-lg font-bold text-white/60">{unit}</span>
        )}
      </div>
    </motion.div>
  );
}

// Community Photo Card
function CommunityPhotoCard({ photo }: { photo: Photo }) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md flex flex-col lg:flex-row h-auto lg:h-[280px]">
      <div className="relative w-full lg:w-2/5 h-[200px] lg:h-full overflow-hidden">
        <img
          src={photo.minioUrl}
          alt={photo.caption || "Community activity"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            Community
          </div>
        </div>
      </div>

      <div className="w-full lg:w-3/5 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            {photo.year && (
              <span className="text-[10px] font-black text-purple-700 bg-purple-50 px-3 py-1 rounded-lg border border-purple-100/50 uppercase tracking-widest">
                {photo.year}
              </span>
            )}
            {photo.tags && photo.tags.length > 0 && (
              <div className="flex gap-2">
                {photo.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="text-[10px] font-medium text-gray-400">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <h4 className="text-xl font-serif font-bold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors">
            {photo.caption || "Community Initiative"}
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
            {photo.description ||
              "Supporting local communities through sustainable development initiatives and environmental stewardship programs."}
          </p>
        </div>

        <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-600 mt-3">
          <Heart className="w-3 h-3" />
          Impact Story
        </div>
      </div>
    </div>
  );
}

// Skeleton loader
function ChartSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-purple-50 rounded-3xl" />
        ))}
      </div>
      <div className="h-72 bg-gray-50 rounded-3xl" />
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
      <div className="p-8 bg-white rounded-full mb-6 shadow-sm">
        <Users className="w-12 h-12 text-purple-400" />
      </div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">
        Community Data Pending
      </p>
      <p className="text-xs mt-3 text-gray-500 text-center max-w-[300px] leading-relaxed">
        Community initiative metrics and impact data for this location are being compiled.
        Check back soon for detailed engagement statistics.
      </p>
    </div>
  );
}

export default function CommunityMetrics({
  site,
  photos,
  selectedYear,
  loading = false,
}: CommunityMetricsProps) {
  // Filter community photos
  const communityPhotos = useMemo(() => {
    return photos.filter((p) => p.category === "COMMUNITY");
  }, [photos]);

  // Process community data
  const initiatives = useMemo(() => {
    if (!site.communityData?.data) return [];

    return Object.entries(site.communityData.data).map(([key, value]) => {
      // Find matching config or use default
      const config = initiativeConfig[key] || {
        ...defaultConfig,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      };

      // Determine unit based on key
      let unit = "";
      if (key.toLowerCase().includes("seed") && key.toLowerCase().includes("fodder")) {
        unit = "kg";
      } else if (key.toLowerCase().includes("seed")) {
        unit = "Units";
      } else if (key.toLowerCase().includes("stove") || key.toLowerCase().includes("geyser")) {
        unit = "Units";
      }

      return {
        key,
        value,
        unit,
        config,
      };
    });
  }, [site.communityData]);

  const hasData = initiatives.length > 0 || communityPhotos.length > 0;

  if (loading) return <ChartSkeleton />;
  if (!hasData) return <EmptyState />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Initiative Cards */}
      {initiatives.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-50 rounded-xl">
              <Heart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 tracking-tight">Community Initiatives</h4>
              <p className="text-xs text-gray-400">Impact metrics and distribution data</p>
            </div>
            {site.communityData?.year && (
              <span className="ml-auto px-3 py-1 bg-purple-50 rounded-full text-xs font-bold text-purple-700">
                {site.communityData.year}
              </span>
            )}
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-${Math.min(initiatives.length, 3)} gap-6`}>
            {initiatives.map((init, index) => (
              <InitiativeCard
                key={init.key}
                title={init.key}
                value={init.value as number | string}
                unit={init.unit}
                config={init.config}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {/* Community Gallery */}
      {communityPhotos.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-xl">
                <Camera className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 tracking-tight">Community Gallery</h4>
                <p className="text-xs text-gray-400">
                  {communityPhotos.length} documented activit{communityPhotos.length === 1 ? "y" : "ies"}
                </p>
              </div>
            </div>
            {communityPhotos.length > 1 && (
              <div className="flex gap-3">
                <button className="community-prev p-2 rounded-full border border-gray-100 hover:bg-purple-50 hover:text-purple-600 transition-all shadow-sm">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="community-next p-2 rounded-full border border-gray-100 hover:bg-purple-50 hover:text-purple-600 transition-all shadow-sm">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              nextEl: ".community-next",
              prevEl: ".community-prev",
            }}
            pagination={{ clickable: true, el: ".community-pagination" }}
            autoplay={{ delay: 6000, pauseOnMouseEnter: true }}
            className="!pb-12"
          >
            {communityPhotos.map((photo) => (
              <SwiperSlide key={photo.id}>
                <CommunityPhotoCard photo={photo} />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="community-pagination flex justify-center gap-2 mt-2" />
        </div>
      )}

      {/* Summary Stats Footer */}
      {initiatives.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-gray-100">
          <div className="p-4 rounded-2xl bg-purple-50/30 border border-purple-100/50 text-center">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-purple-600 shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-purple-700">{initiatives.length}</p>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-purple-800/60 mt-0.5">
              Initiative Types
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100/50 text-center">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-orange-600 shadow-sm">
              <Flame className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-orange-600">
              {initiatives.find((i) => i.key.toLowerCase().includes("stove"))?.value || 0}
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-orange-800/60 mt-0.5">
              Stoves
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-green-50/30 border border-green-100/50 text-center">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-green-600 shadow-sm">
              <Leaf className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-green-600">
              {initiatives.find((i) => i.key.toLowerCase().includes("seed"))?.value || 0}
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-green-800/60 mt-0.5">
              Seeds Distributed
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/50 text-center">
            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-amber-600 shadow-sm">
              <Sun className="w-4 h-4" />
            </div>
            <p className="text-xl font-black text-amber-600">
              {initiatives.find((i) => i.key.toLowerCase().includes("geyser"))?.value || 0}
            </p>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-amber-800/60 mt-0.5">
              Solar Geysers
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
