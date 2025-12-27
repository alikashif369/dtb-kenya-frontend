// Dashboard Types for Serena Hotels GIS Dashboard

// ============================================================================
// Hierarchy Types
// ============================================================================

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description?: string;
  regions?: Region[];
  _count?: { regions: number };
}

export interface Region {
  id: number;
  name: string;
  slug: string;
  organizationId: number;
  organization?: Organization;
  categories?: Category[];
  _count?: { categories: number };
}

export type CategoryType = 'PLANTATION' | 'SOLAR' | 'COMMUNITY' | 'WASTE' | 'SEWAGE' | 'RESTORATION';

export interface Category {
  id: number;
  name: string;
  slug: string;
  type: CategoryType;
  regionId: number;
  region?: Region;
  subCategories?: SubCategory[];
  sites?: Site[];
  _count?: { sites: number; subCategories: number };
}

export interface SubCategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  category?: Category;
  sites?: Site[];
  _count?: { sites: number };
}

export type SiteType =
  | 'HOTEL'
  | 'PLANTATION'
  | 'SOLAR_INSTALLATION'
  | 'COMMUNITY_INITIATIVE'
  | 'WASTE_FACILITY'
  | 'SEWAGE_PLANT'
  | 'CONSERVATION';

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
  yearlyMetrics?: YearlyMetrics[];
}

// ============================================================================
// Metrics Types
// ============================================================================

export interface YearlyMetrics {
  id: number;
  siteId: number;
  year: number;
  treeCanopy: number;
  greenArea: number;
  barrenLand: number;
  wetLand: number;
  snow: number;
  rock: number;
  water: number;
  buildup: number;
  solarPanels: number;
  baseRasterId?: string;
  classifiedRasterId?: string;
}

export type MetricType =
  | 'PLANTATION_TARGET'
  | 'PLANTATION_ACHIEVED'
  | 'PLANTATION_STEWARDSHIP_TOTAL'
  | 'PLANTATION_STEWARDSHIP_ACTIVE'
  | 'SOLAR_CAPACITY_TOTAL'
  | 'SOLAR_PRODUCTION_YEARLY'
  | 'SOLAR_PRODUCTION_QUARTERLY'
  | 'COMMUNITY_STOVES'
  | 'COMMUNITY_SEEDS_DISTRIBUTED'
  | 'COMMUNITY_SEEDS_SOLD'
  | 'COMMUNITY_SOLAR_GEYSERS'
  | 'WASTE_ORGANIC_COLLECTED'
  | 'WASTE_COMPOST_PRODUCED'
  | 'WASTE_METHANE_RECOVERED'
  | 'SEWAGE_RECOVERY_RATIO'
  | 'SEWAGE_METHANE_SAVED'
  | 'CUSTOM';

export type EntityType = 'ORGANIZATION' | 'REGION' | 'CATEGORY';

export interface AggregateMetrics {
  id: number;
  entityType: EntityType;
  organizationId?: number;
  regionId?: number;
  categoryId?: number;
  metricType: MetricType;
  targetValue?: number;
  achievedValue?: number;
  unit?: string;
  label?: string;
  description?: string;
  startYear?: number;
  endYear?: number;
  year?: number;
  displayOrder?: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// Spatial Types
// ============================================================================

export interface SiteBoundary {
  id: string;
  siteId: number;
  year: number;
  geometry: GeoJSONFeatureCollection;
  properties?: Record<string, unknown>;
  site?: Site;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: Record<string, unknown>;
}

export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon' | 'Point' | 'LineString';
  coordinates: number[][][] | number[][][][] | number[] | number[][];
}

export interface Raster {
  id: string;
  siteId: number;
  year: number;
  fileName: string;
  minioUrl: string;
  isClassified: boolean;
  bbox?: { minX: number; minY: number; maxX: number; maxY: number };
  center?: { lon: number; lat: number; zoom: number };
  width?: number;
  height?: number;
}

export interface Photo {
  id: string;
  siteId?: number;
  speciesId?: number;
  category: 'EVENT' | 'SITE' | 'SPECIES';
  year?: number;
  minioUrl: string;
  caption?: string;
  description?: string;
  tags?: string[];
}

// ============================================================================
// Species Types
// ============================================================================

export interface Species {
  id: number;
  code?: string;
  scientificName: string;
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

export interface SiteSpecies {
  siteId: number;
  speciesId: number;
  species?: Species;
  plantedCount?: number;
  plantedYear?: number;
}

// ============================================================================
// Dashboard State Types
// ============================================================================

export interface DashboardFilters {
  organizationId: number | null;
  regionId: number | null;
  categoryId: number | null;
  subCategoryId: number | null;
  siteId: number | null;
}

export interface MapState {
  showVectors: boolean;
  showImagery: boolean;
  showClassified: boolean;
  selectedYear: number | null;
  availableYears: number[];
}

export interface DashboardState {
  filters: DashboardFilters;
  map: MapState;
  data: {
    hierarchy: HierarchyTree | null;
    currentMetrics: YearlyMetrics | null;
    aggregateMetrics: AggregateMetrics[];
    siteBoundaries: SiteBoundary[];
    photos: Photo[];
    species: SiteSpecies[];
  };
  ui: {
    loading: {
      hierarchy: boolean;
      metrics: boolean;
      boundaries: boolean;
      rasters: boolean;
      photos: boolean;
    };
    error: string | null;
  };
}

// ============================================================================
// Hierarchy Tree Type (from /hierarchy/tree endpoint)
// ============================================================================

export interface HierarchyTreeSite {
  id: number;
  name: string;
  slug: string;
  siteType: SiteType;
  coordinates?: { lat: number; lng: number; zoom: number };
}

export interface HierarchyTreeSubCategory {
  id: number;
  name: string;
  slug: string;
  sites: HierarchyTreeSite[];
}

export interface HierarchyTreeCategory {
  id: number;
  name: string;
  slug: string;
  type: CategoryType;
  subCategories: HierarchyTreeSubCategory[];
  sites: HierarchyTreeSite[];
}

export interface HierarchyTreeRegion {
  id: number;
  name: string;
  slug: string;
  categories: HierarchyTreeCategory[];
}

export interface HierarchyTreeOrganization {
  id: number;
  name: string;
  slug: string;
  regions: HierarchyTreeRegion[];
}

export interface HierarchyTree {
  organizations: HierarchyTreeOrganization[];
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface FilterRowProps {
  filters: DashboardFilters;
  hierarchy: HierarchyTree | null;
  loading: boolean;
  onFilterChange: (level: keyof DashboardFilters, value: number | null) => void;
}

export interface DashboardMapProps {
  filters: DashboardFilters;
  boundaries: SiteBoundary[];
  showVectors: boolean;
  showImagery: boolean;
  showClassified: boolean;
  selectedYear: number | null;
  baseRasterId?: string;
  classifiedRasterId?: string;
  onSiteClick?: (siteId: number) => void;
  loading?: boolean;
}

export interface YearSliderProps {
  years: number[];
  selectedYear: number | null;
  onChange: (year: number) => void;
  disabled?: boolean;
}

export interface LandCoverChartProps {
  metrics: YearlyMetrics | null;
  loading?: boolean;
}

export interface CategoryMetricsProps {
  metrics: AggregateMetrics[];
  categoryType?: CategoryType;
  loading?: boolean;
}

export interface SiteDetailsPanelProps {
  site: Site | null;
  metrics: YearlyMetrics | null;
  species: SiteSpecies[];
  photos: Photo[];
  loading?: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export type LoadingState = Record<string, boolean>;

export interface SelectOption {
  value: number;
  label: string;
}
