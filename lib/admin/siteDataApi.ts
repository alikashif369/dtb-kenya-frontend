// API functions for Site Data management (Plantation, Solar, Waste, Sewage)

import { API_URL, getHeaders, handleResponse } from '../utils/apiConfig';

// ============================================================================
// Plantation Data Types & API
// ============================================================================

export interface PlantationData {
  id: number;
  siteId: number;
  site?: {
    id: number;
    name: string;
    slug: string;
    category?: { id: number; name: string; slug: string };
  };
  plants: number;
  species: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlantationData {
  siteId: number;
  plants: number;
  species: string[];
}

export async function listPlantationData(siteId?: number): Promise<PlantationData[]> {
  const params = new URLSearchParams();
  if (siteId) params.append('siteId', siteId.toString());

  const response = await fetch(`${API_URL}/plantation-data?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<PlantationData[]>(response);
}

export async function getPlantationData(id: number): Promise<PlantationData> {
  const response = await fetch(`${API_URL}/plantation-data/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<PlantationData>(response);
}

export async function createPlantationData(data: CreatePlantationData): Promise<PlantationData> {
  const response = await fetch(`${API_URL}/plantation-data`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<PlantationData>(response);
}

export async function updatePlantationData(id: number, data: Partial<CreatePlantationData>): Promise<PlantationData> {
  const response = await fetch(`${API_URL}/plantation-data/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<PlantationData>(response);
}

export async function deletePlantationData(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/plantation-data/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// Solar Data Types & API
// ============================================================================

export interface SolarData {
  id: number;
  siteId: number;
  site?: {
    id: number;
    name: string;
    slug: string;
    category?: { id: number; name: string; slug: string };
  };
  installationYear: number;
  capacityKwh: number;
  quarterlyProduction: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSolarData {
  siteId: number;
  installationYear: number;
  capacityKwh: number;
  quarterlyProduction: Record<string, number>;
}

export async function listSolarData(siteId?: number): Promise<SolarData[]> {
  const params = new URLSearchParams();
  if (siteId) params.append('siteId', siteId.toString());

  const response = await fetch(`${API_URL}/solar-data?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<SolarData[]>(response);
}

export async function getSolarData(id: number): Promise<SolarData> {
  const response = await fetch(`${API_URL}/solar-data/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<SolarData>(response);
}

export async function createSolarData(data: CreateSolarData): Promise<SolarData> {
  const response = await fetch(`${API_URL}/solar-data`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SolarData>(response);
}

export async function updateSolarData(id: number, data: Partial<CreateSolarData>): Promise<SolarData> {
  const response = await fetch(`${API_URL}/solar-data/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SolarData>(response);
}

export async function deleteSolarData(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/solar-data/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// Waste Data Types & API
// ============================================================================

export interface WasteData {
  id: number;
  siteId: number;
  site?: {
    id: number;
    name: string;
    slug: string;
    category?: { id: number; name: string; slug: string };
  };
  year: number;
  organicWaste: number;
  compostReceived: number;
  methaneRecovered?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWasteData {
  siteId: number;
  year: number;
  organicWaste: number;
  compostReceived: number;
  methaneRecovered?: number;
}

export async function listWasteData(filters?: { siteId?: number; year?: number }): Promise<WasteData[]> {
  const params = new URLSearchParams();
  if (filters?.siteId) params.append('siteId', filters.siteId.toString());
  if (filters?.year) params.append('year', filters.year.toString());

  const response = await fetch(`${API_URL}/waste-data?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<WasteData[]>(response);
}

export async function getWasteData(id: number): Promise<WasteData> {
  const response = await fetch(`${API_URL}/waste-data/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<WasteData>(response);
}

export async function createWasteData(data: CreateWasteData): Promise<WasteData> {
  const response = await fetch(`${API_URL}/waste-data`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<WasteData>(response);
}

export async function updateWasteData(id: number, data: Partial<CreateWasteData>): Promise<WasteData> {
  const response = await fetch(`${API_URL}/waste-data/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<WasteData>(response);
}

export async function deleteWasteData(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/waste-data/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// Sewage Data Types & API
// ============================================================================

export interface SewageData {
  id: number;
  siteId: number;
  site?: {
    id: number;
    name: string;
    slug: string;
    category?: { id: number; name: string; slug: string };
  };
  year: number;
  recoveryRatio: number;
  methaneSaved: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSewageData {
  siteId: number;
  year: number;
  recoveryRatio: number;
  methaneSaved: number;
}

export async function listSewageData(filters?: { siteId?: number; year?: number }): Promise<SewageData[]> {
  const params = new URLSearchParams();
  if (filters?.siteId) params.append('siteId', filters.siteId.toString());
  if (filters?.year) params.append('year', filters.year.toString());

  const response = await fetch(`${API_URL}/sewage-data?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<SewageData[]>(response);
}

export async function getSewageData(id: number): Promise<SewageData> {
  const response = await fetch(`${API_URL}/sewage-data/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<SewageData>(response);
}

export async function createSewageData(data: CreateSewageData): Promise<SewageData> {
  const response = await fetch(`${API_URL}/sewage-data`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SewageData>(response);
}

export async function updateSewageData(id: number, data: Partial<CreateSewageData>): Promise<SewageData> {
  const response = await fetch(`${API_URL}/sewage-data/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SewageData>(response);
}

export async function deleteSewageData(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/sewage-data/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getAvailableYears(): number[] {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = 2019; year <= currentYear; year++) {
    years.push(year);
  }
  return years;
}

export function formatQuarterKey(year: number, quarter: number): string {
  return `Q${quarter}_${year}`;
}

export function parseQuarterKey(key: string): { year: number; quarter: number } | null {
  const match = key.match(/^Q(\d)_(\d{4})$/);
  if (!match) return null;
  return { quarter: parseInt(match[1]), year: parseInt(match[2]) };
}

export function calculateTotalProduction(quarterlyProduction: Record<string, number>): number {
  return Object.values(quarterlyProduction).reduce((sum, val) => sum + (val || 0), 0);
}
