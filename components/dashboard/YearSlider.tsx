"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface YearSliderProps {
  years: number[];
  selectedYear: number | null;
  onChange: (year: number) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function YearSlider({
  years,
  selectedYear,
  onChange,
  disabled = false,
  loading = false,
}: YearSliderProps) {
  // Sort years in ascending order
  const sortedYears = [...years].sort((a, b) => a - b);
  const currentIndex = selectedYear
    ? sortedYears.indexOf(selectedYear)
    : -1;

  const handlePrev = () => {
    if (currentIndex > 0) {
      onChange(sortedYears[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < sortedYears.length - 1) {
      onChange(sortedYears[currentIndex + 1]);
    }
  };

  if (sortedYears.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 p-3"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-green-600" />
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
              Timeline
            </span>
          </div>
          {loading && (
            <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Year navigation */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={handlePrev}
            disabled={disabled || currentIndex <= 0}
            className={`
              p-1.5 rounded-lg border transition-all duration-200
              ${
                currentIndex <= 0 || disabled
                  ? "text-stone-300 border-stone-100 cursor-not-allowed"
                  : "text-stone-500 border-stone-200 hover:text-green-600 hover:border-green-300 hover:bg-green-50"
              }
            `}
            title="Previous year"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Year pills */}
          <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto py-1">
            {sortedYears.map((year) => {
              const isSelected = year === selectedYear;
              return (
                <button
                  key={year}
                  onClick={() => onChange(year)}
                  disabled={disabled}
                  className={`
                    relative px-3 py-1.5 rounded-lg font-medium text-xs
                    transition-all duration-200 whitespace-nowrap
                    ${
                      isSelected
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-stone-100 text-stone-600 hover:bg-green-100 hover:text-green-700"
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {year}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={disabled || currentIndex >= sortedYears.length - 1}
            className={`
              p-1.5 rounded-lg border transition-all duration-200
              ${
                currentIndex >= sortedYears.length - 1 || disabled
                  ? "text-stone-300 border-stone-100 cursor-not-allowed"
                  : "text-stone-500 border-stone-200 hover:text-green-600 hover:border-green-300 hover:bg-green-50"
              }
            `}
            title="Next year"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-2">
          <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${((currentIndex + 1) / sortedYears.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
