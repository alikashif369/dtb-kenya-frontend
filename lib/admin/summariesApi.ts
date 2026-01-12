import { CategorySummary, SummaryFilters, SummaryFormData } from './types';
import { handleApiError } from '../utils/errorHandler';
import { API_URL, getHeaders } from '../utils/apiConfig';

const API_BASE = API_URL;

/**
 * Create a new category summary
 */
export async function createSummary(data: SummaryFormData): Promise<CategorySummary> {
  // Transform form data to API payload
  const payload: any = {
    summary: data.summary,
    displayOrder: data.displayOrder,
  };

  // Set entity IDs - include all parent levels
  if (data.organizationId) payload.organizationId = data.organizationId;
  if (data.regionId) payload.regionId = data.regionId;
  if (data.categoryId) payload.categoryId = data.categoryId;

  // Optional title
  if (data.title) payload.title = data.title;

  const res = await fetch(`${API_BASE}/category-summaries`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Create Summary');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * List category summaries with optional filters
 */
export async function listSummaries(filters: SummaryFilters = {}): Promise<CategorySummary[]> {
  const params = new URLSearchParams();

  if (filters.organizationId) params.append('organizationId', String(filters.organizationId));
  if (filters.regionId) params.append('regionId', String(filters.regionId));
  if (filters.categoryId) params.append('categoryId', String(filters.categoryId));

  const url = `${API_BASE}/category-summaries${params.toString() ? `?${params}` : ''}`;

  const res = await fetch(url, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'List Summaries');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * Get single category summary by ID
 */
export async function getSummary(id: number): Promise<CategorySummary> {
  const res = await fetch(`${API_BASE}/category-summaries/${id}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Get Summary');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * Update a category summary by ID
 */
export async function updateSummary(id: number, data: SummaryFormData): Promise<CategorySummary> {
  // Transform form data to API payload
  const payload: any = {
    summary: data.summary,
    displayOrder: data.displayOrder,
  };

  // Set entity IDs - include all parent levels
  if (data.organizationId) payload.organizationId = data.organizationId;
  if (data.regionId) payload.regionId = data.regionId;
  if (data.categoryId) payload.categoryId = data.categoryId;

  // Optional title
  if (data.title) payload.title = data.title;

  const res = await fetch(`${API_BASE}/category-summaries/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Update Summary');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * Delete a category summary by ID
 */
export async function deleteSummary(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/category-summaries/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Delete Summary');
    throw new Error(errorDetails.userMessage);
  }
}
