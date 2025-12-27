"use client";

import React from "react";
import { Layers, Image, Grid3X3, Eye, Map, Satellite } from "lucide-react";
import { motion } from "framer-motion";

interface MapToggleButtonsProps {
  showVectors: boolean;
  showImagery: boolean;
  showClassified: boolean;
  baseLayer: "osm" | "satellite";
  onToggleVectors: () => void;
  onToggleImagery: () => void;
  onToggleClassified: () => void;
  onToggleBaseLayer: () => void;
  singleSiteSelected: boolean;
  loading?: boolean;
}

interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  description?: string;
}

function ToggleButton({
  active,
  onClick,
  disabled = false,
  icon,
  label,
  description,
}: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex items-center gap-2 w-full
        px-3 py-2 rounded-lg text-xs font-medium
        transition-all duration-200
        ${
          active
            ? "bg-green-600 text-white shadow-sm"
            : "bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-800"
        }
        ${
          disabled
            ? "opacity-40 cursor-not-allowed"
            : "cursor-pointer"
        }
      `}
      title={description}
    >
      <span className={`flex-shrink-0 ${active ? "text-green-100" : "text-stone-400"}`}>
        {icon}
      </span>
      <span className="flex-1 text-left truncate">{label}</span>
      {active && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0"
        >
          <Eye className="w-3 h-3 text-green-200" />
        </motion.span>
      )}
    </button>
  );
}

export default function MapToggleButtons({
  showVectors,
  showImagery,
  showClassified,
  baseLayer,
  onToggleVectors,
  onToggleImagery,
  onToggleClassified,
  onToggleBaseLayer,
  singleSiteSelected,
  loading = false,
}: MapToggleButtonsProps) {
  return (
    <div className="flex flex-col gap-2 p-2.5 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 min-w-[150px]">
      {/* Base Layer Toggle */}
      <div>
        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider px-1 mb-1.5 block">
          Base Map
        </span>
        <div className="flex rounded-lg overflow-hidden border border-stone-200">
          <button
            onClick={baseLayer === "satellite" ? onToggleBaseLayer : undefined}
            className={`
              flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 text-[11px] font-medium
              transition-all duration-200
              ${
                baseLayer === "osm"
                  ? "bg-green-600 text-white"
                  : "bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700"
              }
            `}
          >
            <Map className="w-3.5 h-3.5" />
            Map
          </button>
          <button
            onClick={baseLayer === "osm" ? onToggleBaseLayer : undefined}
            className={`
              flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 text-[11px] font-medium
              transition-all duration-200
              ${
                baseLayer === "satellite"
                  ? "bg-green-600 text-white"
                  : "bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-700"
              }
            `}
          >
            <Satellite className="w-3.5 h-3.5" />
            Satellite
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-stone-200" />

      {/* Layer Toggles */}
      <div>
        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider px-1 mb-1.5 block">
          Overlays
        </span>
        <div className="flex flex-col gap-1">
          <ToggleButton
            active={showVectors}
            onClick={onToggleVectors}
            disabled={loading}
            icon={<Layers className="w-3.5 h-3.5" />}
            label="Vectors"
            description="Show/hide site boundary vectors"
          />

          <ToggleButton
            active={showImagery}
            onClick={onToggleImagery}
            disabled={loading || !singleSiteSelected}
            icon={<Image className="w-3.5 h-3.5" />}
            label="Imagery"
            description={
              singleSiteSelected
                ? "Show/hide satellite imagery"
                : "Select a single site to view imagery"
            }
          />

          <ToggleButton
            active={showClassified}
            onClick={onToggleClassified}
            disabled={loading || !singleSiteSelected}
            icon={<Grid3X3 className="w-3.5 h-3.5" />}
            label="Classified"
            description={
              singleSiteSelected
                ? "Show/hide classified land cover"
                : "Select a single site to view classification"
            }
          />
        </div>
      </div>

      {/* Hint for single site */}
      {!singleSiteSelected && (
        <p className="text-[9px] text-stone-400 italic text-center px-1 leading-tight">
          Click a site for imagery
        </p>
      )}
    </div>
  );
}
