import type { Metadata } from "next";
import "./globals.css";
import AOSInit from "@/components/AOSInit";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Serena Green",
  description: "Sustainability Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* OpenLayers will handle its own CSS imports */}
      </head>
      <body>
        <Navbar />
        
        {/* Push page content below fixed navbar */}
        <div className="pt-20">
          {children}
        </div>
      </body>
    </html>
  );
}