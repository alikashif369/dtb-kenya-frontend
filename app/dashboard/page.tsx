import { Metadata } from "next";
import DashboardPage from "@/components/dashboard/DashboardPage";
import PremiumNavbar from "@/components/homepage/PremiumNavbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Dashboard | DTB Kenya",
  description:
    "Interactive GIS dashboard for monitoring Diamond Trust Bank Kenya's tree planting initiatives across schools and sites.",
  keywords: [
    "DTB Kenya",
    "GIS",
    "environmental monitoring",
    "tree planting",
    "schools",
    "sustainability",
  ],
};

export default function Dashboard() {
  return (
    <>
      {/* <PremiumNavbar /> */}
      <main>
        <DashboardPage />
      </main>
      <Footer />
    </>
  );
}
