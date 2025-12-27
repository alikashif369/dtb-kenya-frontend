// src/components/MapLibreHero.tsx
// NOTE: This component is currently unused. Using OpenLayers instead.
// The maplibre-gl package is not installed.

"use client";

import React from "react";

export default function MapLibreHero() {
  // MapLibre is not installed - this component is a placeholder
  // Using OpenLayers (DrawMap) instead for all map functionality
  return (
    <div className="absolute inset-0 z-0 w-full h-full bg-stone-100 flex items-center justify-center">
      <p className="text-stone-400">Map placeholder - using OpenLayers</p>
    </div>
  );
}
