// app/page.tsx
"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsOverview from "@/components/StatsOverview";
import Testimonials from "@/components/Testimonials";
import SustainabilityTimeline from "@/components/SustainabilityTimeline";
import CountryGrid from "@/components/CountryGrid";
import PartnersSlider from "@/components/PartnersSlider";
import Footer from "@/components/Footer";

const PartnersSliderComponent: any = PartnersSlider;

// Mock data for frontend development
const mockStats = {
  treesPlanted: 1234,
  energyGenerated: 5678,
  wasteRecycled: 910,
  livesImpacted: 1112,
};

const mockPartners = [
  { id: 1, name: "Partner A", logoUrl: "/logos/logo1.png" },
  { id: 2, name: "Partner B", logoUrl: "/logos/logo2.png" },
  { id: 3, name: "Partner C", logoUrl: "/logos/logo3.png" },
];

const mockActivities = [
  { id: 1, title: "Tree Plantation Drive", subtitle: "Planted 500 trees" },
  { id: 2, title: "Clean Energy Workshop", subtitle: "Solar panels installed" },
  { id: 3, title: "Recycling Awareness", subtitle: "Community engaged" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />

      <HeroSection stats={mockStats} />
      <StatsOverview stats={mockStats} />

      <CountryGrid />

      <PartnersSliderComponent partners={mockPartners} />

      <Footer />

      <Footer />
    </>
  );
}
