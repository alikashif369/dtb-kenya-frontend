// "use client";

// import { useEffect, useRef } from "react";
// import maplibregl, { Map } from "maplibre-gl";

// export default function MapLibreMap() {
//   const mapRef = useRef<HTMLDivElement | null>(null);
//   const mapInstance = useRef<Map | null>(null);

//   useEffect(() => {
//     if (!mapRef.current || mapInstance.current) return;

//     // Initialize MapLibre
//     mapInstance.current = new maplibregl.Map({
//       container: mapRef.current,
//       style: "https://demotiles.maplibre.org/style.json",
//       center: [73.0479, 33.6844], // Islamabad
//       zoom: 5,
//       attributionControl: false,
//     });

//     // Add zoom controls
//     mapInstance.current.addControl(new maplibregl.NavigationControl(), "top-right");

//     return () => {
//       mapInstance.current?.remove();
//     };
//   }, []);

//   return (
//     <div
//       ref={mapRef}
//       className="w-full h-full"
//       style={{ minHeight: "400px", borderRadius: "12px" }}
//     />
//   );
// }
"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
 

export default function MapLibreHero() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256
          }
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm"
          }
        ]
      },
      center: [73.0479, 33.6844],
      zoom: 6,
      interactive: false
    });

    return () => map.remove();
  }, []);

  return <div ref={mapRef} id="heroMap" className="absolute inset-0 opacity-20" />;
}
