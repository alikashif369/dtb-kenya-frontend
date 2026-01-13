"use client";

import React, { useMemo } from "react";
import { Bar, Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Sun, Zap, TrendingUp, TrendingDown, Leaf, History, Activity } from "lucide-react";
import type { Site } from "./types";
import "./utils/chartConfig";

interface SolarProductionChartProps {
  site: Site;
  selectedYear: number | null;
  loading?: boolean;
}

const EMISSION_FACTOR_T_PER_KWH = 0.00034;

function ChartSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-4">
      <div className="h-48 bg-amber-50 rounded-2xl" />
      <div className="h-48 bg-blue-50 rounded-2xl" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
      <div className="p-8 bg-white rounded-full mb-6 shadow-sm">
        <Sun className="w-12 h-12 text-amber-400" />
      </div>
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Production Data Pending</p>
      <p className="text-xs mt-3 text-gray-500 text-center max-w-[280px] leading-relaxed">
        Energy production telemetry for this installation is being synchronized. Detailed analytics will appear shortly.
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  gradient,
  iconBg,
  iconColor,
  change,
}: {
  icon: any;
  label: string;
  value: string | number;
  unit?: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  change?: { value: number; isPositive: boolean } | null;
}) {
  return (
    <div className={`relative overflow-hidden p-5 rounded-3xl ${gradient} border border-white/20 shadow-lg group hover:shadow-xl transition-all duration-500`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150" />
      
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/70">
          {label}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5 relative z-10">
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
        {unit && <span className="text-sm font-bold text-white/60">{unit}</span>}
      </div>

      {change && (
        <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
          change.isPositive ? 'bg-emerald-400/20 text-emerald-100' : 'bg-red-400/20 text-red-100'
        }`}>
          {change.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change.isPositive ? '+' : ''}{change.value.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export default function SolarProductionChart({
  site,
  selectedYear,
  loading = false,
}: SolarProductionChartProps) {
  const solarData = site.solarData;

  // Optimized Data Parsing: Handles Q1_2023 and 2023_Q1 formats
  const parsedProduction = useMemo(() => {
    if (!solarData?.quarterlyProduction) return {};
    
    const result: Record<number, Record<string, number>> = {};
    
    Object.entries(solarData.quarterlyProduction).forEach(([key, value]) => {
      const parts = key.split('_');
      let year = 0;
      let quarter = '';

      if (parts[0].startsWith('Q')) {
        quarter = parts[0];
        year = parseInt(parts[1]);
      } else {
        year = parseInt(parts[0]);
        quarter = parts[1];
      }

      if (year && quarter) {
        if (!result[year]) result[year] = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
        result[year][quarter] = value;
      }
    });
    
    return result;
  }, [solarData?.quarterlyProduction]);

  const availableYears = useMemo(() => 
    Object.keys(parsedProduction).map(Number).sort((a, b) => a - b), 
    [parsedProduction]
  );

  const currentYear = selectedYear || (availableYears.length > 0 ? availableYears[availableYears.length - 1] : new Date().getFullYear());
  const yearData = parsedProduction[currentYear] || { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  const currentYearTotal = Object.values(yearData).reduce((a, b) => a + b, 0);

  const prevYearTotal = useMemo(() => {
    const data = parsedProduction[currentYear - 1];
    return data ? Object.values(data).reduce((a, b) => a + b, 0) : 0;
  }, [parsedProduction, currentYear]);

  const changePercent = prevYearTotal > 0 ? ((currentYearTotal - prevYearTotal) / prevYearTotal) * 100 : null;
  const co2Saved = currentYearTotal * EMISSION_FACTOR_T_PER_KWH;

  // Bar Chart Data (Quarterly)
  const barData = useMemo(() => ({
    labels: ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'],
    datasets: [{
      label: 'Production',
      data: [yearData.Q1, yearData.Q2, yearData.Q3, yearData.Q4],
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)', // Indigo
        'rgba(16, 185, 129, 0.8)', // Emerald
        'rgba(245, 158, 11, 0.8)', // Amber
        'rgba(20, 184, 166, 0.8)', // Teal
      ],
      borderRadius: 12,
      borderSkipped: false,
    }],
  }), [yearData]);

  // Line Chart Data (Yearly Trend)
  const trendData = useMemo(() => ({
    labels: availableYears.map(String),
    datasets: [{
      label: 'Annual Production (kWh)',
      data: availableYears.map(y => Object.values(parsedProduction[y]).reduce((a, b) => a + b, 0)),
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.05)',
      fill: true,
      tension: 0.4,
      pointRadius: 6,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 3,
      pointHoverRadius: 8,
    }],
  }), [availableYears, parsedProduction]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 13 },
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } },
      y: { 
        beginAtZero: true, 
        grid: { color: '#f1f5f9' }, 
        ticks: { font: { size: 10 }, color: '#94a3b8' }
      }
    }
  };

  if (loading) return <ChartSkeleton />;
  if (availableYears.length === 0) return <EmptyState />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header & Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          icon={Sun}
          label="Est. Capacity"
          value={solarData?.capacityKwh?.toLocaleString() || '–'}
          unit="kWh"
          gradient="bg-gradient-to-br from-amber-400 to-orange-500"
          iconBg="bg-white/20"
          iconColor="text-white"
        />
        <MetricCard
          icon={Zap}
          label={`${currentYear} Total`}
          value={currentYearTotal.toLocaleString()}
          unit="kWh"
          gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
          iconBg="bg-white/20"
          iconColor="text-white"
          change={changePercent !== null ? { value: Math.abs(changePercent), isPositive: changePercent >= 0 } : null}
        />
        <MetricCard
          icon={Leaf}
          label="CO₂ Offset"
          value={co2Saved.toFixed(2)}
          unit="t"
          gradient="bg-gradient-to-br from-blue-500 to-indigo-700"
          iconBg="bg-white/20"
          iconColor="text-white"
        />
        <MetricCard
          icon={History}
          label="Installed"
          value={solarData?.installationYear || '–'}
          gradient="bg-gradient-to-br from-slate-600 to-slate-800"
          iconBg="bg-white/20"
          iconColor="text-white"
        />
      </div>

      <div className="space-y-8">
        {/* Quarterly Production Bar Chart */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="font-bold text-gray-900 tracking-tight">Quarterly Distribution</h4>
            </div>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">{currentYear}</span>
          </div>
          <div className="h-72">
            <Bar data={barData} options={chartOptions as any} />
          </div>
        </div>

        {/* Yearly Trend Line Chart */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="font-bold text-gray-900 tracking-tight">Growth & Trends</h4>
            </div>
            <span className="px-3 py-1 bg-emerald-50 rounded-full text-xs font-bold text-emerald-700">Evolution</span>
          </div>
          <div className="h-72">
            <Line data={trendData} options={chartOptions as any} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
