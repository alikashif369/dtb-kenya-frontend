"use client";

import { motion } from "framer-motion";
import { TreePine, Zap, Recycle, Users } from "lucide-react";
import CountUp from "./CountUp";

const StatItem = ({ icon: Icon, value, label, delay }: any) => {
  let numericValue = 0;
  let suffix = "";
  let decimals = 0;
  let isCountable = false;

  if (typeof value === "string") {
    const match = value.match(/^([\d,.]+)(.*)$/);
    if (match) {
      const numStr = match[1].replace(/,/g, "");
      numericValue = parseFloat(numStr);
      suffix = match[2];
      decimals = numStr.includes(".") ? numStr.split(".")[1].length : 0;
      isCountable = !isNaN(numericValue);
    }
  } else {
    numericValue = value;
    isCountable = true;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="relative group p-8"
    >
      <div className="absolute inset-0 bg-white border border-serena-green/10 rounded-sm shadow-sm transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-serena-gold/30" />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-6 p-4 rounded-full border border-serena-gold/50 text-serena-gold group-hover:bg-serena-gold group-hover:text-white transition-colors duration-300">
            <Icon className="w-8 h-8" />
        </div>
        
        <h3 className="text-5xl font-serif font-bold text-green-950 mb-3 group-hover:text-serena-green transition-colors duration-300">
            {isCountable ? (
                <CountUp to={numericValue} suffix={suffix} decimals={decimals} duration={3} />
            ) : value}
        </h3>
        
        <p className="text-serena-muted text-xs font-bold uppercase tracking-[0.2em] group-hover:text-serena-gold transition-colors duration-300">
            {label}
        </p>
      </div>
    </motion.div>
  );
};

export default function ImpactStats({ stats }: { stats: any }) {
  // Calculate impact based on 1 million trees planted in Kenya
  const treesPlanted = 1000000; // 1 million trees

  // Formula: 1 tree absorbs ~22kg CO2/year, equivalent to ~0.012 MWh clean energy offset
  // 1M trees = 12,000 MWh = 12 GWh
  const energyGenerated = ((treesPlanted * 0.012) / 1000).toFixed(1); // in GWh

  // Formula: 1 tree produces ~100kg organic matter/year (leaves, branches, soil improvement)
  // 1M trees = 100,000,000 kg = 100,000 tons
  const wasteRecycled = (treesPlanted * 100) / 1000; // in Tons

  // Formula: 1 job per 100 trees (planting, maintenance) + 4 family members per worker
  // (1M/100) * 5 = 50,000 lives impacted
  const livesImpacted = ((treesPlanted / 100) * 5).toLocaleString();

  const data = {
    treesPlanted: stats?.treesPlanted || "1M+",
    energyGenerated: stats?.energyGenerated || `${energyGenerated}GWh`,
    wasteRecycled: stats?.wasteRecycled || `${wasteRecycled.toLocaleString()}T`,
    livesImpacted: stats?.livesImpacted || livesImpacted
  };

  return (
    <section id="impact" className="relative py-32 bg-serena-sand overflow-hidden">
      {/* Background Pattern/Texture Placeholder - Light Mode */}
      <div className="absolute inset-0 opacity-5 bg-[url('/bg-main.jpg')] bg-cover bg-fixed grayscale" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatItem icon={TreePine} value={data.treesPlanted} label="Trees Planted in Kenya" delay={0.1} />
          <StatItem icon={Zap} value={data.energyGenerated} label="Clean Energy Equivalent" delay={0.2} />
          <StatItem icon={Recycle} value={data.wasteRecycled} label="Organic Matter Produced" delay={0.3} />
          <StatItem icon={Users} value={data.livesImpacted} label="Lives Impacted in Kenya" delay={0.4} />
        </div>
      </div>
    </section>
  );
}
