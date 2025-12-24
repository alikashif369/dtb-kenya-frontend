/**
 * Error handling utility for consistent error messages and recovery strategies
 */

export interface ApiErrorResponse {
  message: string;
  code: string;
  statusCode: number;
  isRetryable: boolean;
  userMessage: string;
}

export interface ErrorDetails {
  originalError: Error | string;
  userMessage: string;
  code: string;
  statusCode?: number;
  isRetryable: boolean;
  timestamp: string;
}

/**
 * Map HTTP status codes to user-friendly messages
 */
const STATUS_CODE_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input.",
  401: "You are not authorized. Please log in.",
  403: "You don't have permission to perform this action.",
  404: "Resource not found.",
  409: "This item already exists. Please use a different value.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Server error. Please try again later.",
  502: "Gateway error. Please try again later.",
  503: "Service unavailable. Please try again later.",
  504: "Request timeout. Please try again later.",
};

/**
 * Map specific error patterns to user-friendly messages
 */
const ERROR_PATTERN_MESSAGES: Record<string, string> = {
  "unique constraint": "This item already exists. Please use a different name or slug.",
  "foreign key": "Cannot delete - this item is referenced elsewhere.",
  "geojson": "Invalid GeoJSON format. Please check your file.",
  "geometry": "Invalid geometry. Please check your coordinates.",
  "unauthorized": "You need to be logged in to perform this action.",
  "permission denied": "You don't have permission for this action.",
  "not found": "The requested item was not found.",
  "timeout": "The request took too long. Please try again.",
  "network": "Network error. Please check your connection.",
};

/**
 * Determine if an error is retryable
 */
function isRetryable(statusCode?: number, error?: string): boolean {
  if (!statusCode) return false;
  
  // Retryable status codes
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  if (retryableStatuses.includes(statusCode)) return true;
  
  // Retryable error patterns
  if (error?.toLowerCase().includes("timeout")) return true;
  if (error?.toLowerCase().includes("network")) return true;
  
  return false;
}

/**
 * Extract meaningful error message from API response
 */
async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      const json = await response.json();
      return json.message || json.error || `Error: ${response.statusText}`;
    } else {
      const text = await response.text();
      return text.trim() || `Error: ${response.statusText}`;
    }
  } catch {
    return `Error: ${response.statusText}`;
  }
}

/**
 * Map raw error to user-friendly message
 */
function getUserMessage(statusCode: number, rawError: string): string {
  // Check for specific error patterns first
  for (const [pattern, message] of Object.entries(ERROR_PATTERN_MESSAGES)) {
    if (rawError.toLowerCase().includes(pattern)) {
      return message;
    }
  }
  
  // Fall back to status code message
  return STATUS_CODE_MESSAGES[statusCode] || "An unexpected error occurred. Please try again.";
}

/**
 * Handle API errors consistently
 */
export async function handleApiError(
  error: unknown,
  context?: string
): Promise<ErrorDetails> {
  const timestamp = new Date().toISOString();
  let statusCode: number | undefined;
  let rawError = "";
  let code = "UNKNOWN_ERROR";
  
  // Handle Response errors
  if (error instanceof Response) {
    statusCode = error.status;
    rawError = await extractErrorMessage(error);
    code = `HTTP_${statusCode}`;
  }
  // Handle fetch errors
  else if (error instanceof TypeError) {
    rawError = error.message;
    code = "NETWORK_ERROR";
    if (error.message.includes("fetch")) {
      rawError = "Network error. Please check your connection.";
    }
  }
  // Handle standard errors
  else if (error instanceof Error) {
    rawError = error.message;
    code = "ERROR";
  }
  // Handle string errors
  else if (typeof error === "string") {
    rawError = error;
    code = "ERROR";
  }
  // Handle unknown errors
  else {
    rawError = "An unknown error occurred";
    code = "UNKNOWN_ERROR";
  }
  
  const userMessage = getUserMessage(statusCode || 500, rawError);
  const retryable = isRetryable(statusCode, rawError);
  
  // Log for debugging
  console.error("[API Error]", {
    context,
    statusCode,
    code,
    rawError,
    userMessage,
    timestamp,
  });
  
  return {
    originalError: (error instanceof Error ? error : new Error(String(error))) as Error | string,
    userMessage,
    code,
    statusCode,
    isRetryable: retryable,
    timestamp,
  };
}

/**
 * Wrapper for fetch with error handling
 */
export async function fetchWithErrorHandling(
  url: string,
  options?: RequestInit,
  context?: string
): Promise<any> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await handleApiError(response, context);
      throw new Error(error.userMessage);
    }
    
    return await response.json();
  } catch (error) {
    const errorDetails = await handleApiError(error, context);
    throw new Error(errorDetails.userMessage);
  }
}

/**
 * Create a retry strategy with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error("Max retry attempts exceeded");
}

/**
 * Format error for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}
