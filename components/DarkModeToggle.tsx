"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";

// DrawMap Component with Zoom Controls
const DrawMap = ({ onPolygonChange, onMapReady }: any) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const drawRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    // Dynamically import MapLibre and Draw
    let map: any;
    let draw: any;

    const initMap = async () => {
      // @ts-ignore - Optional dependencies for unused component
      const maplibregl = (await import('maplibre-gl')).default;
      // @ts-ignore - Optional dependencies for unused component
      const MapboxDraw = (await import('@mapbox/mapbox-gl-draw')).default;
      // @ts-ignore - Optional dependencies for unused component
      const turf = await import('@turf/turf');

      map = new maplibregl.Map({
        container: mapContainerRef.current!,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [69.3451, 30.3753],
        zoom: 5,
      });

      draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
      });

      map.addControl(draw);

      const updatePolygonData = () => {
        const features = draw.getAll().features;
        if (!features.length) {
          onPolygonChange(null);
          return;
        }

        const polygon = features[0];
        const areaSqMeters = turf.area(polygon);
        const areaAcres = areaSqMeters * 0.000247105;

        onPolygonChange({
          geojson: polygon,
          areaSqMeters,
          areaAcres,
        });
      };

      map.on('draw.create', updatePolygonData);
      map.on('draw.update', updatePolygonData);
      map.on('draw.delete', () => onPolygonChange(null));

      mapRef.current = map;
      drawRef.current = draw;

      if (onMapReady) {
        onMapReady(map, draw);
      }
    };

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, [onPolygonChange, onMapReady]);

  return (
    <div 
      ref={mapContainerRef}
      className="w-full h-full"
    />
  );
};

// SitePanel Component
const SitePanel = ({ polygonData, form, setForm, onSave }: any) => {
  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Add New Site</h2>
        <p className="text-sm text-gray-600 mt-1">
          Draw a polygon on the map and fill in the details
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., North Field"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Species */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Species *
          </label>
          <input
            type="text"
            value={form.species}
            onChange={(e) => setForm({ ...form, species: e.target.value })}
            placeholder="e.g., Wheat"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Number of Plants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Plants
          </label>
          <input
            type="number"
            value={form.plants}
            onChange={(e) => setForm({ ...form, plants: e.target.value })}
            placeholder="e.g., 1000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Area Information */}
        {polygonData ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-900 mb-3">
              Polygon Area
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Square Meters:</span>
                <span className="text-sm font-medium text-green-900">
                  {polygonData.areaSqMeters.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })} m²
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">Acres:</span>
                <span className="text-sm font-medium text-green-900">
                  {polygonData.areaAcres.toLocaleString(undefined, {
                    maximumFractionDigits: 3,
                  })} ac
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Click the polygon tool on the map to start drawing
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onSave}
          disabled={!polygonData || !form.name || !form.species}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Save Site
        </button>
        {(!polygonData || !form.name || !form.species) && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Please complete all required fields and draw a polygon
          </p>
        )}
      </div>
    </div>
  );
};

// Main Page Component
export default function AddSitePage() {
  const [polygonData, setPolygonData] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    species: "",
    plants: "",
  });
  
  const mapRef = useRef<any>(null);
  const drawRef = useRef<any>(null);

  const handlePolygonChange = useCallback((data: any) => {
    setPolygonData(data);
  }, []);

  const handleMapReady = useCallback((map: any, draw: any) => {
    mapRef.current = map;
    drawRef.current = draw;
  }, []);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [69.3451, 30.3753],
        zoom: 5
      });
    }
  };

  const handleClearDrawing = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      handlePolygonChange(null);
    }
  };

  const handleSave = async () => {
    if (!polygonData) {
      alert("Please draw a polygon first!");
      return;
    }

    const payload = {
      ...form,
      polygon: polygonData.geojson,
      areaSqMeters: polygonData.areaSqMeters,
      areaAcres: polygonData.areaAcres,
    };

    try {
      const res = await fetch("/api/save-site", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        alert("Site saved successfully!");
        setForm({ name: "", species: "", plants: "" });
        handleClearDrawing();
      } else {
        const text = await res.text();
        alert("Save failed: " + text);
      }
    } catch (err) {
      alert("Error saving site: " + err);
    }
  };

  return (
    <div className="flex w-full h-screen">
      {/* Map Container - LEFT SIDE */}
      <div className="flex-1 relative">
        <DrawMap 
          onPolygonChange={handlePolygonChange}
          onMapReady={handleMapReady}
        />

        {/* Zoom Controls - Top Right Corner of Map */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="w-11 h-11 flex items-center justify-center hover:bg-blue-50 transition-colors border-b border-gray-200"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-11 h-11 flex items-center justify-center hover:bg-blue-50 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <button
            onClick={handleResetView}
            className="w-11 h-11 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Clear Button - Top Left */}
        {polygonData && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={handleClearDrawing}
              className="px-4 py-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
              title="Clear Drawing"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-medium">Clear Polygon</span>
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 px-4 py-2">
            <p className="text-xs text-gray-600 text-center">
              <span className="font-medium">Tip:</span> Click the polygon icon in the map controls to start drawing
            </p>
          </div>
        </div>
      </div>

      {/* Side Panel - RIGHT SIDE */}
      <SitePanel
        polygonData={polygonData}
        form={form}
        setForm={setForm}
        onSave={handleSave}
      />
    </div>
  );
}