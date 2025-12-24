"use client";

import DrawMap from "../DrawMap";
import { Check, PenLine, RefreshCw, Trash2, ZoomIn, ZoomOut, Crosshair, Loader } from "lucide-react";
import { useState } from "react";
import { useToast } from "../ToastContext";

export function BoundaryWorkspace({
  polygonData,
  setPolygonData,
  onMapReady,
  vectorFeatures,
  rasterFootprints,
  showVectors,
  showRasters,
  rasterOpacity,
  loadingLayers,
  mapRef,
  drawRef,
  selectedSiteId,
}: any) {
  const [geoLocating, setGeoLocating] = useState(false);
  const { showToast } = useToast();

  const handleGeolocation = () => {
    if (!navigator.geolocation || !mapRef.current) {
      showToast("Geolocation is not available in your browser", "error");
      return;
    }

    setGeoLocating(true);
    
    const timeoutId = setTimeout(() => {
      setGeoLocating(false);
      showToast("Geolocation timed out. Please check your browser permissions.", "error");
    }, 10000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId);
        setGeoLocating(false);
        
        const { longitude, latitude } = pos.coords;
        const olProj = require('ol/proj');
        
        mapRef.current.getView().animate({
          center: olProj.fromLonLat([longitude, latitude]),
          zoom: 16,
          duration: 800,
        });
        
        showToast(`Located at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, "success");
      },
      (error) => {
        clearTimeout(timeoutId);
        setGeoLocating(false);
        
        let message = "Geolocation error";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Geolocation permission denied. Enable location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Your location is currently unavailable. Please try again.";
        } else if (error.code === error.TIMEOUT) {
          message = "Geolocation request timed out.";
        }
        
        showToast(message, "error");
      }
    );
  };
  return (
    <div className="flex-1 relative bg-gray-50">
      <DrawMap
        onPolygonChange={setPolygonData}
        onMapReady={onMapReady}
        existingVectors={vectorFeatures as any}
        rasterFootprints={rasterFootprints as any}
        showVectors={showVectors}
        showRasters={showRasters}
        rasterOpacity={rasterOpacity}
        canDraw={!!selectedSiteId}
      />

      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => mapRef.current?.getView().setZoom(mapRef.current?.getView().getZoom() + 1)}
            className="h-10 w-10 rounded-lg bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapRef.current?.getView().setZoom(mapRef.current?.getView().getZoom() - 1)}
            className="h-10 w-10 rounded-lg bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleGeolocation}
            disabled={geoLocating}
            className="h-10 w-10 rounded-lg bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Geolocate"
            title={geoLocating ? "Acquiring location..." : "Center map on my location"}
          >
            {geoLocating ? (
              <Loader className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Crosshair className="w-4 h-4" />
            )}
          </button>
        </div>

        <button
          onClick={() => drawRef.current?.changeMode?.("draw_polygon")}
          disabled={!selectedSiteId}
          className="h-10 w-10 rounded-lg bg-blue-600 text-white shadow-md border border-blue-700 flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Draw polygon"
          title={selectedSiteId ? "Draw polygon for the selected site" : "Select a site before drawing"}
        >
          <PenLine className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            drawRef.current?.trash?.();
            drawRef.current?.deleteAll?.();
            setPolygonData?.(null);
          }}
          className="h-10 w-10 rounded-lg bg-white shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
          aria-label="Clear drawing"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
        <div className="rounded-lg bg-white/95 px-4 py-2 text-xs text-gray-700 shadow-lg border border-gray-200 flex items-center gap-2 backdrop-blur-sm">
          <Check className="w-4 h-4 text-green-900" />
          Draw polygon on map, then save.
        </div>
      </div>

      {loadingLayers && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 text-gray-700 text-sm rounded-lg">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading...
        </div>
      )}
    </div>
  );
}
