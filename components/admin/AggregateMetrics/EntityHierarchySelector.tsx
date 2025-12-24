"use client";

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface EntityHierarchySelectorProps {
  entityType: 'ORGANIZATION' | 'REGION' | 'CATEGORY';
  organizationId?: number;
  regionId?: number;
  categoryId?: number;
  onOrganizationChange: (id: number | undefined) => void;
  onRegionChange: (id: number | undefined) => void;
  onCategoryChange: (id: number | undefined) => void;
  orgs: any[];
  regionsByOrg: Record<number, any[]>;
  categoriesByRegion: Record<number, any[]>;
  loading?: boolean;
}

export default function EntityHierarchySelector({
  entityType,
  organizationId,
  regionId,
  categoryId,
  onOrganizationChange,
  onRegionChange,
  onCategoryChange,
  orgs,
  regionsByOrg,
  categoriesByRegion,
  loading,
}: EntityHierarchySelectorProps) {
  const regions = organizationId ? regionsByOrg[organizationId] || [] : [];
  const categories = regionId ? categoriesByRegion[regionId] || [] : [];

  // Clear dependent fields when entity type changes
  useEffect(() => {
    if (entityType === 'ORGANIZATION') {
      onRegionChange(undefined);
      onCategoryChange(undefined);
    } else if (entityType === 'REGION') {
      onCategoryChange(undefined);
    }
  }, [entityType]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
          Entity Selection
        </h4>
        {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />}
      </div>

      {/* Organization Dropdown - Always shown */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-700">
          Organization {entityType === 'ORGANIZATION' && <span className="text-red-600">*</span>}
        </label>
        <select
          value={organizationId || ''}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : undefined;
            onOrganizationChange(value);
            // Clear dependent fields
            onRegionChange(undefined);
            onCategoryChange(undefined);
          }}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent disabled:bg-gray-100"
          required={entityType === 'ORGANIZATION'}
        >
          <option value="">Choose organization</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      {/* Region Dropdown - Shown for REGION and CATEGORY */}
      {(entityType === 'REGION' || entityType === 'CATEGORY') && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">
            Region {entityType === 'REGION' && <span className="text-red-600">*</span>}
          </label>
          <select
            value={regionId || ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              onRegionChange(value);
              // Clear dependent fields
              onCategoryChange(undefined);
            }}
            disabled={!organizationId}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent disabled:bg-gray-100"
            required={entityType === 'REGION'}
          >
            <option value="">
              {!organizationId ? 'Select organization first' : 'Choose region'}
            </option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Category Dropdown - Shown for CATEGORY only */}
      {entityType === 'CATEGORY' && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">
            Category <span className="text-red-600">*</span>
          </label>
          <select
            value={categoryId || ''}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : undefined;
              onCategoryChange(value);
            }}
            disabled={!regionId}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent disabled:bg-gray-100"
            required
          >
            <option value="">
              {!regionId ? 'Select region first' : 'Choose category'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
        {entityType === 'ORGANIZATION' && (
          <p>Metric will be applied to the selected organization</p>
        )}
        {entityType === 'REGION' && (
          <p>Metric will be applied to the selected region</p>
        )}
        {entityType === 'CATEGORY' && (
          <p>Metric will be applied to the selected category</p>
        )}
      </div>
    </div>
  );
}
