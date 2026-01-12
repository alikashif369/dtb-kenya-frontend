"use client";

import React from "react";
import { motion } from "framer-motion";
import type { CategorySummary } from "@/lib/api/dashboardApi";

interface CategorySummaryDisplayProps {
  summaries: CategorySummary[];
  loading: boolean;
}

export default function CategorySummaryDisplay({
  summaries,
  loading,
}: CategorySummaryDisplayProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-2xl border border-gray-100 p-8"
          >
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              <div className="h-4 bg-gray-100 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (summaries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {summaries.map((summary, index) => (
        <motion.div
          key={summary.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gradient-to-br from-white to-stone-50/30 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
        >
          <div className="p-8">
            {summary.title && (
              <h3 className="text-2xl font-serif font-bold text-[#115e59] mb-4 flex items-center gap-3">
                <span className="w-1 h-8 bg-[#b08d4b] rounded-full"></span>
                {summary.title}
              </h3>
            )}
            <div className="prose prose-stone max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {summary.summary}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
