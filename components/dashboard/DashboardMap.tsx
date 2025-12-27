"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Fill, Text } from "ol/style";
import { fromLonLat, toLonLat } from "ol/proj";
import { defaults as defaultControls } from "ol/control";
import { Zoom, Attribution, ScaleLine } from "ol/control";
import { click } from "ol/events/condition";
import Select from "ol/interaction/Select";
import "ol/ol.css";
import { Feature } from "ol";
import { Geometry } from "ol/geom";

import type { SiteBoundary, DashboardFilters } from "./types";
import { mapColors, serenaBrand } from "./utils/colorPalettes";
import MapToggleButtons from "./MapToggleButtons";
import YearSlider from "./YearSlider";

interface DashboardMapProps {
  boundaries: SiteBoundary[];
  selectedSiteId: number | null;
  showVectors: boolean;
  showImagery: boolean;
  showClassified: boolean;
  baseLayer: "osm" | "satellite";
  selectedYear: number | null;
  availableYears: number[];
  baseRasterTileUrl?: string;
  classifiedRasterTileUrl?: string;
  onSiteClick?: (siteId: number) => void;
  onToggleVectors: () => void;
  onToggleImagery: () => void;
  onToggleClassified: () => void;
  onToggleBaseLayer: () => void;
  onYearChange: (year: number) => void;
  loading?: boolean;
}

