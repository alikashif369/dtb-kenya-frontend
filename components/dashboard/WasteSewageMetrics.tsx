"use client";

import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Recycle, Droplets, TrendingUp, Leaf, Factory } from "lucide-react";
import type { Site, CategoryType } from "./types";
import "./utils/chartConfig";

interface WasteSewageMetricsProps {
  site: Site;
  selectedYear: number | null;
  loading?: boolean;
}

// Skeleton loader
function ChartSkeleton() {
  return (
    <div className="flex items-end gap-3 h-48 animate-pulse px-4">
      {[70, 90, 50, 80, 60].map((h, i) => (
        <div
          key={i}
          className="flex-1 bg-teal-100 rounded-t-xl"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

// Empty state
function EmptyState({ type }: { type: "WASTE" | "SEWAGE" }) {
  const isWaste = type === "WASTE";
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-300">
      <div className={`p-8 ${isWaste ? "bg-green-50" : "bg-teal-50"} rounded-full mb-6 border ${isWaste ? "border-green-100" : "border-teal-100"}`}>
        {isWaste ? (
          <Recycle className="w-12 h-12 opacity-30 text-green-600" />
        ) : (
          <Droplets className="w-12 h-12 opacity-30 text-teal-600" />
        )}
      </div>
      <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">
        {isWaste ? "Waste Data Pending" : "Sewage Data Pending"}
      </p>
      <p className="text-xs mt-3 opacity-70 text-center max-w-[240px]">
        {isWaste
          ? "Organic waste processing and composting data is being collected."
          : "Water recovery and treatment metrics are being compiled."}
      </p>
    </div>
  );
}

export default function WasteSewageMetrics({
  site,
  selectedYear,
  loading = false,
}: WasteSewageMetricsProps) {
  const categoryType = site.category?.type as CategoryType;
  const isWaste = categoryType === "WASTE";
  const isSewage = categoryType === "SEWAGE";

  // Process waste data for chart
  const wasteChartData = useMemo(() => {
    if (!site.wasteData || site.wasteData.length === 0) return null;

    const sortedData = [...site.wasteData].sort((a, b) => a.year - b.year);

    return {
      labels: sortedData.map((d) => d.year.toString()),
      datasets: [
        {
          label: "Organic Waste (kg)",
          data: sortedData.map((d) => d.organicWaste),
          backgroundColor: "rgba(34, 197, 94, 0.7)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: "Compost Produced (kg)",
          data: sortedData.map((d) => d.compostReceived),
          backgroundColor: "rgba(132, 204, 22, 0.7)",
          borderColor: "rgba(132, 204, 22, 1)",
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
      raw: sortedData,
    };
  }, [site.wasteData]);

  // Process sewage data for chart
  const sewageChartData = useMemo(() => {
    if (!site.sewageData || site.sewageData.length === 0) return null;

    const sortedData = [...site.sewageData].sort((a, b) => a.year - b.year);

    return {
      labels: sortedData.map((d) => d.year.toString()),
      datasets: [
        {
          label: "Recovery Ratio (%)",
          data: sortedData.map((d) => d.recoveryRatio * 100),
          backgroundColor: "rgba(20, 184, 166, 0.7)",
          borderColor: "rgba(20, 184, 166, 1)",
          borderWidth: 2,
          borderRadius: 6,
          yAxisID: "y",
        },
        {
          label: "Methane Saved (kg)",
          data: sortedData.map((d) => d.methaneSaved),
          backgroundColor: "rgba(59, 130, 246, 0.7)",
          borderColor: "rgba(59, 130, 246, 1)",
          borderWidth: 2,
          borderRadius: 6,
          yAxisID: "y1",
        },
      ],
      raw: sortedData,
    };
  }, [site.sewageData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: { size: 10, weight: "600" as const },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 12, weight: "bold" as const },
        bodyFont: { size: 11 },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, weight: "600" as const }, color: "#6b7280" },
      },
      y: {
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: { font: { size: 10 }, color: "#9ca3af" },
        position: "left" as const,
      },
      ...(isSewage && {
        y1: {
          grid: { display: false },
          ticks: { font: { size: 10 }, color: "#9ca3af" },
          position: "right" as const,
        },
      }),
    },
  };

  // Calculate summary stats - use selectedYear or fall back to latest
  const wasteStats = useMemo(() => {
    if (!site.wasteData || site.wasteData.length === 0) return null;
    const sortedData = [...site.wasteData].sort((a, b) => b.year - a.year);
    const yearData = selectedYear
      ? site.wasteData.find(d => d.year === selectedYear) || sortedData[0]
      : sortedData[0];
    const totalWaste = site.wasteData.reduce((sum, d) => sum + d.organicWaste, 0);
    const totalCompost = site.wasteData.reduce((sum, d) => sum + d.compostReceived, 0);
    return {
      yearData,
      totalWaste,
      totalCompost,
      years: site.wasteData.length,
      currentYear: yearData.year,
      yearWaste: yearData.organicWaste,
      yearCompost: yearData.compostReceived,
    };
  }, [site.wasteData, selectedYear]);

  const sewageStats = useMemo(() => {
    if (!site.sewageData || site.sewageData.length === 0) return null;
    const sortedData = [...site.sewageData].sort((a, b) => b.year - a.year);
    const yearData = selectedYear
      ? site.sewageData.find(d => d.year === selectedYear) || sortedData[0]
      : sortedData[0];
    const avgRecovery =
      site.sewageData.reduce((sum, d) => sum + d.recoveryRatio, 0) /
      site.sewageData.length;
    const totalMethane = site.sewageData.reduce((sum, d) => sum + d.methaneSaved, 0);
    return {
      yearData,
      avgRecovery,
      totalMethane,
      years: site.sewageData.length,
      currentYear: yearData.year,
      yearRecovery: yearData.recoveryRatio,
      yearMethane: yearData.methaneSaved,
    };
  }, [site.sewageData, selectedYear]);

  const chartData = isWaste ? wasteChartData : sewageChartData;
  const primaryColor = isWaste ? "green" : "teal";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden h-full p-8"
    >
      {/* Background decoration */}
      <div
        className={`absolute top-0 right-0 w-64 h-64 bg-${primaryColor}-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-30 pointer-events-none`}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className={`w-1 h-1 bg-${primaryColor}-500 rounded-full`} />
            <span
              className={`text-[9px] font-bold uppercase tracking-widest text-${primaryColor}-600`}
            >
              {isWaste ? "Waste Management" : "Water Treatment"}
            </span>
          </div>
          <h3 className="text-base font-serif font-bold text-gray-900 leading-tight">
            {isWaste ? "Composting & Recycling" : "Sewage Recovery Analytics"}
          </h3>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 bg-${primaryColor}-50 rounded-xl border border-${primaryColor}-100`}
        >
          {isWaste ? (
            <Recycle className={`w-4 h-4 text-${primaryColor}-600`} />
          ) : (
            <Droplets className={`w-4 h-4 text-${primaryColor}-600`} />
          )}
          <span className={`text-sm font-bold text-${primaryColor}-700`}>
            {isWaste
              ? wasteStats?.currentYear || "–"
              : sewageStats?.currentYear || "–"}
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="min-h-[280px]">
        {loading ? (
          <ChartSkeleton />
        ) : !chartData ? (
          <EmptyState type={isWaste ? "WASTE" : "SEWAGE"} />
        ) : (
          <div className="h-72">
            <Bar data={chartData} options={chartOptions as any} />
          </div>
        )}
      </div>

      {/* Footer Stats - Year Specific */}
      {((isWaste && wasteStats) || (isSewage && sewageStats)) && !loading && (
        <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-3 gap-4 md:gap-8 text-center relative z-10">
          {isWaste && wasteStats && (
            <>
              <div className="p-4 rounded-2xl bg-green-50/30 border border-green-100/50">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-green-600 shadow-sm">
                  <Recycle className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-green-700">
                  {wasteStats.yearWaste.toLocaleString()}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-green-800/60 mt-0.5">
                  Organic Waste (kg)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-lime-50/30 border border-lime-100/50">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-lime-600 shadow-sm">
                  <Leaf className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-lime-600">
                  {wasteStats.yearCompost.toLocaleString()}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-lime-800/60 mt-0.5">
                  Compost Received (kg)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-emerald-600 shadow-sm">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-emerald-600">
                  {((wasteStats.yearCompost / wasteStats.yearWaste) * 100).toFixed(1)}%
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-800/60 mt-0.5">
                  Recovery Rate
                </p>
              </div>
            </>
          )}

          {isSewage && sewageStats && (
            <>
              <div className="p-4 rounded-2xl bg-teal-50/30 border border-teal-100/50">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-teal-600 shadow-sm">
                  <Droplets className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-teal-700">
                  {(sewageStats.yearRecovery * 100).toFixed(1)}%
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-teal-800/60 mt-0.5">
                  Recovery Ratio
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/30 border border-blue-100/50">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-blue-600 shadow-sm">
                  <Factory className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-blue-600">
                  {sewageStats.yearMethane.toLocaleString()}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-blue-800/60 mt-0.5">
                  Methane Saved (kg)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50/30 border border-cyan-100/50">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center mx-auto mb-2.5 text-cyan-600 shadow-sm">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-xl font-black text-cyan-600">
                  {sewageStats.years}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-cyan-800/60 mt-0.5">
                  Years Tracked
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}
