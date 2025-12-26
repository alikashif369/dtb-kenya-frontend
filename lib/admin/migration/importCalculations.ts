// Migration utility for importing legacy CALCULATIONS.json data

import { LegacyCalculation, MigrationResult } from './types';
import { upsertYearlyMetrics, CreateYearlyMetricsData } from '../yearlyMetricsApi';
import { listSites, Site } from '../hierarchyApi';

// Years available in the legacy data
const YEARS = [2020, 2021, 2022, 2023, 2024, 2025];

// Field mappings from legacy keys to new schema
const FIELD_MAPPINGS: Record<string, keyof CreateYearlyMetricsData> = {
  'GreenArea': 'greenArea',
  'TreeCanopy': 'treeCanopy',
  'BarrenLand': 'barrenLand',
  'WetLand': 'wetLand',
  'Snow': 'snow',
  'Rock': 'rock',
  'Water': 'water',
  'Buildup': 'buildup',
  'SolarPanels': 'solarPanels',
};

/**
 * Parse legacy calculations JSON file
 */
export function parseLegacyCalculations(jsonContent: string): LegacyCalculation[] {
  try {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data)) {
      throw new Error('Expected an array of calculations');
    }
    return data as LegacyCalculation[];
  } catch (error: any) {
    throw new Error(`Failed to parse calculations JSON: ${error.message}`);
  }
}

/**
 * Extract yearly metrics from a legacy calculation entry
 */
export function extractYearlyMetrics(
  legacy: LegacyCalculation,
  year: number
): Partial<CreateYearlyMetricsData> | null {
  const metrics: Partial<CreateYearlyMetricsData> = { year };
  let hasData = false;

  for (const [legacyPrefix, newField] of Object.entries(FIELD_MAPPINGS)) {
    const key = `${legacyPrefix}${year}`;
    const value = legacy[key];

    if (value !== undefined && value !== null && typeof value === 'number') {
      (metrics as any)[newField] = value;
      hasData = true;
    }
  }

  return hasData ? metrics : null;
}

/**
 * Normalize location name for matching
 */
export function normalizeLocationName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,\-\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find matching site by location name
 */
export function findMatchingSite(
  locationName: string,
  sites: Site[]
): Site | null {
  const normalizedLocation = normalizeLocationName(locationName);

  // Try exact match first
  let match = sites.find(
    site => normalizeLocationName(site.name) === normalizedLocation
  );

  if (match) return match;

  // Try contains match
  match = sites.find(
    site =>
      normalizeLocationName(site.name).includes(normalizedLocation) ||
      normalizedLocation.includes(normalizeLocationName(site.name))
  );

  if (match) return match;

  // Try fuzzy match on slug
  match = sites.find(
    site => site.slug && normalizeLocationName(site.slug).includes(normalizedLocation.replace(/\s/g, '-'))
  );

  return match || null;
}

/**
 * Import calculations from legacy JSON data
 */
export async function importCalculations(
  legacyData: LegacyCalculation[],
  onProgress?: (current: number, total: number, name: string) => void
): Promise<MigrationResult & { unmatchedLocations: string[] }> {
  const result = {
    success: true,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [] as string[],
    unmatchedLocations: [] as string[],
  };

  // Fetch all sites for matching
  let sites: Site[] = [];
  try {
    sites = await listSites();
  } catch (error: any) {
    result.errors.push(`Failed to fetch sites: ${error.message}`);
    result.success = false;
    return result;
  }

  if (sites.length === 0) {
    result.errors.push('No sites found in database. Please create sites first.');
    result.success = false;
    return result;
  }

  const totalOperations = legacyData.length * YEARS.length;
  let currentOperation = 0;

  for (let i = 0; i < legacyData.length; i++) {
    const legacy = legacyData[i];
    const locationName = legacy.Location || `Location ${i + 1}`;

    // Find matching site
    const site = findMatchingSite(locationName, sites);

    if (!site) {
      result.unmatchedLocations.push(locationName);
      currentOperation += YEARS.length;
      continue;
    }

    // Process each year
    for (const year of YEARS) {
      currentOperation++;

      if (onProgress) {
        onProgress(currentOperation, totalOperations, `${locationName} (${year})`);
      }

      try {
        const metrics = extractYearlyMetrics(legacy, year);

        if (!metrics) {
          result.skipped++;
          continue;
        }

        // Prepare the data for upsert
        const data: CreateYearlyMetricsData = {
          siteId: site.id,
          year,
          treeCanopy: metrics.treeCanopy,
          greenArea: metrics.greenArea,
          barrenLand: metrics.barrenLand,
          wetLand: metrics.wetLand,
          snow: metrics.snow,
          rock: metrics.rock,
          water: metrics.water,
          buildup: metrics.buildup,
          solarPanels: metrics.solarPanels,
        };

        await upsertYearlyMetrics(data);
        result.created++;

      } catch (error: any) {
        result.errors.push(`${locationName} (${year}): ${error.message}`);
      }
    }
  }

  result.success = result.errors.length === 0;
  return result;
}

/**
 * Validate legacy calculations data before import
 */
export function validateLegacyCalculations(data: LegacyCalculation[]): string[] {
  const errors: string[] = [];
  const locations = new Set<string>();

  data.forEach((item, index) => {
    const row = index + 1;

    if (!item.Location?.trim()) {
      errors.push(`Row ${row}: Missing Location name`);
    } else {
      const locLower = item.Location.toLowerCase().trim();
      if (locations.has(locLower)) {
        // Note: Duplicates are allowed in the legacy data (same site, different entries)
        // This is just a warning
      }
      locations.add(locLower);
    }

    // Check if at least one year has data
    let hasAnyData = false;
    for (const year of YEARS) {
      for (const prefix of Object.keys(FIELD_MAPPINGS)) {
        const key = `${prefix}${year}`;
        if (item[key] !== undefined && item[key] !== null) {
          hasAnyData = true;
          break;
        }
      }
      if (hasAnyData) break;
    }

    if (!hasAnyData) {
      errors.push(`Row ${row}: No metric data found for "${item.Location}"`);
    }
  });

  return errors;
}

/**
 * Get summary of legacy data
 */
export function getLegacyDataSummary(data: LegacyCalculation[]): {
  totalLocations: number;
  yearsAvailable: number[];
  metricsPerYear: Record<number, number>;
} {
  const metricsPerYear: Record<number, number> = {};

  for (const year of YEARS) {
    let count = 0;
    for (const item of data) {
      for (const prefix of Object.keys(FIELD_MAPPINGS)) {
        if (item[`${prefix}${year}`] !== undefined) {
          count++;
          break;
        }
      }
    }
    if (count > 0) {
      metricsPerYear[year] = count;
    }
  }

  return {
    totalLocations: data.length,
    yearsAvailable: Object.keys(metricsPerYear).map(Number),
    metricsPerYear,
  };
}
