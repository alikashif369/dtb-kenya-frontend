"use client";

import React from "react";
import { motion } from "framer-motion";
import LandCoverChart from "./LandCoverChart";
import CategoryMetrics from "./CategoryMetrics";
import SiteDetailsPanel from "./SiteDetailsPanel";
import type {
  Site,
  YearlyMetrics,
  AggregateMetrics,
  SiteSpecies,
  Photo,
  CategoryType,
} from "./types";

interface SummarySectionProps {
  // Site data (when single site selected)
  selectedSite: Site | null;
  yearlyMetrics: YearlyMetrics | null;
  siteSpecies: SiteSpecies[];
  sitePhotos: Photo[];

  // Aggregate data (for org/region/category level)
  aggregateMetrics: AggregateMetrics[];
  categoryType?: CategoryType;

  // Loading states
  loading: {
    metrics: boolean;
    aggregateMetrics: boolean;
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
  categoryType,
  loading,
  onSiteClose,
}: SummarySectionProps) {
  const hasSingleSite = selectedSite !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-stone-50 border-t border-stone-200"
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-stone-800">
            {hasSingleSite ? "Site Analysis" : "Summary Overview"}
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {hasSingleSite
              ? `Detailed metrics and information for ${selectedSite?.name}`
              : "Aggregate metrics based on your current filter selection"}
          </p>
        </div>

        {hasSingleSite ? (
          // Single site view - show detailed analysis
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Land cover chart */}
              <LandCoverChart
                metrics={yearlyMetrics}
                loading={loading.metrics}
                showTitle={true}
              />

              {/* Category metrics if available */}
              {aggregateMetrics.length > 0 && (
                <CategoryMetrics
                  metrics={aggregateMetrics}
                  categoryType={categoryType}
                  loading={loading.aggregateMetrics}
                  compact={false}
                />
              )}
            </div>

            {/* Right column - Site details */}
            <div className="lg:col-span-1">
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
        ) : (
          // Multi-site view - show aggregate metrics
          <div className="space-y-6">
            {/* Aggregate metrics cards */}
            <CategoryMetrics
              metrics={aggregateMetrics}
              categoryType={categoryType}
              loading={loading.aggregateMetrics}
              compact={false}
            />

            {/* Quick stats summary */}
            {!loading.aggregateMetrics && aggregateMetrics.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-2">
                  Explore Site Data
                </h3>
                <p className="text-sm text-stone-500 max-w-md mx-auto">
                  Use the filters above to narrow down to specific organizations,
                  regions, or categories. Select a single site to see detailed
                  land cover analysis and metrics.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
