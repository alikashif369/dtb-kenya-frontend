// API functions for Species management

import { API_URL, getHeaders, handleResponse } from '../utils/apiConfig';

// ============================================================================
// Types
// ============================================================================

export interface Species {
  id: number;
  code?: string;
  scientificName: string;
  botanicalName?: string;
  localName: string;
  englishName: string;
  description: string;
  uses: string;
  imagePath?: string;
  image1Url?: string;
  image2Url?: string;
  image3Url?: string;
  image4Url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpeciesData {
  code: string;
  scientificName: string;
  botanicalName?: string;
  localName: string;
  englishName: string;
  description: string;
  uses: string;
  image1Url?: string;
  image2Url?: string;
  image3Url?: string;
  image4Url?: string;
}

export interface UpdateSpeciesData {
  scientificName?: string;
  botanicalName?: string;
  localName?: string;
  englishName?: string;
  description?: string;
  uses?: string;
  image1Url?: string;
  image2Url?: string;
  image3Url?: string;
  image4Url?: string;
}

// ============================================================================
// API Functions
// ============================================================================

export async function listSpecies(search?: string): Promise<Species[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const response = await fetch(`${API_URL}/species?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<Species[]>(response);
}

export async function getSpecies(id: number): Promise<Species> {
  const response = await fetch(`${API_URL}/species/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Species>(response);
}

export async function createSpecies(data: CreateSpeciesData): Promise<Species> {
  const response = await fetch(`${API_URL}/species`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Species>(response);
}

export async function updateSpecies(id: number, data: UpdateSpeciesData): Promise<Species> {
  const response = await fetch(`${API_URL}/species/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Species>(response);
}

export async function deleteSpecies(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/species/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete species' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function generateSpeciesCode(scientificName: string): string {
  // Generate a code from the scientific name (first 3 letters of genus + first 3 letters of species)
  const parts = scientificName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].substring(0, 3) + parts[1].substring(0, 3)).toUpperCase();
  }
  return scientificName.substring(0, 6).toUpperCase();
}

export function getSpeciesImages(species: Species): string[] {
  const images: string[] = [];
  if (species.image1Url) images.push(species.image1Url);
  if (species.image2Url) images.push(species.image2Url);
  if (species.image3Url) images.push(species.image3Url);
  if (species.image4Url) images.push(species.image4Url);
  return images;
}
