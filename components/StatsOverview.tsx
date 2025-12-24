"use client";

import Counter from "./Counter";
import { Trees, Zap, Recycle, Users } from 'lucide-react'; 

interface StatsOverviewProps {
  stats: {
    treesPlanted: number;
    energyGenerated: number;
    wasteRecycled: number;
    livesImpacted: number;
  } | null;
}

const defaultStats = {
  treesPlanted: 623000,
  energyGenerated: 3300000,
  wasteRecycled: 1000,
  livesImpacted: 10000,
};

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const currentStats = stats ?? defaultStats;

  const formatMillion = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(1) + 'M';
    }
    return val.toLocaleString();
  };
  
  const formatTonnes = (val: number) => {
      return val.toLocaleString() + '+ t';
  };
    
  const formatPlus = (val: number) => {
      return val.toLocaleString() + '+';
  };

  return (
    <section id="stats" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact in Numbers</h2>
          <p className="text-xl text-gray-600">
            Real-time data from our sustainability initiatives across the globe
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* 1. Afforestation (Trees Planted) - Green */}
          <div className="bg-white border-2 border-green-200 rounded-xl p-6 transition hover:shadow-lg">
            {/* START MODIFIED BLOCK: Used flex-grow to push category text */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <Trees className="w-5 h-5 text-green-600 fill-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-green-600 uppercase tracking-wider">AFFORESTATION</span>
                </div>
            </div>
            {/* END MODIFIED BLOCK */}
            <div className="text-4xl font-extrabold text-gray-900 mb-1">
              <Counter value={currentStats.treesPlanted} formatter={formatPlus} />
            </div>
            <div className="text-base text-gray-600 mb-4">Trees Planted</div>
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              500+ hectares covered
            </div>
          </div>

          {/* 2. Solar Energy (Clean Energy Generated) - Orange */}
          <div className="bg-white border-2 border-orange-200 rounded-xl p-6 transition hover:shadow-lg">
             {/* START MODIFIED BLOCK: Used flex-grow to push category text */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-orange-600" /> 
                    </div>
                    <span className="text-sm font-semibold text-orange-600 uppercase tracking-wider">SOLAR ENERGY</span>
                </div>
            </div>
            {/* END MODIFIED BLOCK */}
            <div className="text-4xl font-extrabold text-gray-900 mb-1">
              <Counter value={currentStats.energyGenerated} formatter={formatMillion} /> kWh
            </div>
            <div className="text-base text-gray-600 mb-4">Clean Energy Generated</div>
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              760 tonnes CO₂ avoided
            </div>
          </div>

          {/* 3. Waste Management (Waste Processed) - Amber/Yellow */}
          <div className="bg-white border-2 border-amber-200 rounded-xl p-6 transition hover:shadow-lg">
             {/* START MODIFIED BLOCK: Used flex-grow to push category text */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Recycle className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">WASTE MANAGEMENT</span>
                </div>
            </div>
            {/* END MODIFIED BLOCK */}
            <div className="text-4xl font-extrabold text-gray-900 mb-1">
              <Counter value={currentStats.wasteRecycled} formatter={formatTonnes} />
            </div>
            <div className="text-base text-gray-600 mb-4">Waste Processed</div>
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              365 tonnes compost produced
            </div>
          </div>

          {/* 4. Community (Lives Impacted) - Blue */}
          <div className="bg-white border-2 border-blue-200 rounded-xl p-6 transition hover:shadow-lg">
             {/* START MODIFIED BLOCK: Used flex-grow to push category text */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">COMMUNITY</span>
                </div>
            </div>
            {/* END MODIFIED BLOCK */}
            <div className="text-4xl font-extrabold text-gray-900 mb-1">
              <Counter value={currentStats.livesImpacted} formatter={formatPlus} />
            </div>
            <div className="text-base text-gray-600 mb-4">Lives Impacted</div>
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              180 efficient stoves distributed
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}