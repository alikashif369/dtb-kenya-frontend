// API functions for Site-Species management

import { API_URL, getHeaders, handleResponse } from '../utils/apiConfig';

// ============================================================================
// Types
// ============================================================================

export interface SiteSpecies {
  siteId: number;
  speciesId: number;
  plantedCount?: number;
  plantedYear?: number;
  species: {
    id: number;
    code?: string;
    scientificName: string;
    botanicalName?: string;
    localName: string;
    englishName: string;
    image1Url?: string;
  };
}

export interface SpeciesSite {
  siteId: number;
  speciesId: number;
  plantedCount?: number;
  plantedYear?: number;
  site: {
    id: number;
    name: string;
    slug: string;
    district?: string;
    city?: string;
  };
}

export interface AddSpeciesToSiteData {
  speciesId: number;
  plantedCount?: number;
  plantedYear?: number;
}

export interface UpdateSiteSpeciesData {
  plantedCount?: number;
  plantedYear?: number;
}

export interface SiteSpeciesStats {
  totalSpecies: number;
  totalPlanted: number;
  plantedYears: number[];
}

// ============================================================================
// API Functions - Site-centric
// ============================================================================

export async function getSpeciesAtSite(siteId: number): Promise<SiteSpecies[]> {
  const response = await fetch(`${API_URL}/sites/${siteId}/species`, {
    headers: getHeaders(),
  });
  return handleResponse<SiteSpecies[]>(response);
}

export async function getSiteSpeciesStats(siteId: number): Promise<SiteSpeciesStats> {
  const response = await fetch(`${API_URL}/sites/${siteId}/species/stats`, {
    headers: getHeaders(),
  });
  return handleResponse<SiteSpeciesStats>(response);
}

export async function addSpeciesToSite(siteId: number, data: AddSpeciesToSiteData): Promise<SiteSpecies> {
  const response = await fetch(`${API_URL}/sites/${siteId}/species`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SiteSpecies>(response);
}

export async function updateSiteSpecies(
  siteId: number,
  speciesId: number,
  data: UpdateSiteSpeciesData
): Promise<SiteSpecies> {
  const response = await fetch(`${API_URL}/sites/${siteId}/species/${speciesId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SiteSpecies>(response);
}

export async function removeSpeciesFromSite(siteId: number, speciesId: number): Promise<void> {
  const response = await fetch(`${API_URL}/sites/${siteId}/species/${speciesId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to remove species' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// API Functions - Species-centric
// ============================================================================

export async function getSitesForSpecies(speciesId: number): Promise<SpeciesSite[]> {
  const response = await fetch(`${API_URL}/species/${speciesId}/sites`, {
    headers: getHeaders(),
  });
  return handleResponse<SpeciesSite[]>(response);
}
