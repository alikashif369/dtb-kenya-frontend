// API functions for Photos management

import { API_URL, getHeaders, getMultipartHeaders, handleResponse } from '../utils/apiConfig';

// ============================================================================
// Types
// ============================================================================

export type PhotoCategory = 'EVENT' | 'SITE' | 'SPECIES' | 'COMMUNITY';

export interface Photo {
  id: number;
  fileName: string;
  originalFileName: string;
  fileSize: string;
  mimeType: string;
  minioUrl: string;
  minioKey: string;
  category: PhotoCategory;
  siteId?: number;
  speciesId?: number;
  year?: number;
  latitude?: number;
  longitude?: number;
  caption?: string;
  description?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  site?: {
    id: number;
    name: string;
    slug: string;
  };
  species?: {
    botanicalName: string;
    localName: string;
  };
}

export interface UploadPhotoData {
  category: PhotoCategory;
  siteId?: number;
  speciesId?: number;
  year?: number;
  latitude?: number;
  longitude?: number;
  caption?: string;
  description?: string;
  tags?: string[];
  file: File;
}

export interface UpdatePhotoData {
  siteId?: number;
  speciesId?: number;
  year?: number;
  latitude?: number;
  longitude?: number;
  caption?: string;
  description?: string;
  tags?: string[];
}

export interface PhotoFilters {
  siteId?: number;
  speciesId?: number;
  year?: number;
  category?: PhotoCategory;
}

// ============================================================================
// API Functions
// ============================================================================

export async function listPhotos(filters?: PhotoFilters): Promise<Photo[]> {
  const params = new URLSearchParams();
  if (filters?.siteId) params.append('siteId', String(filters.siteId));
  if (filters?.speciesId) params.append('speciesId', String(filters.speciesId));
  if (filters?.year) params.append('year', String(filters.year));
  if (filters?.category) params.append('category', filters.category);

  const response = await fetch(`${API_URL}/photos?${params.toString()}`, {
    headers: getHeaders(),
  });
  return handleResponse<Photo[]>(response);
}

export async function getPhoto(id: number): Promise<Photo> {
  const response = await fetch(`${API_URL}/photos/${id}`, {
    headers: getHeaders(),
  });
  return handleResponse<Photo>(response);
}

export async function uploadPhoto(data: UploadPhotoData): Promise<Photo> {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('category', data.category);

  if (data.siteId) formData.append('siteId', String(data.siteId));
  if (data.speciesId) formData.append('speciesId', String(data.speciesId));
  if (data.year) formData.append('year', String(data.year));
  if (data.latitude) formData.append('latitude', String(data.latitude));
  if (data.longitude) formData.append('longitude', String(data.longitude));
  if (data.caption) formData.append('caption', data.caption);
  if (data.description) formData.append('description', data.description);
  if (data.tags && data.tags.length > 0) {
    formData.append('tags', data.tags.join(','));
  }

  // Use multipart headers (no Content-Type - browser sets it for FormData)
  const response = await fetch(`${API_URL}/photos/upload`, {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData,
  });
  return handleResponse<Photo>(response);
}

export async function updatePhoto(id: number, data: UpdatePhotoData): Promise<Photo> {
  const response = await fetch(`${API_URL}/photos/${id}`, {
    method: 'PATCH',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Photo>(response);
}

export async function deletePhoto(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/photos/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to delete photo' }));
    throw new Error(error.message);
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function formatFileSize(bytes: string | number): string {
  const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function getCategoryLabel(category: PhotoCategory): string {
  switch (category) {
    case 'EVENT': return 'Event';
    case 'SITE': return 'Site';
    case 'SPECIES': return 'Species';
    case 'COMMUNITY': return 'Community';
    default: return category;
  }
}

export function getCategoryColor(category: PhotoCategory): string {
  switch (category) {
    case 'EVENT': return 'bg-blue-100 text-blue-800';
    case 'SITE': return 'bg-green-100 text-green-800';
    case 'SPECIES': return 'bg-purple-100 text-purple-800';
    case 'COMMUNITY': return 'bg-amber-100 text-amber-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}
