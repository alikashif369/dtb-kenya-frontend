"use client";

import { useState, useCallback, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2, Trash2, Pentagon } from "lucide-react";
import DrawMap from "@/components/DrawMap";
import SitePanel from "@/components/SitePanel";

export default function AddSitePage() {
  const [polygonData, setPolygonData] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    species: "",
    plants: "",
  });
  const [isDrawing, setIsDrawing] = useState(false);

  const mapRef = useRef<any>(null);
  const drawRef = useRef<any>(null);

  // Stable function reference for DrawMap
  const handlePolygonChange = useCallback((data: any) => {
    setPolygonData(data);
  }, []);

  // Callback to receive map and draw instances from DrawMap
  const handleMapReady = useCallback((map: any, draw: any) => {
    mapRef.current = map;
    drawRef.current = draw;
  }, []);

  // Zoom handlers
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

  const handleStartDrawing = () => {
    if (drawRef.current) {
      drawRef.current.changeMode('draw_polygon');
      setIsDrawing(true);
    }
  };

  const handleClearDrawing = () => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      setPolygonData(null);
      setIsDrawing(false);
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
    <div className="flex w-full h-screen overflow-hidden">
      {/* Map Container - LEFT SIDE */}
      <div className="flex-1 relative">
        <DrawMap 
          onPolygonChange={handlePolygonChange}
          onMapReady={handleMapReady}
        />

        {/* All Controls - Top Right Corner */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          {/* Draw Polygon Button */}
          <button
            onClick={handleStartDrawing}
            disabled={polygonData !== null}
            className={`w-11 h-11 rounded-lg shadow-lg border flex items-center justify-center transition-colors ${
              isDrawing 
                ? 'bg-blue-600 border-blue-700 text-white' 
                : polygonData
                ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50'
            }`}
            title="Draw Polygon"
          >
            <Pentagon className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className="h-px bg-gray-300"></div>

          {/* Zoom Controls */}
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

          {/* Reset View */}
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
              <span className="font-medium">Tip:</span> Click the polygon button to start drawing on the map
            </p>
          </div>
        </div>
      </div>

      {/* Side Panel - RIGHT SIDE */}
      <div className="w-96 flex-shrink-0">
        <SitePanel
          polygonData={polygonData}
          form={form}
          setForm={setForm}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}