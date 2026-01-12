// Constants for admin panel dropdowns and selections

export const ENTITY_TYPES = [
  { value: 'ORGANIZATION', label: 'Organization' },
  { value: 'REGION', label: 'Region' },
  { value: 'CATEGORY', label: 'Category' },
] as const;

export const METRIC_TYPES = [
  // Plantation metrics
  { value: 'PLANTATION_TARGET', label: 'Plantation Target', category: 'Plantation' },
  { value: 'PLANTATION_ACHIEVED', label: 'Plantation Achieved', category: 'Plantation' },
  { value: 'PLANTATION_STEWARDSHIP_TARGET', label: 'Stewardship Target', category: 'Plantation' },
  { value: 'PLANTATION_STEWARDSHIP_ACHIEVED', label: 'Stewardship Achieved', category: 'Plantation' },

  // Solar metrics
  { value: 'SOLAR_CAPACITY_TOTAL', label: 'Solar Capacity Total', category: 'Solar' },
  { value: 'SOLAR_PRODUCTION_ANNUAL', label: 'Solar Production Annual', category: 'Solar' },
  { value: 'SOLAR_PRODUCTION_CUMULATIVE', label: 'Solar Production Cumulative', category: 'Solar' },

  // Community metrics
  { value: 'COMMUNITY_STOVES', label: 'Community Stoves', category: 'Community' },
  { value: 'COMMUNITY_SEEDS_FODDER', label: 'Seeds - Fodder', category: 'Community' },
  { value: 'COMMUNITY_SEEDS_KITCHEN', label: 'Seeds - Kitchen', category: 'Community' },
  { value: 'COMMUNITY_SOLAR_GEYSERS', label: 'Solar Geysers', category: 'Community' },

  // Waste & Sewage metrics
  { value: 'WASTE_ORGANIC_TOTAL', label: 'Organic Waste Total', category: 'Waste' },
  { value: 'WASTE_COMPOST_TOTAL', label: 'Compost Total', category: 'Waste' },
  { value: 'SEWAGE_RECOVERY_TOTAL', label: 'Sewage Recovery Total', category: 'Sewage' },

  // Custom
  { value: 'CUSTOM', label: 'Custom Metric', category: 'Other' },
] as const;

export const RASTER_TYPES = [
  { value: false, label: 'Base Raster', color: 'blue', badgeClass: 'bg-blue-100 text-blue-800' },
  { value: true, label: 'Classified Raster', color: 'green', badgeClass: 'bg-green-100 text-green-800' },
] as const;

export const YEARS = Array.from({ length: 82 }, (_, i) => 2019 + i); // 2019-2100

export const TIME_PERIOD_TYPES = [
  { value: 'single', label: 'Single Year' },
  { value: 'multi', label: 'Multi-Year Range' },
] as const;

// Helper functions
export function getMetricTypeLabel(value: string): string {
  const metric = METRIC_TYPES.find(m => m.value === value);
  return metric ? metric.label : value;
}

export function getMetricTypeCategory(value: string): string {
  const metric = METRIC_TYPES.find(m => m.value === value);
  return metric ? metric.category : 'Other';
}

export function getEntityTypeLabel(value: string): string {
  const entity = ENTITY_TYPES.find(e => e.value === value);
  return entity ? entity.label : value;
}

export function getRasterTypeLabel(isClassified: boolean): string {
  const type = RASTER_TYPES.find(t => t.value === isClassified);
  return type ? type.label : isClassified ? 'Classified' : 'Base';
}

export function getRasterTypeBadgeClass(isClassified: boolean): string {
  const type = RASTER_TYPES.find(t => t.value === isClassified);
  return type ? type.badgeClass : 'bg-gray-100 text-gray-800';
}

// Metric types grouped by category
export const METRIC_TYPES_GROUPED = {
  Plantation: METRIC_TYPES.filter(m => m.category === 'Plantation'),
  Solar: METRIC_TYPES.filter(m => m.category === 'Solar'),
  Community: METRIC_TYPES.filter(m => m.category === 'Community'),
  Waste: METRIC_TYPES.filter(m => m.category === 'Waste'),
  Sewage: METRIC_TYPES.filter(m => m.category === 'Sewage'),
  Other: METRIC_TYPES.filter(m => m.category === 'Other'),
};

// File upload constraints
export const RASTER_FILE_CONSTRAINTS = {
  maxSizeMB: 800,
  maxSizeBytes: 800 * 1024 * 1024,
  acceptedExtensions: ['.tif', '.tiff', '.geotiff'],
  acceptedMimeTypes: ['image/tiff', 'image/tif', 'application/geotiff'],
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
