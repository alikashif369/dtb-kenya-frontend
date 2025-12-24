// import MapLibreHero from "./MapLibreMap";

// export default function HeroSection({ stats }: { stats: any }) {
//   return (
//     <section id="hero" className="relative h-screen flex items-center justify-center text-white hero-gradient">
//       <MapLibreHero />

//       <div className="relative text-center px-4 z-10">
//         <h1 className="text-5xl md:text-6xl font-bold mb-4 heading-font">
//           Serena Green: Building a Sustainable Future
//         </h1>

//         {/* Counters */}
//         <div className="flex flex-wrap justify-center gap-8 my-8">
//           <div className="text-center">
//             <div className="text-4xl font-bold counter" data-target={stats?.treesPlanted}>{stats?.treesPlanted}</div>
//             <div className="text-lg">Trees Planted</div>
//           </div>
//           <div className="text-center">
//             <div className="text-4xl font-bold counter" data-target={stats?.energyGenerated}>{stats?.energyGenerated}</div>
//             <div className="text-lg">kWh Clean Energy</div>
//           </div>
//           <div className="text-center">
//             <div className="text-4xl font-bold counter" data-target={stats?.wasteRecycled}>{stats?.wasteRecycled}</div>
//             <div className="text-lg">Tonnes Waste Recycled</div>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
//           <a href="dashboard" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-bold transition shadow-lg hover:shadow-xl transform hover:scale-105">
//             <i className="fas fa-chart-line mr-2" /> Open Visualization Dashboard
//           </a>
//           <a href="#stats" className="bg-white text-serena-green hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition border-2 border-green-600">
//             View Stats Below
//           </a>
//         </div>

//         <div className="mt-8 text-sm text-gray-200">
//           <i className="fas fa-info-circle mr-2"></i>
//           Explore our interactive dashboard with real-time land cover analysis across 34 project sites
//         </div>

//         <div className="mt-12 animate-bounce">
//           <i className="fas fa-chevron-down text-3xl"></i>
//         </div>
//       </div>
//     </section>
//   );
// }
// This component should be a client component if MapLibreHero uses browser APIs, 
// otherwise, it can remain a server component. We'll assume a Server Component 
// wrapping a Client Component for the map, which is typical.

 



// src/components/HeroSection.tsx

// Mark as a client component because it imports MapLibreHero, which is client-side.
"use client"; 
import Image from "next/image";
import MapLibreHero from "./MapLibreMap"; 
// CORRECTED: Changed FaInfoCircle to FaCircleInfo
import { FaChartLine, FaChevronDown, FaCircleInfo } from 'react-icons/fa6'; 

export default function HeroSection({ stats }: { stats?: any }) {
  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center text-white hero-gradient"
    >
    
  {/* <MapLibreHero /> */}
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/map.webp" 
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#064E3B]/40" />
         {/* Optional overlay for better text contrast */}
      </div>

      <div className="relative text-center px-4 z-10">
        
        {/* Main Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-12 heading-font">
          Serena Green: Building a Sustainable Future
        </h1>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          
          {/* Dashboard Button */}
<a 
  href="dashboard" 
  className="
    bg-green-900/90 hover:bg-green-900 
    text-white px-8 py-4 rounded-lg 
    text-lg font-bold transition duration-300 
    shadow-lg hover:shadow-xl 
    transform hover:scale-[1.02] 
    flex items-center justify-center space-x-2
  "
>
  <FaChartLine className="w-5 h-5" /> 
  <span>Open Visualization Dashboard</span>
</a>
          
          {/* Stats Button */}
         {/* Stats Button */}
<a 
  href="#stats" 
  className="
    bg-white text-green-900 
    px-8 py-4 rounded-lg text-lg font-semibold 
    border-2 border-green-900

    transition duration-300 
    shadow-lg hover:shadow-xl 
    transform hover:scale-[1.02]

    hover:bg-gray-100
  "
>
  View Stats Below
</a>

        </div>

        {/* Descriptive Text (Usage Corrected) */}
        <div className="mt-8 text-sm text-gray-200 max-w-lg mx-auto flex items-center justify-center">
          <FaCircleInfo className="w-5 h-5 mr-2" /> 
          Explore our interactive dashboard with real-time land cover analysis
        </div>

        {/* Scroll Indicator */}
        <div className="mt-12 opacity-80 animate-bounce">
          <FaChevronDown className="w-6 h-6 mx-auto" />
        </div>
      </div>
    </section>
  );
}