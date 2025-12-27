import { Metadata } from "next";
import DashboardPage from "@/components/dashboard/DashboardPage";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Dashboard | Serena Green",
  description:
    "Interactive GIS dashboard for monitoring Serena Hotels' environmental initiatives including plantations, solar energy, and waste management across all sites.",
  keywords: [
    "Serena Hotels",
    "GIS",
    "environmental monitoring",
    "plantation",
    "solar energy",
    "sustainability",
  ],
};

export default function Dashboard() {
  return (
    <>
      <main>
        <DashboardPage />
      </main>
      <Footer />
    </>
  );
}
