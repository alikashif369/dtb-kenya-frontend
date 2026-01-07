// API functions for YearlyMetrics management

import { API_URL, getHeaders, handleResponse } from '../utils/apiConfig';

// ============================================================================
// Types
// ============================================================================

export interface YearlyMetrics {
  id: number;
  siteId: number;
  site?: {
    id: number;
    name: string;
    slug: string;
    category?: {
      id: number;
      name: string;
      slug: string;
      region?: {
        id: number;
        name: string;
        slug: string;
      };
    };
  };
  year: number;

  // Land cover percentages
  treeCanopy?: number;
  greenArea?: number;
  barrenLand?: number;
  wetLand?: number;
  snow?: number;
  rock?: number;
  water?: number;
  buildup?: number;
  solarPanels?: number;

  // Raster references
  baseRasterId?: number;
  baseRaster?: {
    id: number;
    fileName: string;
    minioUrl?: string;
    createdAt: string;
  };
  classifiedRasterId?: number;
  classifiedRaster?: {
    id: number;
    fileName: string;
    minioUrl?: string;
    createdAt: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface CreateYearlyMetricsData {
  siteId: number;
  year: number;
  treeCanopy?: number;
  greenArea?: number;
  barrenLand?: number;
  wetLand?: number;
  snow?: number;
  rock?: number;
  water?: number;
  buildup?: number;
  solarPanels?: number;
  baseRasterId?: number;
  classifiedRasterId?: number;
}

export interface UpdateYearlyMetricsData {
  treeCanopy?: number;
  greenArea?: number;
  barrenLand?: number;
  wetLand?: number;
  snow?: number;
  rock?: number;
  water?: number;
  buildup?: number;
  solarPanels?: number;
  baseRasterId?: number;
  classifiedRasterId?: number;
}

export interface YearlyMetricsFilters {
  siteId?: number;
  year?: number;
  minYear?: number;
  maxYear?: number;
}

// ============================================================================
// API Functions
// ============================================================================

export async function listYearlyMetrics(filters?: YearlyMetricsFilters): Promise<YearlyMetrics[]> {
  const params = new URLSearchParams();
  if (filters?.siteId) params.append('siteId', filters.siteId.toString());
  if (filters?.year) params.append('year', filters.year.toString());
  if (filters?.minYear) params.append('minYear', filters.minYear.toString());
  if (filters?.maxYear) params.append('maxYear', filters.maxYear.toString());

  const response = await fetch(`${API_URL}/yearly-metrics?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<YearlyMetrics[]>(response);
}

export async function getYearlyMetrics(id: number): Promise<YearlyMetrics> {
  const response = await fetch(`${API_URL}/yearly-metrics/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<YearlyMetrics>(response);
}

export async function getMetricsBySiteAndYear(siteId: number, year: number): Promise<YearlyMetrics> {
  const response = await fetch(`${API_URL}/yearly-metrics/site/${siteId}/year/${year}`, {
    headers: getHeaders(),
  });
  return handleResponse<YearlyMetrics>(response);
}

export async function getMetricsBySite(siteId: number, years?: number[]): Promise<YearlyMetrics[]> {
  const params = new URLSearchParams();
  if (years && years.length > 0) {
    params.append('years', years.join(','));
  }

  const response = await fetch(`${API_URL}/yearly-metrics/site/${siteId}?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<YearlyMetrics[]>(response);
}

export async function createYearlyMetrics(data: CreateYearlyMetricsData): Promise<YearlyMetrics> {
  const response = await fetch(`${API_URL}/yearly-metrics`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<YearlyMetrics>(response);
}

export async function upsertYearlyMetrics(data: CreateYearlyMetricsData): Promise<YearlyMetrics> {
  const response = await fetch(`${API_URL}/yearly-metrics/upsert`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<YearlyMetrics>(response);
}

export async function updateYearlyMetrics(id: number, data: UpdateYearlyMetricsData): Promise<YearlyMetrics> {
  const response = await fetch(`${API_URL}/yearly-metrics/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<YearlyMetrics>(response);
}

export async function deleteYearlyMetrics(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/yearly-metrics/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete yearly metrics' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

// Land cover field labels
export const LAND_COVER_FIELDS = [
  { key: 'treeCanopy', label: 'Tree Canopy', color: '#228B22' },
  { key: 'greenArea', label: 'Green Area', color: '#90EE90' },
  { key: 'barrenLand', label: 'Barren Land', color: '#DEB887' },
  { key: 'wetLand', label: 'Wetland', color: '#4682B4' },
  { key: 'snow', label: 'Snow', color: '#FFFAFA' },
  { key: 'rock', label: 'Rock', color: '#808080' },
  { key: 'water', label: 'Water', color: '#1E90FF' },
  { key: 'buildup', label: 'Buildup', color: '#CD853F' },
  { key: 'solarPanels', label: 'Solar Panels', color: '#4169E1' },
] as const;

export type LandCoverField = typeof LAND_COVER_FIELDS[number]['key'];

// Calculate total percentage
export function calculateTotalPercentage(metrics: Partial<YearlyMetrics>): number {
  return LAND_COVER_FIELDS.reduce((total, field) => {
    const value = metrics[field.key as keyof YearlyMetrics];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}

// Get available years for a site (2019 to 2100)
export function getAvailableYears(): number[] {
  const years: number[] = [];
  for (let year = 2019; year <= 2100; year++) {
    years.push(year);
  }
  return years;
}
