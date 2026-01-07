"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Ruler,
  Building2,
  Trees,
  Calendar,
  ExternalLink,
  X,
  Leaf,
  Info,
  Image as ImageIcon,
} from "lucide-react";
import type { Site, YearlyMetrics, SiteSpecies, Photo } from "./types";
import { formatNumber, formatArea } from "@/lib/api/dashboardApi";
import { getCategoryColor } from "./utils/colorPalettes";

interface SiteDetailsPanelProps {
  site: Site | null;
  metrics: YearlyMetrics | null;
  species: SiteSpecies[];
  photos: Photo[];
  loading?: boolean;
  onClose?: () => void;
}

// Species card component
function SpeciesCard({ siteSpecies, speciesPhotos }: { siteSpecies: SiteSpecies; speciesPhotos: Photo[] }) {
  const species = siteSpecies.species;
  if (!species) return null;

  // Get photos for this species
  const photos = speciesPhotos.filter(p => p.speciesId === species.id);
  const displayImage = photos[0]?.minioUrl || species.image1Url;

  // Debug logging
  console.log('SpeciesCard debug:', {
    speciesId: species.id,
    scientificName: species.scientificName,
    allSpeciesPhotos: speciesPhotos,
    filteredPhotos: photos,
    displayImage,
  });

  return (
    <div className="group relative flex items-start gap-3 p-3 bg-gradient-to-br from-white to-stone-50 rounded-xl border border-stone-200 hover:border-green-300 hover:shadow-md transition-all duration-200 cursor-pointer">
      {displayImage ? (
        <div className="relative flex-shrink-0">
          <img
            src={displayImage}
            alt={species.englishName || species.scientificName}
            className="w-14 h-14 rounded-xl object-cover ring-2 ring-green-100 group-hover:ring-green-300 transition-all"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
            <Leaf className="w-3 h-3 text-white" />
          </div>
          {photos.length > 1 && (
            <div className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-[10px] font-bold text-white">{photos.length}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center ring-2 ring-green-100 group-hover:ring-green-300 transition-all">
          <Leaf className="w-7 h-7 text-green-700" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-900 truncate group-hover:text-green-700 transition-colors">
          {species.englishName || species.localName || species.scientificName}
        </p>
        <p className="text-xs text-stone-500 italic truncate mt-0.5">
          {species.scientificName}
        </p>
        {siteSpecies.plantedCount && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="px-2 py-0.5 bg-green-50 rounded-full border border-green-200">
              <p className="text-xs text-green-700 font-semibold">
                {formatNumber(siteSpecies.plantedCount)}
              </p>
            </div>
            <p className="text-xs text-stone-500">planted</p>
          </div>
        )}
        {/* Show additional photos as small thumbnails */}
        {photos.length > 1 && (
          <div className="flex gap-1 mt-2 overflow-x-auto">
            {photos.slice(1, 4).map((photo, idx) => (
              <img
                key={idx}
                src={photo.minioUrl}
                alt={photo.caption || "Species photo"}
                className="w-8 h-8 rounded object-cover ring-1 ring-green-200 hover:ring-green-400 transition-all"
                title={photo.caption}
              />
            ))}
            {photos.length > 4 && (
              <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center ring-1 ring-green-200">
                <span className="text-[10px] font-bold text-green-700">+{photos.length - 4}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Photo thumbnail component
function PhotoThumbnail({ photo }: { photo: Photo }) {
  return (
    <div className="relative group flex-shrink-0">
      <div className="relative w-28 h-28 rounded-xl overflow-hidden ring-2 ring-stone-200 group-hover:ring-green-400 transition-all duration-300">
        <img
          src={photo.minioUrl}
          alt={photo.caption || "Site photo"}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {photo.caption && (
          <div className="absolute inset-0 flex items-end p-2.5">
            <div className="w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
              <p className="text-xs text-white font-medium line-clamp-2 drop-shadow-lg">
                {photo.caption}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <ImageIcon className="w-3.5 h-3.5 text-white" />
      </div>
    </div>
  );
}

// Skeleton loader
function DetailsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-stone-200 rounded w-3/4" />
      <div className="h-4 bg-stone-200 rounded w-1/2" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded-lg" />
        ))}
      </div>
      <div className="h-4 bg-stone-200 rounded w-1/3 mt-4" />
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-16 bg-stone-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-stone-400">
      <Info className="w-10 h-10 mb-3 opacity-50" />
      <p className="text-sm font-medium">No site selected</p>
      <p className="text-xs mt-1 text-center">
        Click on a site in the map or select from the dropdown
      </p>
    </div>
  );
}

export default function SiteDetailsPanel({
  site,
  metrics,
  species,
  photos,
  loading = false,
  onClose,
}: SiteDetailsPanelProps) {
  // Debug logging
  console.log('SiteDetailsPanel rendered with:', {
    siteId: site?.id,
    siteName: site?.name,
    speciesCount: species.length,
    species: species,
  });

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-xl shadow-lg border border-stone-200 p-6"
      >
        <DetailsSkeleton />
      </motion.div>
    );
  }

  if (!site) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <EmptyState />
      </div>
    );
  }

  const categoryColor = site.category?.type
    ? getCategoryColor(site.category.type)
    : "#22c55e";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={site.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden"
      >
        {/* Header */}
        <div
          className="p-4"
          style={{ backgroundColor: `${categoryColor}10` }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-stone-800 truncate">
                {site.name}
              </h3>
              {site.category && (
                <p className="text-sm text-stone-600">
                  {site.category.name}
                  {site.subCategory && ` / ${site.subCategory.name}`}
                </p>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-stone-200/50 transition-colors"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Location */}
            {(site.district || site.city) && (
              <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
                <MapPin className="w-4 h-4 text-stone-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-500">Location</p>
                  <p className="text-sm font-medium text-stone-800 truncate">
                    {site.city || site.district}
                  </p>
                </div>
              </div>
            )}

            {/* Area */}
            {site.area && (
              <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
                <Ruler className="w-4 h-4 text-stone-500" />
                <div>
                  <p className="text-xs text-stone-500">Area</p>
                  <p className="text-sm font-medium text-stone-800">
                    {formatArea(site.area)}
                  </p>
                </div>
              </div>
            )}

            {/* Coordinates */}
            {site.coordinates && (
              <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
                <MapPin className="w-4 h-4 text-stone-500" />
                <div>
                  <p className="text-xs text-stone-500">Coordinates</p>
                  <p className="text-xs font-medium text-stone-800">
                    {site.coordinates.lat.toFixed(4)},{" "}
                    {site.coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            )}

            {/* Site type */}
            <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
              <Building2 className="w-4 h-4 text-stone-500" />
              <div>
                <p className="text-xs text-stone-500">Type</p>
                <p className="text-sm font-medium text-stone-800">
                  {site.siteType.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>

          {/* Infrastructure */}
          {site.infrastructure && (
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-2">
                Infrastructure
              </h4>
              <p className="text-sm text-stone-600 bg-stone-50 rounded-lg p-3">
                {site.infrastructure}
              </p>
            </div>
          )}

          {/* Land cover summary */}
          {metrics && (
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                <Trees className="w-4 h-4" />
                Land Cover ({metrics.year})
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-700">
                    {((metrics.treeCanopy || 0) + (metrics.greenArea || 0)).toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-600">Vegetation</p>
                </div>
                <div className="text-center p-2 bg-amber-50 rounded-lg">
                  <p className="text-lg font-bold text-amber-700">
                    {(metrics.barrenLand || 0).toFixed(1)}%
                  </p>
                  <p className="text-xs text-amber-600">Barren</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-700">
                    {(metrics.water || 0).toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-600">Water</p>
                </div>
              </div>
            </div>
          )}

          {/* Species */}
          {species.length > 0 && (
            <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-xl p-4 border border-green-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                  <div className="p-1.5 bg-green-500 rounded-lg">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  Species Planted
                </h4>
                <div className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  {species.length}
                </div>
              </div>
              <div className="space-y-2.5 max-h-[400px] overflow-y-auto custom-scrollbar">
                {species.slice(0, 5).map((sp) => (
                  <SpeciesCard key={sp.speciesId} siteSpecies={sp} speciesPhotos={photos.filter(p => p.category === 'SPECIES')} />
                ))}
                {species.length > 5 && (
                  <div className="text-center py-2 bg-white/50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-700 font-medium">
                      +{species.length - 5} more species
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Photos */}
          {photos.filter(p => p.category !== 'SPECIES').length > 0 && (
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <ImageIcon className="w-4 h-4 text-white" />
                  </div>
                  Site Photos
                </h4>
                <div className="px-2.5 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                  {photos.filter(p => p.category !== 'SPECIES').length}
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {photos.filter(p => p.category !== 'SPECIES').slice(0, 5).map((photo) => (
                  <PhotoThumbnail key={photo.id} photo={photo} />
                ))}
              </div>
            </div>
          )}

          {/* View full details link */}
          <a
            href={`/admin/sites/${site.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
          >
            View Full Details
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
