"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Trees,
  Sun,
  Users,
  Recycle,
  Droplets,
  TrendingUp,
  Zap,
  Calendar,
  Layers,
} from "lucide-react";
import type { Site, CategoryType } from "./types";
import { categoryColors } from "./utils/colorPalettes";
import { formatNumber } from "@/lib/api/dashboardApi";

interface SiteMetricsProps {
  site: Site;
  selectedYear?: number | null;
  loading?: boolean;
}

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  index,
}: {
  icon: any;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="relative group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-500 overflow-hidden"
    >
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150 group-hover:bg-emerald-50/50" />
      
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div
          className="p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] truncate">
            {label}
          </p>
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-3xl font-serif text-[#115e59] leading-none tracking-tight">
          {typeof value === 'number' ? formatNumber(value) : value}
          {unit && (
            <span className="text-sm font-sans font-bold text-gray-300 ml-2 align-middle uppercase tracking-widest">
              {unit}
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
}

export default function SiteMetrics({ site, selectedYear, loading = false }: SiteMetricsProps) {
  const color = categoryColors[site.category?.type || "PLANTATION"] || "#115e59";

  if (loading) {
     return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
       {[1, 2, 3, 4].map(i => (
         <div key={i} className="h-36 bg-gray-50 rounded-3xl border border-gray-100" />
       ))}
     </div>;
  }

  const metrics: Array<{ icon: any; label: string; value: string | number; unit?: string }> = [];

  // Plantation Metrics
  if (site.plantationData) {
    metrics.push({
      icon: Trees,
      label: "Total Flora",
      value: site.plantationData.plants,
      unit: "Units",
    });
    metrics.push({
      icon: Layers,
      label: "Biodiversity",
      value: site.plantationData.species.length,
      unit: "Species",
    });
  }

  // Solar Metrics
  if (site.solarData) {
    metrics.push({
      icon: Sun,
      label: "Design Capacity",
      value: site.solarData.capacityKwh,
      unit: "kWh",
    });
    metrics.push({
      icon: Calendar,
      label: "Activation",
      value: site.solarData.installationYear,
    });
    
    const totalProd = Object.values(site.solarData.quarterlyProduction).reduce((a, b) => a + (b || 0), 0);
    if (totalProd > 0) {
      metrics.push({
        icon: TrendingUp,
        label: "Lifetime Yield",
        value: totalProd,
        unit: "kWh",
      });
    }
    metrics.push({
      icon: Zap,
      label: "System Status",
      value: "Stationary", // Or dynamic if available
    });
  }

  // Waste Metrics (Use selectedYear or fall back to latest year)
  if (site.wasteData && site.wasteData.length > 0) {
    const sortedWaste = [...site.wasteData].sort((a, b) => b.year - a.year);
    const yearWaste = selectedYear
      ? site.wasteData.find(d => d.year === selectedYear) || sortedWaste[0]
      : sortedWaste[0];
    metrics.push({
      icon: Recycle,
      label: `Biomass ${yearWaste.year}`,
      value: yearWaste.organicWaste,
      unit: "kg",
    });
    metrics.push({
      icon: TrendingUp,
      label: `Compost ${yearWaste.year}`,
      value: yearWaste.compostReceived,
      unit: "kg",
    });
  }

  // Sewage Metrics (Use selectedYear or fall back to latest year)
  if (site.sewageData && site.sewageData.length > 0) {
    const sortedSewage = [...site.sewageData].sort((a, b) => b.year - a.year);
    const yearSewage = selectedYear
      ? site.sewageData.find(d => d.year === selectedYear) || sortedSewage[0]
      : sortedSewage[0];
    metrics.push({
      icon: Droplets,
      label: `Recovery ${yearSewage.year}`,
      value: (yearSewage.recoveryRatio * 100).toFixed(1),
      unit: "%",
    });
    metrics.push({
      icon: Zap,
      label: `Methane ${yearSewage.year}`,
      value: yearSewage.methaneSaved,
      unit: "kg",
    });
  }

  // Community Metrics (The dynamic ones)
  if (site.communityData && site.communityData.data) {
    Object.entries(site.communityData.data).forEach(([key, value]) => {
      metrics.push({
        icon: Users,
        label: key,
        value: value as any,
      });
    });
  }

  if (metrics.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        <h3 className="text-xl font-serif font-bold text-[#115e59] tracking-tight">
          Performance Indicators
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <StatCard
            key={i}
            icon={m.icon}
            label={m.label}
            value={m.value}
            unit={m.unit}
            color={color}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
