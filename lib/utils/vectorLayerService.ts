/**
 * Service for fetching vector layer data from the API
 */

export interface VectorLayerFeature {
  id: string;
  siteId: number;
  year: number;
  geometry: any;
  properties: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  site: {
    id: number;
    name: string;
    slug: string;
    category: {
      id: number;
      name: string;
      slug: string;
    };
  };
}

export interface VectorLayerResponse {
  success: boolean;
  data: VectorLayerFeature[];
  error?: string;
}

/**
 * Fetches all existing vector layers from the API
 * @returns Promise with the vector layers response
 */
export async function fetchAllVectorLayers(): Promise<VectorLayerResponse> {
  try {
    console.log('[VECTOR_SERVICE] Fetching all vector layers from API...');
    
    const apiUrl = '/api/vector-layers';
    console.log('[VECTOR_SERVICE] API URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': '*/*',
      },
    });

    console.log('[VECTOR_SERVICE] Response status:', response.status);
    console.log('[VECTOR_SERVICE] Response ok:', response.ok);

    if (!response.ok) {
      console.error('[VECTOR_SERVICE] Failed to fetch vector layers:', response.statusText);
      
      if (response.status === 503) {
        console.warn('[VECTOR_SERVICE] Backend service is not available (503)');
        return {
          success: false,
          data: [],
          error: 'Backend service unavailable',
        };
      }
      
      return {
        success: false,
        data: [],
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    console.log('[VECTOR_SERVICE] Received data:', data);
    console.log('[VECTOR_SERVICE] Data type:', typeof data);
    console.log('[VECTOR_SERVICE] Is array:', Array.isArray(data));
    
    // The API returns an array directly based on your curl response
    if (Array.isArray(data)) {
      console.log('[VECTOR_SERVICE] Successfully fetched', data.length, 'vector layers');
      console.log('[VECTOR_SERVICE] First item structure:', data.length > 0 ? data[0] : 'no items');
      
      return {
        success: true,
        data,
      };
    } else if (data && typeof data === 'object' && data.success && Array.isArray(data.data)) {
      // Fallback for wrapped response format
      console.log('[VECTOR_SERVICE] Successfully fetched', data.data.length, 'vector layers (wrapped)');
      return data;
    } else {
      console.error('[VECTOR_SERVICE] Unexpected response format:', data);
      return {
        success: false,
        data: [],
        error: 'Unexpected response format',
      };
    }
  } catch (error) {
    console.error('[VECTOR_SERVICE] Error fetching vector layers:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Normalizes geometry from various formats to GeoJSON geometry
 * Handles:
 * - Direct Polygon/MultiPolygon geometry
 * - FeatureCollection wrapper (extracts first feature)
 * - Nested structures
 */
export function normalizeGeometry(geometryData: any): any | null {
  console.log('[VECTOR_SERVICE] Normalizing geometry, type:', geometryData?.type);
  
  if (!geometryData) {
    console.warn('[VECTOR_SERVICE] No geometry data provided');
    return null;
  }

  // Handle FeatureCollection edge case (some old uploads might have this)
  if (geometryData.type === 'FeatureCollection') {
    console.log('[VECTOR_SERVICE] Found FeatureCollection, extracting first feature');
    if (geometryData.features && geometryData.features.length > 0) {
      console.log('[VECTOR_SERVICE] Extracting geometry from feature 0');
      return normalizeGeometry(geometryData.features[0].geometry);
    } else {
      console.warn('[VECTOR_SERVICE] FeatureCollection has no features');
      return null;
    }
  }

  // Valid geometry types
  const validTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'];
  
  if (validTypes.includes(geometryData.type)) {
    console.log('[VECTOR_SERVICE] Valid geometry type:', geometryData.type);
    return geometryData;
  }

  console.warn('[VECTOR_SERVICE] Unknown geometry type:', geometryData.type);
  return null;
}

/**
 * Converts vector layer features to GeoJSON Feature format
 * suitable for OpenLayers consumption
 */
export function convertToGeoJSONFeatures(vectorLayers: VectorLayerFeature[]): any[] {
  console.log('[VECTOR_SERVICE] Converting', vectorLayers.length, 'vector layers to GeoJSON features');
  
  const features = vectorLayers
    .map((layer, index) => {
      console.log(`[VECTOR_SERVICE] Processing layer ${index + 1}/${vectorLayers.length}, id: ${layer.id}`);
      
      const geometry = normalizeGeometry(layer.geometry);
      
      if (!geometry) {
        console.warn(`[VECTOR_SERVICE] Skipping layer ${layer.id} - invalid geometry`);
        return null;
      }

      const feature = {
        type: 'Feature',
        geometry,
        properties: {
          id: layer.id,
          siteId: layer.siteId,
          siteName: layer.site?.name,
          year: layer.year,
          categoryName: layer.site?.category?.name,
          ...layer.properties,
        },
      };

      console.log(`[VECTOR_SERVICE] Created feature for layer ${layer.id}, geometry type: ${geometry.type}`);
      return feature;
    })
    .filter((f): f is any => f !== null);

  console.log('[VECTOR_SERVICE] Successfully converted', features.length, 'features');
  return features;
}
