import { RasterResponse, RasterFilters } from './types';
import { handleApiError } from '../utils/errorHandler';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

/**
 * Upload a GeoTIFF raster file to a site
 */
export async function uploadRaster(
  file: File,
  siteId: number,
  year: number,
  isClassified: boolean
): Promise<RasterResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(
    `${API_BASE}/rasters/upload?siteId=${siteId}&year=${year}&isClassified=${isClassified}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Upload Raster');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * List rasters with optional filters
 */
export async function listRasters(filters: RasterFilters = {}): Promise<RasterResponse[]> {
  const params = new URLSearchParams();

  if (filters.siteId) params.append('siteId', String(filters.siteId));
  if (filters.year) params.append('year', String(filters.year));
  if (filters.isClassified !== undefined) params.append('isClassified', String(filters.isClassified));

  const url = `${API_BASE}/rasters${params.toString() ? `?${params}` : ''}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'List Rasters');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * Get single raster metadata by ID
 */
export async function getRasterMetadata(id: number): Promise<RasterResponse> {
  const res = await fetch(`${API_BASE}/rasters/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Get Raster');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * Refresh raster metadata from TiTiler
 */
export async function refreshRasterMetadata(id: number): Promise<RasterResponse> {
  const res = await fetch(`${API_BASE}/rasters/${id}/refresh-metadata`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Refresh Raster Metadata');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * Delete a raster by ID
 */
export async function deleteRaster(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/rasters/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Delete Raster');
    throw new Error(errorDetails.userMessage);
  }
}

/**
 * Get TiTiler tile URL for a raster
 * Note: Cache key should be added by the caller using raster.updatedAt
 */
export function getRasterTileUrl(rasterId: number): string {
  return `${API_BASE}/rasters/${rasterId}/tiles/{z}/{x}/{y}.png`;
}
