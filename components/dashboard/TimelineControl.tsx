"use client";

import React from "react";
import { motion } from "framer-motion";

interface TimelineControlProps {
  years: number[];
  selectedYear: number | null;
  onChange: (year: number) => void;
  disabled?: boolean;
  loading?: boolean;
}

export default function TimelineControl({
  years,
  selectedYear,
  onChange,
  disabled = false,
  loading = false,
}: TimelineControlProps) {
  const sortedYears = [...years].sort((a, b) => a - b);

  if (sortedYears.length === 0) {
    return null;
  }

  // Old Serena: bg-[#0f3f3c]/95 border-[#115e59]
  return (
    <div className="bg-[#0f3f3c]/95 backdrop-blur-md rounded-full shadow-xl border border-[#e5003a] px-4 py-2 inline-flex items-center gap-2">
      {/* Old Serena Gold: text-[#b08d4b] */}
      <span className="text-[10px] font-bold text-[#e5003a] uppercase tracking-[0.15em] px-1">
        Timeline
      </span>

      <div className="h-4 w-px bg-white/10 mx-1" />

      <div className="flex items-center gap-1">
        {sortedYears.map((year) => {
          const isSelected = year === selectedYear;

          return (
            <button
              key={year}
              onClick={() => onChange(year)}
              disabled={disabled}
              className={`
                relative px-3 py-1 rounded-full text-xs font-bold
                transition-all duration-300
                ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}
                ${
                  isSelected
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <span className="relative z-10">{year}</span>
              {isSelected && (
                /* Old Serena Gold: bg-[#b08d4b] */
                <motion.div
                  layoutId="yearIndicator"
                  className="absolute inset-0 bg-[#e5003a] rounded-full"
                  transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Old Serena Gold: border-[#b08d4b] */}
      {loading && (
        <div className="w-3.5 h-3.5 ml-2 rounded-full border-2 border-[#e5003a] border-t-transparent animate-spin" />
      )}
    </div>
  );
}
