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
function SpeciesCard({ siteSpecies }: { siteSpecies: SiteSpecies }) {
  const species = siteSpecies.species;
  if (!species) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
      {species.image1Url ? (
        <img
          src={species.image1Url}
          alt={species.englishName || species.scientificName}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
          <Leaf className="w-6 h-6 text-green-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 truncate">
          {species.englishName || species.localName || species.scientificName}
        </p>
        <p className="text-xs text-stone-500 italic truncate">
          {species.scientificName}
        </p>
        {siteSpecies.plantedCount && (
          <p className="text-xs text-green-700 font-medium mt-0.5">
            {formatNumber(siteSpecies.plantedCount)} planted
          </p>
        )}
      </div>
    </div>
  );
}

// Photo thumbnail component
function PhotoThumbnail({ photo }: { photo: Photo }) {
  return (
    <div className="relative group">
      <img
        src={photo.minioUrl}
        alt={photo.caption || "Site photo"}
        className="w-20 h-20 rounded-lg object-cover cursor-pointer transition-transform group-hover:scale-105"
      />
      {photo.caption && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
          <p className="text-[10px] text-white truncate">{photo.caption}</p>
        </div>
      )}
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
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Species Planted ({species.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {species.slice(0, 5).map((sp) => (
                  <SpeciesCard key={sp.speciesId} siteSpecies={sp} />
                ))}
                {species.length > 5 && (
                  <p className="text-xs text-stone-500 text-center py-2">
                    +{species.length - 5} more species
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Photos */}
          {photos.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Recent Photos ({photos.length})
              </h4>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.slice(0, 5).map((photo) => (
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
