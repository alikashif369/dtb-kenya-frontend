// API functions for hierarchy management (Organizations, Regions, Categories, SubCategories, Sites)

import { API_URL, getHeaders, handleResponse } from '../utils/apiConfig';

// ============================================================================
// Types
// ============================================================================

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  regions?: Region[];
  _count?: { regions: number };
}

export interface Region {
  id: number;
  name: string;
  slug: string;
  organizationId: number;
  organization?: Organization;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
  _count?: { categories: number };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  type: CategoryType;
  regionId: number;
  region?: Region;
  createdAt: string;
  updatedAt: string;
  subCategories?: SubCategory[];
  sites?: Site[];
  _count?: { sites: number; subCategories: number };
}

export type CategoryType = 'PLANTATION' | 'SOLAR' | 'COMMUNITY' | 'WASTE' | 'SEWAGE' | 'RESTORATION';

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
  sites?: Site[];
  _count?: { sites: number };
}

export interface Site {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  category?: Category;
  subCategoryId?: number;
  subCategory?: SubCategory;
  district?: string;
  city?: string;
  area?: number;
  coordinates?: { lat: number; lng: number; zoom: number };
  siteType: SiteType;
  infrastructure?: string;
  createdAt: string;
  updatedAt: string;
}

export type SiteType =
  | 'HOTEL'
  | 'PLANTATION'
  | 'SOLAR_INSTALLATION'
  | 'COMMUNITY_INITIATIVE'
  | 'WASTE_FACILITY'
  | 'SEWAGE_PLANT'
  | 'CONSERVATION';

// Form data types
export interface CreateOrganizationData {
  name: string;
  slug: string;
  description?: string;
}

export interface CreateRegionData {
  name: string;
  slug: string;
  organizationId: number;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  type: CategoryType;
  regionId: number;
}

export interface CreateSubCategoryData {
  name: string;
  slug: string;
  categoryId: number;
}

export interface CreateSiteData {
  name: string;
  slug: string;
  categoryId: number;
  subCategoryId?: number;
  district?: string;
  city?: string;
  area?: number;
  coordinates?: { lat: number; lng: number; zoom: number };
  siteType: SiteType;
  infrastructure?: string;
}

// ============================================================================
// Organizations API
// ============================================================================

export async function listOrganizations(): Promise<Organization[]> {
  const response = await fetch(`${API_URL}/organizations`, {
    headers: getHeaders(),
  });
  return handleResponse<Organization[]>(response);
}

export async function getOrganization(id: number): Promise<Organization> {
  const response = await fetch(`${API_URL}/organizations/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Organization>(response);
}

export async function createOrganization(data: CreateOrganizationData): Promise<Organization> {
  const response = await fetch(`${API_URL}/organizations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Organization>(response);
}

export async function updateOrganization(id: number, data: Partial<CreateOrganizationData>): Promise<Organization> {
  const response = await fetch(`${API_URL}/organizations/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Organization>(response);
}

export async function deleteOrganization(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/organizations/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete organization' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// Regions API
// ============================================================================

export async function listRegions(organizationId?: number): Promise<Region[]> {
  const params = new URLSearchParams();
  if (organizationId) params.append('organizationId', organizationId.toString());

  const response = await fetch(`${API_URL}/regions?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<Region[]>(response);
}

export async function getRegion(id: number): Promise<Region> {
  const response = await fetch(`${API_URL}/regions/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Region>(response);
}

export async function createRegion(data: CreateRegionData): Promise<Region> {
  const response = await fetch(`${API_URL}/regions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Region>(response);
}

export async function updateRegion(id: number, data: Partial<CreateRegionData>): Promise<Region> {
  const response = await fetch(`${API_URL}/regions/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Region>(response);
}

export async function deleteRegion(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/regions/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete region' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// Categories API
// ============================================================================

export async function listCategories(regionId?: number): Promise<Category[]> {
  const params = new URLSearchParams();
  if (regionId) params.append('regionId', regionId.toString());

  const response = await fetch(`${API_URL}/categories?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<Category[]>(response);
}

export async function getCategory(id: number): Promise<Category> {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Category>(response);
}

export async function createCategory(data: CreateCategoryData): Promise<Category> {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Category>(response);
}

export async function updateCategory(id: number, data: Partial<CreateCategoryData>): Promise<Category> {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Category>(response);
}

export async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete category' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// SubCategories API
// ============================================================================

export async function listSubCategories(categoryId?: number): Promise<SubCategory[]> {
  const params = new URLSearchParams();
  if (categoryId) params.append('categoryId', categoryId.toString());

  const response = await fetch(`${API_URL}/sub-categories?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<SubCategory[]>(response);
}

export async function getSubCategory(id: number): Promise<SubCategory> {
  const response = await fetch(`${API_URL}/sub-categories/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<SubCategory>(response);
}

export async function createSubCategory(data: CreateSubCategoryData): Promise<SubCategory> {
  const response = await fetch(`${API_URL}/sub-categories`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SubCategory>(response);
}

export async function updateSubCategory(id: number, data: Partial<CreateSubCategoryData>): Promise<SubCategory> {
  const response = await fetch(`${API_URL}/sub-categories/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<SubCategory>(response);
}

export async function deleteSubCategory(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/sub-categories/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete subcategory' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// Sites API
// ============================================================================

export interface SiteFilters {
  categoryId?: number;
  subCategoryId?: number;
  siteType?: SiteType;
  search?: string;
}

export async function listSites(filters?: SiteFilters): Promise<Site[]> {
  const params = new URLSearchParams();
  if (filters?.categoryId) params.append('categoryId', filters.categoryId.toString());
  if (filters?.subCategoryId) params.append('subCategoryId', filters.subCategoryId.toString());
  if (filters?.siteType) params.append('siteType', filters.siteType);
  if (filters?.search) params.append('search', filters.search);

  const response = await fetch(`${API_URL}/sites?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<Site[]>(response);
}

export async function getSite(id: number): Promise<Site> {
  const response = await fetch(`${API_URL}/sites/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Site>(response);
}

export async function createSite(data: CreateSiteData): Promise<Site> {
  const response = await fetch(`${API_URL}/sites`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Site>(response);
}

export async function updateSite(id: number, data: Partial<CreateSiteData>): Promise<Site> {
  const response = await fetch(`${API_URL}/sites/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<Site>(response);
}

export async function deleteSite(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/sites/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete site' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

// Generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Constants
export const CATEGORY_TYPES: { value: CategoryType; label: string }[] = [
  { value: 'PLANTATION', label: 'Plantation' },
  { value: 'SOLAR', label: 'Solar' },
  { value: 'COMMUNITY', label: 'Community' },
  { value: 'WASTE', label: 'Waste' },
  { value: 'SEWAGE', label: 'Sewage' },
  { value: 'RESTORATION', label: 'Restoration' },
];

export const SITE_TYPES: { value: SiteType; label: string }[] = [
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'PLANTATION', label: 'Plantation' },
  { value: 'SOLAR_INSTALLATION', label: 'Solar Installation' },
  { value: 'COMMUNITY_INITIATIVE', label: 'Community Initiative' },
  { value: 'WASTE_FACILITY', label: 'Waste Facility' },
  { value: 'SEWAGE_PLANT', label: 'Sewage Plant' },
  { value: 'CONSERVATION', label: 'Conservation' },
];

export function getCategoryTypeLabel(type: CategoryType): string {
  return CATEGORY_TYPES.find(t => t.value === type)?.label || type;
}

export function getSiteTypeLabel(type: SiteType): string {
  return SITE_TYPES.find(t => t.value === type)?.label || type;
}
