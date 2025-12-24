// TypeScript interfaces for admin panel data types

export interface RasterResponse {
  id: number;
  siteId: number;
  fileName: string;
  originalFileName?: string;
  fileSize: string; // BigInt serialized as string
  mimeType?: string;
  minioUrl: string;
  minioKey: string;
  bbox?: any; // GeoJSON polygon
  center?: { lon: number; lat: number; zoom: number }; // Exact center from TiTiler
  crs?: string;
  width?: number;
  height?: number;
  bandCount?: number;
  isClassified: boolean;
  classifications?: any;
  year: number;
  acquisitionDate?: string;
  uploadedById?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  site?: {
    id: number;
    name: string;
    slug: string;
    category: {
      id: number;
      name: string;
      slug: string;
      region?: {
        id: number;
        name: string;
        slug: string;
        organization?: {
          id: number;
          name: string;
          slug: string;
        };
      };
    };
  };
}

export interface AggregateMetric {
  id: number;
  entityType: 'ORGANIZATION' | 'REGION' | 'CATEGORY';
  organizationId?: number;
  regionId?: number;
  categoryId?: number;
  metricType: string;
  startYear?: number;
  endYear?: number;
  year?: number;
  targetValue?: number;
  achievedValue?: number;
  unit?: string;
  label: string;
  description?: string;
  displayOrder: number;
  details?: any;
  createdAt: string;
  updatedAt: string;
  organization?: { id: number; name: string; slug: string };
  region?: { id: number; name: string; slug: string };
  category?: { id: number; name: string; slug: string };
}

export interface CategorySummary {
  id: number;
  organizationId?: number;
  regionId?: number;
  categoryId?: number;
  title?: string;
  summary: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  organization?: { id: number; name: string; slug: string };
  region?: { id: number; name: string; slug: string };
  category?: { id: number; name: string; slug: string };
}

// Form data types
export interface RasterUploadFormData {
  siteId: number;
  year: number;
  isClassified: boolean;
  file: File | null;
}

export interface MetricFormData {
  entityType: 'ORGANIZATION' | 'REGION' | 'CATEGORY';
  organizationId?: number;
  regionId?: number;
  categoryId?: number;
  metricType: string;
  timePeriodType: 'single' | 'multi';
  year?: number;
  startYear?: number;
  endYear?: number;
  targetValue?: number;
  achievedValue?: number;
  unit?: string;
  label: string;
  description?: string;
  displayOrder: number;
  details?: string; // JSON string
}

export interface SummaryFormData {
  linkTo: 'ORGANIZATION' | 'REGION' | 'CATEGORY';
  organizationId?: number;
  regionId?: number;
  categoryId?: number;
  title?: string;
  summary: string;
  displayOrder: number;
}

// Filter types
export interface RasterFilters {
  siteId?: number;
  year?: number;
  isClassified?: boolean;
}

export interface MetricFilters {
  entityType?: string;
  metricType?: string;
  year?: number;
}

export interface SummaryFilters {
  organizationId?: number;
  regionId?: number;
  categoryId?: number;
}
