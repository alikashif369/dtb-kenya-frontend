// src/components/MapLibreHero.tsx

"use client";

import React, { useRef, useEffect } from "react";
import maplibregl from "maplibre-gl";
// import "maplibre-gl/dist/maplibre-gl.css";

export default function MapLibreHero() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    // Prevent initialization if the container is missing or map is already initialized
    if (!mapContainer.current || mapRef.current) return;

    // Use a slight delay to ensure the DOM and Tailwind have fully rendered
    // the container's final height and width before MapLibre calculates its size.
    const initializeMap = setTimeout(() => {
      if (!mapContainer.current) return;

      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        // The style URL and key (AhJK5mc5pnbHDFAy8A9a) are assumed to be correct now.
        style: "https://api.maptiler.com/maps/dataviz/style.json?key=AhJK5mc5pnbHDFAy8A9a",
        center: [77.2, 28.6],
        zoom: 4,
        interactive: false,
        attributionControl: false,
      });

      // Crucial step: Once the map is loaded, force it to resize
      // This is a common requirement when a container's size is determined by React/Next.js layout
      mapRef.current.on('load', () => {
        mapRef.current?.resize();
      });

    }, 100); // 100ms delay

    return () => {
      // Clear timeout and remove map on component unmount
      clearTimeout(initializeMap);
      mapRef.current?.remove();
    };
  }, []);

  return (
    // CRITICAL: Ensure the container is absolutely positioned and fills the space.
    // The minHeight is applied to the parent <section> in HeroSection.tsx for a cleaner fix.
   <div
    ref={mapContainer}
    // CRITICAL CSS: Fill the space and set z-index to 0
    className="absolute inset-0 z-0 w-full h-full" 
    // We rely completely on the parent <section> having min-h-screen
  />
  );
}