export default function DashboardMap({
  boundaries,
  selectedSiteId,
  showVectors,
  showImagery,
  showClassified,
  baseLayer,
  selectedYear,
  availableYears,
  baseRasterTileUrl,
  classifiedRasterTileUrl,
  onSiteClick,
  onToggleVectors,
  onToggleImagery,
  onToggleClassified,
  onToggleBaseLayer,
  onYearChange,
  loading = false,
}: DashboardMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const vectorLayerRef = useRef<VectorLayer<Feature<Geometry>> | null>(null);
  const osmLayerRef = useRef<TileLayer<OSM> | null>(null);
  const satelliteLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const baseRasterLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const classifiedRasterLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const selectInteractionRef = useRef<Select | null>(null);

  // Ref to always have the latest onSiteClick callback (avoids stale closure)
  const onSiteClickRef = useRef(onSiteClick);
  useEffect(() => {
    onSiteClickRef.current = onSiteClick;
  }, [onSiteClick]);

  // Style for vector features - different colors for OSM vs Satellite
  const getVectorStyle = useCallback(
    (feature: Feature<Geometry>, selected: boolean = false) => {
      const siteId = feature.get("siteId");
      const siteName = feature.get("siteName") || feature.get("name") || "";
      const isSelected = siteId === selectedSiteId || selected;
      const isSatellite = baseLayer === "satellite";

      // Use brighter, more visible colors on satellite imagery
      const colors = isSatellite
        ? {
            fill: isSelected ? "rgba(255, 200, 0, 0.4)" : "rgba(0, 255, 255, 0.3)",
            stroke: isSelected ? "#fbbf24" : "#00ffff",
            textFill: "#ffffff",
            textStroke: "#000000",
          }
        : {
            fill: isSelected ? "rgba(249, 115, 22, 0.35)" : "rgba(22, 101, 52, 0.25)",
            stroke: isSelected ? "#f97316" : "#166534",
            textFill: "#1c1917",
            textStroke: "#ffffff",
          };

      return new Style({
        fill: new Fill({
          color: colors.fill,
        }),
        stroke: new Stroke({
          color: colors.stroke,
          width: isSelected ? 4 : 3,
        }),
        text: new Text({
          text: siteName,
          font: "bold 12px Inter, sans-serif",
          fill: new Fill({ color: colors.textFill }),
          stroke: new Stroke({ color: colors.textStroke, width: 4 }),
          overflow: true,
          offsetY: -12,
        }),
      });
    },
    [selectedSiteId, baseLayer]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Vector source and layer
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => getVectorStyle(feature as Feature<Geometry>, false),
      zIndex: 10,
    });
    vectorLayerRef.current = vectorLayer;

    // Base raster layer (hidden by default)
    const baseRasterLayer = new TileLayer({
      source: new XYZ({ url: "" }),
      visible: false,
      opacity: 0.9,
      zIndex: 5,
    });
    baseRasterLayerRef.current = baseRasterLayer;

    // Classified raster layer (hidden by default)
    const classifiedRasterLayer = new TileLayer({
      source: new XYZ({ url: "" }),
      visible: false,
      opacity: 0.85,
      zIndex: 6,
    });
    classifiedRasterLayerRef.current = classifiedRasterLayer;

    // OSM base layer
    const osmLayer = new TileLayer({
      source: new OSM(),
      zIndex: 0,
      visible: true,
    });
    osmLayerRef.current = osmLayer;

    // Satellite base layer (Esri World Imagery)
    const satelliteLayer = new TileLayer({
      source: new XYZ({
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        maxZoom: 19,
        crossOrigin: "anonymous",
      }),
      zIndex: 0,
      visible: false,
    });
    satelliteLayerRef.current = satelliteLayer;

    // Create map
    const map = new Map({
      target: mapContainer.current,
      layers: [osmLayer, satelliteLayer, baseRasterLayer, classifiedRasterLayer, vectorLayer],
      view: new View({
        center: fromLonLat([73.0, 33.5]), // Pakistan center
        zoom: 6,
        minZoom: 4,
        maxZoom: 19,
      }),
      controls: defaultControls({ attribution: false, zoom: false }).extend([
        new Zoom({ className: "ol-zoom custom-zoom" }),
        new ScaleLine({ units: "metric" }),
        new Attribution({ collapsible: true, collapsed: true }),
      ]),
    });
    mapRef.current = map;

    // Select interaction for clicking features
    const selectInteraction = new Select({
      condition: click,
      layers: [vectorLayer],
      style: (feature) => getVectorStyle(feature as Feature<Geometry>, true),
    });
    selectInteractionRef.current = selectInteraction;
    map.addInteraction(selectInteraction);

    // Handle feature click - use ref to always get latest callback
    selectInteraction.on("select", (e) => {
      if (e.selected.length > 0) {
        const feature = e.selected[0];
        const siteId = feature.get("siteId");
        if (siteId && onSiteClickRef.current) {
          onSiteClickRef.current(siteId);
        }
      }
    });

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  // Update vector layer style when selectedSiteId or baseLayer changes
  useEffect(() => {
    if (vectorLayerRef.current) {
      vectorLayerRef.current.setStyle((feature) =>
        getVectorStyle(feature as Feature<Geometry>, false)
      );
    }
    // Clear selection to force style refresh
    if (selectInteractionRef.current) {
      selectInteractionRef.current.getFeatures().clear();
    }
  }, [selectedSiteId, baseLayer, getVectorStyle]);

  // Update boundaries when they change
  useEffect(() => {
    if (!vectorLayerRef.current) return;

    const source = vectorLayerRef.current.getSource();
    if (!source) return;

    source.clear();

    if (boundaries.length === 0) return;

    try {
      const features: Feature<Geometry>[] = [];

      boundaries.forEach((boundary) => {
        if (!boundary.geometry) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let geometry: any = boundary.geometry;

        // Handle FeatureCollection
        if (
          geometry.type === "FeatureCollection" &&
          geometry.features?.length > 0
        ) {
          geometry = geometry.features[0].geometry;
        }

        // Handle Feature
        if (geometry.type === "Feature" && geometry.geometry) {
          geometry = geometry.geometry;
        }

        if (!geometry.type || !geometry.coordinates) return;

        const geojsonFeature = {
          type: "Feature" as const,
          geometry,
          properties: {
            id: boundary.id,
            siteId: boundary.siteId,
            year: boundary.year,
            siteName: boundary.site?.name || "",
            ...boundary.properties,
          },
        };

        const olFeatures = new GeoJSON().readFeatures(
          { type: "FeatureCollection", features: [geojsonFeature] },
          { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" }
        );

        features.push(...(olFeatures as Feature<Geometry>[]));
      });

      source.addFeatures(features);

      // Fit view to features if any
      if (features.length > 0 && mapRef.current) {
        const extent = source.getExtent();
        mapRef.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          maxZoom: 16,
          duration: 500,
        });
      }
    } catch (error) {
      console.error("[DashboardMap] Error adding boundaries:", error);
    }
  }, [boundaries]);

  // Toggle vector layer visibility
  useEffect(() => {
    if (vectorLayerRef.current) {
      vectorLayerRef.current.setVisible(showVectors);
    }
  }, [showVectors]);

  // Toggle base layer (OSM vs Satellite)
  useEffect(() => {
    if (osmLayerRef.current && satelliteLayerRef.current) {
      osmLayerRef.current.setVisible(baseLayer === "osm");
      satelliteLayerRef.current.setVisible(baseLayer === "satellite");
    }
  }, [baseLayer]);

  // Update base raster layer
  useEffect(() => {
    if (!baseRasterLayerRef.current) return;

    if (baseRasterTileUrl && showImagery) {
      baseRasterLayerRef.current.setSource(
        new XYZ({
          url: baseRasterTileUrl,
          crossOrigin: "anonymous",
        })
      );
      baseRasterLayerRef.current.setVisible(true);
    } else {
      baseRasterLayerRef.current.setVisible(false);
    }
  }, [baseRasterTileUrl, showImagery]);

  // Update classified raster layer
  useEffect(() => {
    if (!classifiedRasterLayerRef.current) return;

    if (classifiedRasterTileUrl && showClassified) {
      classifiedRasterLayerRef.current.setSource(
        new XYZ({
          url: classifiedRasterTileUrl,
          crossOrigin: "anonymous",
        })
      );
      classifiedRasterLayerRef.current.setVisible(true);
    } else {
      classifiedRasterLayerRef.current.setVisible(false);
    }
  }, [classifiedRasterTileUrl, showClassified]);

  const singleSiteSelected = selectedSiteId !== null;

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] bg-stone-100 rounded-xl overflow-hidden shadow-lg border border-stone-200">
      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-lg shadow-lg">
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-stone-700">
              Loading map data...
            </span>
          </div>
        </div>
      )}

      {/* Map toggle buttons - top right */}
      <div className="absolute top-4 right-4 z-10">
        <MapToggleButtons
          showVectors={showVectors}
          showImagery={showImagery}
          showClassified={showClassified}
          baseLayer={baseLayer}
          onToggleVectors={onToggleVectors}
          onToggleImagery={onToggleImagery}
          onToggleClassified={onToggleClassified}
          onToggleBaseLayer={onToggleBaseLayer}
          singleSiteSelected={singleSiteSelected}
          loading={loading}
        />
      </div>

      {/* Year slider - bottom left (only when single site selected) */}
      {singleSiteSelected && availableYears.length > 0 && (
        <div className="absolute bottom-4 left-4 z-20 max-w-md">
          <YearSlider
            years={availableYears}
            selectedYear={selectedYear}
            onChange={onYearChange}
            disabled={loading}
            loading={loading}
          />
        </div>
      )}

      {/* Map legend hint - bottom right */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 px-3 py-2 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded border-2"
              style={{
                backgroundColor: baseLayer === "satellite" ? "rgba(0, 255, 255, 0.3)" : "rgba(22, 101, 52, 0.25)",
                borderColor: baseLayer === "satellite" ? "#00ffff" : "#166534",
              }}
            />
            <span>Site</span>
          </div>
          {selectedSiteId && (
            <div className="flex items-center gap-2 mt-1.5">
              <div
                className="w-3 h-3 rounded border-2"
                style={{
                  backgroundColor: baseLayer === "satellite" ? "rgba(255, 200, 0, 0.4)" : "rgba(249, 115, 22, 0.35)",
                  borderColor: baseLayer === "satellite" ? "#fbbf24" : "#f97316",
                }}
              />
              <span>Selected</span>
            </div>
          )}
        </div>
      </div>

      {/* Custom zoom control styles */}
      <style jsx global>{`
        .custom-zoom {
          position: absolute;
          top: auto;
          bottom: 80px;
          right: 16px;
          left: auto;
        }
        .custom-zoom button {
          background: white;
          border: 1px solid #e7e5e4;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          margin: 2px;
          font-size: 18px;
          color: #44403c;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .custom-zoom button:hover {
          background: #f0fdf4;
          border-color: #22c55e;
          color: #166534;
        }
        .ol-scale-line {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 4px;
          padding: 2px 6px;
          bottom: 8px;
          left: 8px;
        }
        .ol-scale-line-inner {
          border-color: #44403c;
          color: #44403c;
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}
