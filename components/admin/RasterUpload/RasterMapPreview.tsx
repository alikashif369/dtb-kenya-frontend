"use client";

import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import { X, AlertCircle } from 'lucide-react';
import 'ol/ol.css';
import { RasterResponse } from '@/lib/admin/types';
import { getRasterTileUrl } from '@/lib/admin/rasterApi';

interface RasterMapPreviewProps {
  raster: RasterResponse | null;
  onClose: () => void;
}

export default function RasterMapPreview({ raster, onClose }: RasterMapPreviewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const rasterLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const [opacity, setOpacity] = useState(0.8);
  const [tileLoadError, setTileLoadError] = useState<string | null>(null);
  const [tilesLoaded, setTilesLoaded] = useState(0);
  const [tilesFailed, setTilesFailed] = useState(0);

  if (!raster) return null;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) {
      return;
    }

    console.log('🗺️ Initializing map for raster:', {
      id: raster.id,
      fileName: raster.fileName,
      center: raster.center,
      bbox: raster.bbox,
      crs: raster.crs,
    });

    // Base OSM layer
    const baseLayer = new TileLayer({
      source: new OSM(),
      zIndex: 0,
    });

    // Raster tile layer from TiTiler
    // Use updatedAt timestamp for cache busting - ensures fresh tiles when raster changes
    // but allows caching within the same session
    const cacheKey = new Date(raster.updatedAt).getTime();
    const tileUrl = `${getRasterTileUrl(raster.id)}?_v=${cacheKey}`;
    console.log('📍 Tile URL template:', tileUrl);

    const xyzSource = new XYZ({
      url: tileUrl,
      crossOrigin: 'anonymous',
      // Add error handling
      tileLoadFunction: (tile: any, src: string) => {
        const img = tile.getImage() as HTMLImageElement;
        
        img.onload = () => {
          setTilesLoaded(prev => prev + 1);
        };
        
        img.onerror = () => {
          setTilesFailed(prev => prev + 1);
          console.warn('❌ Tile load failed:', src);
          
          // Show error after multiple failures
          if (tilesFailed > 5) {
            setTileLoadError('Multiple tiles failed to load. The raster may not have data at this zoom level or location.');
          }
        };
        
        img.src = src;
        console.log('📥 Loading tile:', src);
      },
    });

    const rasterLayer = new TileLayer({
      source: xyzSource,
      opacity: opacity,
      zIndex: 1,
    });
    rasterLayerRef.current = rasterLayer;

    // Determine initial map center and zoom
    let initialCenter = fromLonLat([0, 0]); // Default to null island
    let initialZoom = 2; // World view
    let minZoom = undefined;
    let maxZoom = undefined;

    // Try to use exact center from TiTiler if available (most accurate)
    if (raster.center && typeof raster.center === 'object' && 'lon' in raster.center && 'lat' in raster.center) {
      try {
        initialCenter = fromLonLat([raster.center.lon, raster.center.lat]);
        initialZoom = raster.center.zoom || 12;
        console.log('✅ Using TiTiler center:', raster.center);
      } catch (error) {
        console.error('Error using raster center:', error);
      }
    }
    // Fallback: calculate center from bbox if center not available
    else if (raster.bbox && raster.bbox.coordinates) {
      try {
        const coords = raster.bbox.coordinates[0];
        if (coords && coords.length >= 4) {
          const lons = coords.map((c: number[]) => c[0]);
          const lats = coords.map((c: number[]) => c[1]);
          const minLon = Math.min(...lons);
          const maxLon = Math.max(...lons);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);

          const centerLon = (minLon + maxLon) / 2;
          const centerLat = (minLat + maxLat) / 2;

          initialCenter = fromLonLat([centerLon, centerLat]);
          initialZoom = 12; // Good zoom level for raster detail
          console.log('✅ Calculated center from bbox:', { lon: centerLon, lat: centerLat });
        }
      } catch (error) {
        console.error('Error calculating raster bounds:', error);
      }
    } else {
      console.warn('⚠️ No center or bbox available, using default location');
      setTileLoadError('Raster metadata incomplete. Please refresh metadata to get accurate bounds.');
    }

    // Create map
    const map = new Map({
      target: mapContainer.current,
      layers: [baseLayer, rasterLayer],
      view: new View({
        center: initialCenter,
        zoom: initialZoom,
        minZoom: minZoom,
        maxZoom: maxZoom,
      }),
    });
    mapRef.current = map;

    // Log view changes for debugging
    map.getView().on('change:center', () => {
      const center = map.getView().getCenter();
      const zoom = map.getView().getZoom();
      console.log('🔄 View changed:', { center, zoom });
    });

    // Cleanup
    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, [raster]);

  // Update opacity when slider changes
  useEffect(() => {
    if (rasterLayerRef.current) {
      rasterLayerRef.current.setOpacity(opacity);
    }
  }, [opacity]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[80vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Raster Preview</h2>
            <p className="text-sm text-gray-600 mt-1">
              {raster.site?.name || 'Unknown Site'} • {raster.year} • {raster.isClassified ? 'Classified' : 'Base'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Tile Load Error Banner */}
          {tileLoadError && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg max-w-md z-10">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Tile Loading Issue</p>
                  <p className="text-xs text-red-700 mt-1">{tileLoadError}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Try zooming in/out or refreshing raster metadata.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tile Load Stats (for debugging) */}
          {(tilesLoaded > 0 || tilesFailed > 0) && (
            <div className="absolute bottom-20 left-4 bg-white rounded-lg shadow-lg p-2 border border-gray-200 text-xs z-10">
              <div className="text-gray-600">
                Tiles: <span className="text-green-600 font-medium">{tilesLoaded} loaded</span>
                {tilesFailed > 0 && <span className="text-red-600 font-medium ml-2">{tilesFailed} failed</span>}
              </div>
            </div>
          )}

          {/* Opacity Control */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-2 border border-gray-200">
            <label className="text-xs font-medium text-gray-700">Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity * 100}
              onChange={(e) => setOpacity(Number(e.target.value) / 100)}
              className="w-32"
            />
            <div className="text-xs text-gray-600 text-center">{Math.round(opacity * 100)}%</div>
          </div>

          {/* Raster Info */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2 border border-gray-200 max-w-xs z-10">
            <div className="text-xs space-y-1">
              <div>
                <span className="font-medium text-gray-700">File:</span>{' '}
                <span className="text-gray-600">{raster.fileName}</span>
              </div>
              {raster.width && raster.height && (
                <div>
                  <span className="font-medium text-gray-700">Dimensions:</span>{' '}
                  <span className="text-gray-600">
                    {raster.width} × {raster.height} px
                  </span>
                </div>
              )}
              {raster.bandCount && (
                <div>
                  <span className="font-medium text-gray-700">Bands:</span>{' '}
                  <span className="text-gray-600">{raster.bandCount}</span>
                </div>
              )}
              {raster.crs && (
                <div>
                  <span className="font-medium text-gray-700">CRS:</span>{' '}
                  <span className="text-gray-600">{raster.crs}</span>
                </div>
              )}
              {raster.center && (
                <div>
                  <span className="font-medium text-gray-700">Center:</span>{' '}
                  <span className="text-gray-600">
                    {typeof raster.center === 'object' && 'lon' in raster.center
                      ? `${raster.center.lon.toFixed(4)}, ${raster.center.lat.toFixed(4)} (Z${raster.center.zoom})`
                      : 'N/A'}
                  </span>
                </div>
              )}
              {!raster.center && !raster.bbox && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                  <p className="font-medium">⚠️ Metadata Missing</p>
                  <p className="mt-1">Click "Refresh Metadata" in the table to load bounds.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="text-xs text-gray-600">
            Powered by TiTiler • Tiles are dynamically generated from the source GeoTIFF
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
