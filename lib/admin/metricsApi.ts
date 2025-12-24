import { AggregateMetric, MetricFilters, MetricFormData } from './types';
import { handleApiError } from '../utils/errorHandler';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

/**
 * Create a new aggregate metric
 */
export async function createMetric(data: MetricFormData): Promise<AggregateMetric> {
  // Transform form data to API payload
  const payload: any = {
    entityType: data.entityType,
    metricType: data.metricType,
    label: data.label,
    displayOrder: data.displayOrder,
  };

  // Set entity ID based on entity type
  if (data.entityType === 'ORGANIZATION' && data.organizationId) {
    payload.organizationId = data.organizationId;
  } else if (data.entityType === 'REGION' && data.regionId) {
    payload.regionId = data.regionId;
  } else if (data.entityType === 'CATEGORY' && data.categoryId) {
    payload.categoryId = data.categoryId;
  }

  // Set time period
  if (data.timePeriodType === 'single' && data.year) {
    payload.year = data.year;
  } else if (data.timePeriodType === 'multi' && data.startYear && data.endYear) {
    payload.startYear = data.startYear;
    payload.endYear = data.endYear;
  }

  // Optional fields
  if (data.targetValue !== undefined) payload.targetValue = data.targetValue;
  if (data.achievedValue !== undefined) payload.achievedValue = data.achievedValue;
  if (data.unit) payload.unit = data.unit;
  if (data.description) payload.description = data.description;

  // Parse JSON details if provided
  if (data.details) {
    try {
      payload.details = JSON.parse(data.details);
    } catch (error) {
      throw new Error('Invalid JSON format in details field');
    }
  }

  const res = await fetch(`${API_BASE}/aggregate-metrics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Create Metric');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * List aggregate metrics with optional filters
 */
export async function listMetrics(filters: MetricFilters = {}): Promise<AggregateMetric[]> {
  const params = new URLSearchParams();

  if (filters.entityType) params.append('entityType', filters.entityType);
  if (filters.metricType) params.append('metricType', filters.metricType);
  if (filters.year) params.append('year', String(filters.year));

  const url = `${API_BASE}/aggregate-metrics${params.toString() ? `?${params}` : ''}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'List Metrics');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * Get single aggregate metric by ID
 */
export async function getMetric(id: number): Promise<AggregateMetric> {
  const res = await fetch(`${API_BASE}/aggregate-metrics/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Get Metric');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * Update an aggregate metric by ID
 */
export async function updateMetric(id: number, data: MetricFormData): Promise<AggregateMetric> {
  // Transform form data to API payload (same as create)
  const payload: any = {
    entityType: data.entityType,
    metricType: data.metricType,
    label: data.label,
    displayOrder: data.displayOrder,
  };

  // Set entity ID based on entity type
  if (data.entityType === 'ORGANIZATION' && data.organizationId) {
    payload.organizationId = data.organizationId;
  } else if (data.entityType === 'REGION' && data.regionId) {
    payload.regionId = data.regionId;
  } else if (data.entityType === 'CATEGORY' && data.categoryId) {
    payload.categoryId = data.categoryId;
  }

  // Set time period
  if (data.timePeriodType === 'single' && data.year) {
    payload.year = data.year;
  } else if (data.timePeriodType === 'multi' && data.startYear && data.endYear) {
    payload.startYear = data.startYear;
    payload.endYear = data.endYear;
  }

  // Optional fields
  if (data.targetValue !== undefined) payload.targetValue = data.targetValue;
  if (data.achievedValue !== undefined) payload.achievedValue = data.achievedValue;
  if (data.unit) payload.unit = data.unit;
  if (data.description) payload.description = data.description;

  // Parse JSON details if provided
  if (data.details) {
    try {
      payload.details = JSON.parse(data.details);
    } catch (error) {
      throw new Error('Invalid JSON format in details field');
    }
  }

  const res = await fetch(`${API_BASE}/aggregate-metrics/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Update Metric');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}

/**
 * Delete an aggregate metric by ID
 */
export async function deleteMetric(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/aggregate-metrics/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Delete Metric');
    throw new Error(errorDetails.userMessage);
  }
}

/**
 * Get metrics grouped by type
 */
export async function getMetricsGrouped(entityType?: string): Promise<any> {
  const params = new URLSearchParams();
  if (entityType) params.append('entityType', entityType);

  const url = `${API_BASE}/aggregate-metrics/grouped${params.toString() ? `?${params}` : ''}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorDetails = await handleApiError(res, 'Get Grouped Metrics');
    throw new Error(errorDetails.userMessage);
  }

  return res.json();
}
