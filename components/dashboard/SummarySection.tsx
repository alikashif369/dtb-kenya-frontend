"use client";

import React from "react";
import { motion } from "framer-motion";
import LandCoverChart from "./LandCoverChart";
import CategoryMetrics from "./CategoryMetrics";
import CategorySummaryDisplay from "./CategorySummaryDisplay";
import SiteDetailsPanel from "./SiteDetailsPanel";
import SiteVisuals from "./SiteVisuals";
import type {
  Site,
  YearlyMetrics,
  AggregateMetrics,
  SiteSpecies,
  Photo,
  CategoryType,
  DashboardFilters,
} from "./types";
import type { CategorySummary } from "@/lib/api/dashboardApi";

interface SummarySectionProps {
  // Site data (when single site selected)
  selectedSite: Site | null;
  yearlyMetrics: YearlyMetrics | null;
  siteSpecies: SiteSpecies[];
  sitePhotos: Photo[];

  // Aggregate data (for org/region/category level)
  aggregateMetrics: AggregateMetrics[];
  categorySummaries: CategorySummary[];
  categoryType?: CategoryType;
  filters: DashboardFilters;

  // Loading states
  loading: {
    metrics: boolean;
    aggregateMetrics: boolean;
    categorySummaries: boolean;
    species: boolean;
    photos: boolean;
  };

  // Callbacks
  onSiteClose?: () => void;
}

export default function SummarySection({
  selectedSite,
  yearlyMetrics,
  siteSpecies,
  sitePhotos,
  aggregateMetrics,
  categorySummaries,
  categoryType,
  filters,
  loading,
  onSiteClose,
}: SummarySectionProps) {
  const hasSingleSite = selectedSite !== null;

  // Determine if we're at the top level (no filters selected)
  const isTopLevel = !filters.organizationId && !filters.regionId && !filters.categoryId;

  return (
    <motion.div
      id="summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white border-t border-gray-100 shadow-[0_-1px_10px_rgba(0,0,0,0.02)] relative z-10"
    >
      <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        {/* Section header */}
        <div className="mb-10 text-center md:text-left border-b border-gray-100 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[#b08d4b] text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">
                {hasSingleSite ? "Deep-Dive Site Analytics" : "Ecosystem Performance Overview"}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#115e59] font-bold">
                {hasSingleSite ? selectedSite?.name : "Summary Overview"}
              </h2>
            </div>
            {hasSingleSite && (
              <p className="text-gray-400 text-sm max-w-md font-medium leading-relaxed">
                Detailed environmental metrics, biodiversity status, and field documentation for the {selectedSite?.name} conservation site.
              </p>
            )}
          </div>
        </div>

        {hasSingleSite ? (
          // Single site view - Optimized Proportional Layout
          <div className="space-y-16">
            {/* Top Row: Visual Intelligence Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Left Side: Land Cover Chart (7 cols) */}
              <div className="lg:col-span-7 h-full">
                <LandCoverChart
                  metrics={yearlyMetrics}
                  loading={loading.metrics}
                  showTitle={true}
                />
              </div>

              {/* Right Side: Site Details (5 cols) */}
              <div className="lg:col-span-5 h-full">
                <SiteDetailsPanel
                  site={selectedSite}
                  metrics={yearlyMetrics}
                  species={siteSpecies}
                  photos={sitePhotos}
                  loading={loading.metrics || loading.species}
                  onClose={onSiteClose}
                />
              </div>
            </div>

            {/* Middle Row: Visual Documentation & Biodiversity */}
            <div className="pt-12 border-t border-gray-50">
               <SiteVisuals 
                 species={siteSpecies} 
                 photos={sitePhotos} 
                 siteName={selectedSite.name} 
                 loading={loading.photos || loading.species}
               />
            </div>

            {/* Bottom Row: Aggregate Metrics (Optional if data exists) */}
            {aggregateMetrics.length > 0 && (
              <div className="pt-16 border-t border-gray-50">
                <CategoryMetrics
                  metrics={aggregateMetrics}
                  categoryType={categoryType}
                  loading={loading.aggregateMetrics}
                  compact={false}
                />
              </div>
            )}
          </div>
        ) : (
          // Multi-site view - show aggregate metrics
          <div className="space-y-8">
            <CategoryMetrics
              metrics={aggregateMetrics}
              categoryType={categoryType}
              loading={loading.aggregateMetrics}
              compact={false}
            />

            {/* Category Summaries - Text descriptions for org/region/category */}
            <CategorySummaryDisplay
              summaries={categorySummaries}
              loading={loading.categorySummaries}
            />

            {/* Empty state handling */}
            {!loading.aggregateMetrics && !loading.categorySummaries &&
             aggregateMetrics.length === 0 && categorySummaries.length === 0 && (
              <div className="bg-gradient-to-br from-white to-stone-50/30 rounded-2xl border border-gray-100 shadow-sm p-10">
                {isTopLevel ? (
                  // Default welcome text when no filters are selected
                  <div className="prose prose-stone max-w-none">
                    <h3 className="text-2xl font-serif font-bold text-[#115e59] mb-6 flex items-center gap-3">
                      <span className="w-1 h-8 bg-[#b08d4b] rounded-full"></span>
                      Serena Green Initiative
                    </h3>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                      <p>
                        Serena Hotels continue to pledge in promoting clean and green Pakistan by focusing on climate change mitigation,
                        climate adaptation, land degradation, food security, biodiversity conservation, and enhancing community resilience.
                      </p>
                      <p>
                        Serena Green Initiative unites our Asia and Africa programs to restore ecosystems and cut operational emissions.
                        We focus on native tree planting and forest stewardship, water and soil conservation, and community-led stewardship
                        backed by transparent monitoring. In parallel, we advance clean-energy upgrades—like rooftop solar and efficiency
                        improvements—to support resilient, nature-positive hospitality across both regions.
                      </p>
                      <p>
                        This is a pilot project of planting 600,000 trees, including species Populus (Poplar), Robinia pseudoacacia (Robinia),
                        Salix (Willow), Elaeagnus angustifolia (Russian Olive), Pinus roxburghii (Chir), Quercus (Oak), Cedrus deodara (Deodar),
                        Tamarix aphylla (Tamarix), Acacia nilotica (Kikar), Ziziphus mauritiana (Ber), and Melia azedarach (Bakain) in different
                        areas of Gilgit-Baltistan, Balochistan, Chitral, Punjab, and KP. With afforestation and forest stewardship as the primary
                        plantation types, this project has the potential to make a significant impact on the environment and local communities.
                        Through collaboration and community involvement, this pilot project has the potential to serve as a model for other
                        afforestation efforts around the world. The project has been completed in August, 2023.
                      </p>
                    </div>
                  </div>
                ) : (
                  // "No metrics available" when deeper in hierarchy but no data
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-stone-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-stone-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-stone-600">No metrics available</p>
                    <p className="text-xs text-stone-400 mt-1">
                      Select a category to view performance metrics
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
