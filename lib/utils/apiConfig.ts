// Shared API configuration for all API modules

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

/**
 * Get auth token from cookie
 * Used by all API modules to authenticate requests
 */
export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; auth_token=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Get common headers with auth token
 * Includes Content-Type and Authorization if token exists
 */
export function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Get headers for multipart form data (file uploads)
 * Does NOT include Content-Type (let browser set it for FormData)
 */
export function getMultipartHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Handle API response - throws error for non-OK responses
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));

    // Handle 401 Unauthorized - token might be expired
    if (response.status === 401) {
      throw new Error(error.message || 'You need to be logged in to perform this action.');
    }

    throw new Error(error.message || `HTTP error ${response.status}`);
  }
  return response.json();
}
