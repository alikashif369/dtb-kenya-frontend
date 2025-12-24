"use client";

import { useRef, useState } from "react";
import { useToast } from "../ToastContext";
import { AlertCircle, Layers, RefreshCw, Ruler, Save, Upload, Wand2, Pentagon, Eraser, Maximize2 } from "lucide-react";
import { HierarchySelector } from "./HierarchySelector";
import { SiteDetailsCard } from "./SiteDetailsCard";
import { HierarchySite } from "./types";
import { handleApiError, formatErrorMessage } from "../../lib/utils/errorHandler";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

type HierarchyLevel = "org" | "region" | "category" | "subCategory" | "site";

type SidebarProps = {
  orgs: any[];
  regionsByOrg: Record<number, any[]>;
  categoriesByRegion: Record<number, any[]>;
  subCatsByCategory: Record<number, any[]>;
  sitesByCategory: Record<number, HierarchySite[]>;
  sitesBySubCategory: Record<number, HierarchySite[]>;
  selectedOrgId: number | null;
  selectedRegionId: number | null;
  selectedCategoryId: number | null;
  selectedSubCategoryId: number | null;
  selectedSiteId: number | null;
  onHierarchyChange: (level: "org" | "region" | "category" | "subCategory" | "site", id: number | null) => void;
  loadingHierarchy: boolean;
  onCreate: (level: HierarchyLevel) => void;
  year: number;
  onYearChange: (year: number) => void;
  selectedSite: HierarchySite | null;
  polygonData: any;
  onSave: () => void;
  saving: boolean;
  onFitView: () => void;
  onClearDrawing: () => void;
  onUploadSuccess: (geojson: any) => void;
  onUploadSaved?: (saved: any) => void;
  onClearUpload: () => void;
  status: string | null;
  years: number[];
  disabledSiteIds?: Set<number>;
};

