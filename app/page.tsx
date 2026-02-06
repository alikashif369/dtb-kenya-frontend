// app/page.tsx
"use client";

import PremiumNavbar from "@/components/homepage/PremiumNavbar";
import HeroSlider from "@/components/homepage/HeroSlider";
import ImpactCarousel from "@/components/homepage/ImpactCarousel";
import ImpactStats from "@/components/homepage/ImpactStats";
import MissionSection from "@/components/homepage/MissionSection";
import SpeciesShowcase from "@/components/homepage/SpeciesShowcase";
import Footer from "@/components/Footer";
// COMMENTED OUT - Not used for now
// import CountryGrid from "@/components/CountryGrid";
// import PartnersSlider from "@/components/PartnersSlider";
// const PartnersSliderComponent: any = PartnersSlider;

// Mock data for DTB Kenya (update with real data from API)
const mockStats = {
  treesPlanted: "500K+",
  schoolsReached: "528+",
  countiesServed: "1",
  speciesPlanted: "6+",
};

// COMMENTED OUT - No partners yet
// const mockPartners = [
//   { id: 1, name: "DTB", logoUrl: "/partners/dtb.png" },
//   { id: 2, name: "Partner 2", logoUrl: "/partners/partner2.png" },
//   { id: 3, name: "Partner 3", logoUrl: "/partners/partner3.png" },
// ];

// Old Serena mock data (commented out):
// const mockStats = {
//   treesPlanted: "1.2M+",
//   energyGenerated: "5.6 GWh",
//   wasteRecycled: "850 Tons",
//   livesImpacted: "45,000+",
// };
// const mockPartners = [
//   { id: 1, name: "WWF", logoUrl: "/partners/wwf.png" },
//   { id: 2, name: "AKRSP", logoUrl: "/partners/akrsp.jpg" },
//   { id: 3, name: "NUST", logoUrl: "/partners/nust.jpg" },
//   { id: 4, name: "WeClean", logoUrl: "/partners/weclean.jpg" },
// ];

export default function HomePage() {
  return (
    // Old: selection:bg-serena-green
    <main className="min-h-screen bg-white selection:bg-[#F67910] selection:text-white font-sans">
      <PremiumNavbar />
      
      <HeroSlider />

      <ImpactCarousel />
      
      <MissionSection />
      
      <ImpactStats stats={mockStats} />

      <SpeciesShowcase />

      {/* Partners Section - COMMENTED OUT (No partners yet) */}
      {/* <div id="partners" className="py-24 bg-white">
         <div className="text-center mb-16">
            <span className="text-serena-gold text-sm font-bold uppercase tracking-[0.3em] block mb-4">Collaborations</span>
            <h2 className="text-4xl font-serif font-bold text-green-950">Partnerships</h2>
        </div>
         <PartnersSliderComponent partners={mockPartners} />
      </div> */}

       {/* Map Section - COMMENTED OUT (Only Kenya for now) */}
      {/* <div className="py-24 bg-[#F9F8F6]">
        <div className="text-center mb-16 px-6">
            <span className="text-serena-gold text-sm font-bold uppercase tracking-[0.3em] block mb-4">Our Footprint</span>
            <h2 className="text-4xl font-serif font-bold text-green-950">Regional Presence</h2>
        </div>
        <CountryGrid />
      </div> */}

       <Footer />
    </main>
  );
}