export function VectorDrawSidebar({
  orgs,
  regionsByOrg,
  categoriesByRegion,
  subCatsByCategory,
  sitesByCategory,
  sitesBySubCategory,
  selectedOrgId,
  selectedRegionId,
  selectedCategoryId,
  selectedSubCategoryId,
  selectedSiteId,
  onHierarchyChange,
  loadingHierarchy,
  onCreate,
  year,
  onYearChange,
  selectedSite,
  polygonData,
  onSave,
  saving,
  onFitView,
  onClearDrawing,
  onUploadSuccess,
  onClearUpload,
  onUploadSaved,
  status,
  years,
  disabledSiteIds,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const parseKML = (kmlText: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(kmlText, 'text/xml');
    const placemarks = doc.querySelectorAll('Placemark');
    const features: any[] = [];

    placemarks.forEach((placemark) => {
      const nameEl = placemark.querySelector('name');
      const coordsEl = placemark.querySelector('coordinates');
      if (coordsEl?.textContent) {
        const coordStr = coordsEl.textContent.trim();
        const coords = coordStr.split(/\s+/).map(c => c.split(',').map(Number)).filter(c => c.length >= 2);
        if (coords.length > 0) {
          const feature = {
            type: 'Feature',
            properties: { name: nameEl?.textContent || 'KML Feature' },
            geometry: {
              type: coords.length > 2 ? 'Polygon' : 'LineString',
              coordinates: coords.length > 2 ? [[...coords.map(([lon, lat]) => [lon, lat])]] : coords.map(([lon, lat]) => [lon, lat]),
            },
          };
          features.push(feature);
        }
      }
    });

    return { type: 'FeatureCollection', features };
  };

  const handleUploadClick = async (fileParam?: File) => {
    // If no site selected, guide the user
    if (!selectedSiteId) {
      showToast("Please select a site before uploading", "error");
      return;
    }

    const fileToUse = fileParam ?? uploadFile;
    // If no file chosen yet, open the file picker so user can select one
    if (!fileToUse) {
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }

    // Set the upload file state
    setUploadFile(fileToUse);

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileToUse.size > maxSize) {
      showToast("File is too large. Maximum size is 5MB.", "error");
      return;
    }

    setUploading(true);
    try {
      const text = await fileToUse.text();
      let geojson: any;

      console.log("[UPLOAD] File name:", fileToUse.name);
      console.log("[UPLOAD] File size:", fileToUse.size);
      console.log("[UPLOAD] Selected site:", selectedSiteId);
      console.log("[UPLOAD] Selected year:", year);

      if (fileToUse.name.endsWith('.kml')) {
        console.log("[UPLOAD] Parsing KML file");
        geojson = parseKML(text);
      } else if (fileToUse.name.endsWith('.geojson') || fileToUse.name.endsWith('.json')) {
        try {
          console.log("[UPLOAD] Parsing GeoJSON file");
          geojson = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid GeoJSON file.');
        }
      } else {
        throw new Error('Unsupported file format. Use .kml or .geojson');
      }

      console.log("[UPLOAD] Parsed GeoJSON:", geojson);

      if (!geojson.features || !Array.isArray(geojson.features) || geojson.features.length === 0) {
        throw new Error('No valid features found in file');
      }

      console.log("[UPLOAD] Features count:", geojson.features.length);

      // Display on map first
      onUploadSuccess(geojson);
      showToast(`Loaded ${geojson.features.length} feature(s). Uploading to server...`, "success");

      // POST to backend - send only the geometry of the first feature (not FeatureCollection)
      const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
      const firstGeometry = geojson.features[0]?.geometry;
      if (!firstGeometry) {
        throw new Error('No geometry found in uploaded file');
      }
      const uploadPayload = {
        siteId: selectedSiteId,
        year: year,
        geometry: firstGeometry,
        properties: {
          source: "upload",
          filename: fileToUse.name,
          uploadedAt: new Date().toISOString(),
        },
      };

      console.log("[UPLOAD] Upload payload:", uploadPayload);
      console.log("[UPLOAD] API Base URL:", API_BASE);
      console.log("[UPLOAD] POST URL:", `${API_BASE}/vectors`);
      console.log("[UPLOAD] Token present:", !!token);

      const res = await fetch(`${API_BASE}/vectors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(uploadPayload),
      });

      console.log("[UPLOAD] Response status:", res.status, res.statusText);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[UPLOAD] Error response:", errorText);
        const errorDetails = await handleApiError(res, "Upload GeoJSON");
        throw new Error(errorDetails.userMessage);
      }

      const savedData = await res.json();
      console.log("[UPLOAD] Saved data from API:", savedData);

      // Show success message
      showToast(`${geojson.features.length} feature(s) uploaded and saved successfully!`, "success");

      // Notify parent about saved boundary so it can update vectorFeatures
      onUploadSaved?.(savedData);

      // Reset upload state - this is important for UI feedback
      setUploadFile(null);
      onClearUpload();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      const errorMsg = formatErrorMessage(err);
      console.error("[UPLOAD] Upload failed:", err);
      showToast(`Upload error: ${errorMsg}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleClearUpload = () => {
    setUploadFile(null);
    onClearUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <aside className="w-96 border-r border-gray-200 bg-white p-4 space-y-4 overflow-y-auto min-h-0 max-h-full">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-green-900" />
        <h1 className="text-xl font-bold text-gray-900">Vector Drawing</h1>
      </div>
      <p className="text-sm text-gray-600">
        Select hierarchy and site, then use drawing tools on the map to create boundaries.
      </p>

      <HierarchySelector
        orgs={orgs}
        regionsByOrg={regionsByOrg}
        categoriesByRegion={categoriesByRegion}
        subCatsByCategory={subCatsByCategory}
        sitesByCategory={sitesByCategory}
        sitesBySubCategory={sitesBySubCategory}
        selectedOrgId={selectedOrgId}
        selectedRegionId={selectedRegionId}
        selectedCategoryId={selectedCategoryId}
        selectedSubCategoryId={selectedSubCategoryId}
        selectedSiteId={selectedSiteId}
        onChange={onHierarchyChange}
        loading={loadingHierarchy}
        disabledSiteIds={disabledSiteIds}
        onCreate={(level) => onCreate(level as HierarchyLevel)}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Year</label>
        <select
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <SiteDetailsCard site={selectedSite} />

      <div className="space-y-2">
        <button
          onClick={onSave}
          disabled={!polygonData || saving || !selectedSiteId || selectedCategoryId === null}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white text-sm font-medium disabled:bg-gray-300 hover:bg-emerald-700 transition shadow-md"
          title={!selectedSiteId ? "Select a site first" : !selectedCategoryId ? "Select a category first" : !polygonData ? "Draw or upload a boundary first" : ""}
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save boundary
        </button>
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-xs text-gray-600 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-gray-800">
          <Upload className="w-4 h-4" /> Upload GeoJSON / KML
        </div>
        <p className="mt-1 text-[11px] text-gray-600">Upload a .geojson or .kml file to draw features on the map.</p>
        <div className="mt-2 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".kml,.geojson,.json,application/geo+json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setUploadFile(file);
                // Auto-upload immediately after selecting a file
                void handleUploadClick(file);
              }
            }}
            disabled={!selectedSiteId}
            title={selectedSiteId ? undefined : "Select a site before uploading"}
            className="w-full text-xs disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {uploadFile && <div className="text-[11px] text-gray-700">Selected: {uploadFile.name}</div>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                // If no file chosen, open picker; otherwise upload
                if (!uploadFile) {
                  if (fileInputRef.current) fileInputRef.current.click();
                  return;
                }
                void handleUploadClick();
              }}
              disabled={uploading || !selectedSiteId}
              className="flex-1 rounded-lg bg-green-900 px-3 py-2 text-xs font-semibold text-white hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              title={selectedSiteId ? undefined : "Select a site before uploading"}
            >
              {uploading ? 'Processing...' : (uploadFile ? 'Upload file' : 'Select file')}
            </button>
            <button
              type="button"
              onClick={handleClearUpload}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
          {/* Status moved to toast notifications */}
        </div>
      </div>

      {polygonData ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 shadow-sm">
          <div className="flex items-center gap-2 font-semibold">
            <Ruler className="w-4 h-4" /> Draft polygon
          </div>
          <div className="mt-2 space-y-1 text-xs text-green-900">
            <div>
              Area: {typeof polygonData.areaSqMeters === 'number' ? polygonData.areaSqMeters.toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' m²' : '—'}
            </div>
            <div>
              Acres: {typeof polygonData.areaAcres === 'number' ? polygonData.areaAcres.toLocaleString(undefined, { maximumFractionDigits: 3 }) : '—'}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-xs text-gray-600 shadow-sm">
          Use the polygon tool on the map to start drawing.
        </div>
      )}

      {status && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 shadow-sm">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          <span>{status}</span>
        </div>
      )}
    </aside>
  );
}
