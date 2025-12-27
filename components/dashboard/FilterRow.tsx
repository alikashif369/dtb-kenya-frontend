"use client";

import React, { useMemo } from "react";
import { ChevronDown, X, Filter } from "lucide-react";
import type {
  DashboardFilters,
  HierarchyTree,
  HierarchyTreeOrganization,
  HierarchyTreeRegion,
  HierarchyTreeCategory,
  HierarchyTreeSubCategory,
  HierarchyTreeSite,
} from "./types";

interface FilterRowProps {
  filters: DashboardFilters;
  hierarchy: HierarchyTree | null;
  loading: boolean;
  onFilterChange: (level: keyof DashboardFilters, value: number | null) => void;
}

interface SelectOption {
  value: number;
  label: string;
}

// Custom styled select component
function FilterSelect({
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder = "All",
}: {
  label: string;
  value: number | null;
  options: SelectOption[];
  onChange: (value: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const selectedOption = options.find((opt) => opt.value === value);
  const isDisabled = disabled || options.length === 0;

  return (
    <div className="flex flex-col gap-1.5 min-w-[160px] flex-1 max-w-[220px]">
      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <select
            value={value ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val === "" ? null : parseInt(val, 10));
            }}
            disabled={isDisabled}
            className={`
              w-full appearance-none cursor-pointer
              px-3 py-2.5 pr-8
              bg-white border rounded-lg
              text-sm font-medium
              shadow-sm
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500
              ${isDisabled
                ? "bg-stone-100 text-stone-400 cursor-not-allowed border-stone-200"
                : value !== null
                  ? "border-green-500 bg-green-50 text-green-800"
                  : "border-stone-300 text-stone-700 hover:border-green-400"
              }
            `}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`
              absolute right-2 top-1/2 -translate-y-1/2
              w-4 h-4 pointer-events-none
              ${isDisabled ? "text-stone-300" : value !== null ? "text-green-600" : "text-stone-400"}
            `}
          />
        </div>
        {value !== null && !disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-500 hover:text-red-600 transition-colors flex-shrink-0"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function FilterRow({
  filters,
  hierarchy,
  loading,
  onFilterChange,
}: FilterRowProps) {
  // Debug: log hierarchy state
  React.useEffect(() => {
    console.log("[FilterRow] hierarchy:", hierarchy);
    console.log("[FilterRow] loading:", loading);
    console.log("[FilterRow] organizations count:", hierarchy?.organizations?.length ?? 0);
  }, [hierarchy, loading]);

  // Derive options from hierarchy based on current filter state
  const organizationOptions = useMemo<SelectOption[]>(() => {
    if (!hierarchy?.organizations) return [];
    return hierarchy.organizations.map((org) => ({
      value: org.id,
      label: org.name,
    }));
  }, [hierarchy]);

  const regionOptions = useMemo<SelectOption[]>(() => {
    if (!hierarchy?.organizations || filters.organizationId === null) return [];
    const org = hierarchy.organizations.find(
      (o) => o.id === filters.organizationId
    );
    if (!org?.regions) return [];
    return org.regions.map((region) => ({
      value: region.id,
      label: region.name,
    }));
  }, [hierarchy, filters.organizationId]);

  const categoryOptions = useMemo<SelectOption[]>(() => {
    if (!hierarchy?.organizations || filters.regionId === null) return [];
    const org = hierarchy.organizations.find(
      (o) => o.id === filters.organizationId
    );
    const region = org?.regions?.find((r) => r.id === filters.regionId);
    if (!region?.categories) return [];
    return region.categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    }));
  }, [hierarchy, filters.organizationId, filters.regionId]);

  const subCategoryOptions = useMemo<SelectOption[]>(() => {
    if (!hierarchy?.organizations || filters.categoryId === null) return [];
    const org = hierarchy.organizations.find(
      (o) => o.id === filters.organizationId
    );
    const region = org?.regions?.find((r) => r.id === filters.regionId);
    const category = region?.categories?.find((c) => c.id === filters.categoryId);
    if (!category?.subCategories) return [];
    return category.subCategories.map((sub) => ({
      value: sub.id,
      label: sub.name,
    }));
  }, [hierarchy, filters.organizationId, filters.regionId, filters.categoryId]);

  const siteOptions = useMemo<SelectOption[]>(() => {
    if (!hierarchy?.organizations || filters.categoryId === null) return [];
    const org = hierarchy.organizations.find(
      (o) => o.id === filters.organizationId
    );
    const region = org?.regions?.find((r) => r.id === filters.regionId);
    const category = region?.categories?.find((c) => c.id === filters.categoryId);
    if (!category) return [];

    // If subcategory is selected, filter sites by subcategory
    if (filters.subCategoryId !== null) {
      const subCat = category.subCategories?.find(
        (s) => s.id === filters.subCategoryId
      );
      if (!subCat?.sites) return [];
      return subCat.sites.map((site) => ({
        value: site.id,
        label: site.name,
      }));
    }

    // Otherwise, show all sites in category (including those without subcategory)
    const allSites: SelectOption[] = [];

    // Sites directly under category
    if (category.sites) {
      category.sites.forEach((site) => {
        allSites.push({ value: site.id, label: site.name });
      });
    }

    // Sites under subcategories
    if (category.subCategories) {
      category.subCategories.forEach((sub) => {
        if (sub.sites) {
          sub.sites.forEach((site) => {
            allSites.push({ value: site.id, label: site.name });
          });
        }
      });
    }

    return allSites;
  }, [
    hierarchy,
    filters.organizationId,
    filters.regionId,
    filters.categoryId,
    filters.subCategoryId,
  ]);

  // Handle cascading filter changes
  const handleFilterChange = (
    level: keyof DashboardFilters,
    value: number | null
  ) => {
    onFilterChange(level, value);

    // Clear downstream filters
    if (level === "organizationId") {
      onFilterChange("regionId", null);
      onFilterChange("categoryId", null);
      onFilterChange("subCategoryId", null);
      onFilterChange("siteId", null);
    } else if (level === "regionId") {
      onFilterChange("categoryId", null);
      onFilterChange("subCategoryId", null);
      onFilterChange("siteId", null);
    } else if (level === "categoryId") {
      onFilterChange("subCategoryId", null);
      onFilterChange("siteId", null);
    } else if (level === "subCategoryId") {
      onFilterChange("siteId", null);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFilterChange("organizationId", null);
    onFilterChange("regionId", null);
    onFilterChange("categoryId", null);
    onFilterChange("subCategoryId", null);
    onFilterChange("siteId", null);
  };

  const hasActiveFilters =
    filters.organizationId !== null ||
    filters.regionId !== null ||
    filters.categoryId !== null ||
    filters.subCategoryId !== null ||
    filters.siteId !== null;

  return (
    <div className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-green-700" />
            <h2 className="text-sm font-semibold text-stone-700">
              Filter Sites
            </h2>
            {loading && (
              <span className="text-xs text-stone-400 animate-pulse">
                Loading...
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>

        {/* No data warning */}
        {!loading && organizationOptions.length === 0 && (
          <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            No organization data available. Please check your API connection.
          </div>
        )}

        {/* Filter dropdowns */}
        <div className="flex flex-wrap gap-4">
          <FilterSelect
            label="Organization"
            value={filters.organizationId}
            options={organizationOptions}
            onChange={(val) => handleFilterChange("organizationId", val)}
            disabled={loading}
            placeholder="All Organizations"
          />

          <FilterSelect
            label="Region"
            value={filters.regionId}
            options={regionOptions}
            onChange={(val) => handleFilterChange("regionId", val)}
            disabled={loading || filters.organizationId === null}
            placeholder="All Regions"
          />

          <FilterSelect
            label="Category"
            value={filters.categoryId}
            options={categoryOptions}
            onChange={(val) => handleFilterChange("categoryId", val)}
            disabled={loading || filters.regionId === null}
            placeholder="All Categories"
          />

          <FilterSelect
            label="Sub-Category"
            value={filters.subCategoryId}
            options={subCategoryOptions}
            onChange={(val) => handleFilterChange("subCategoryId", val)}
            disabled={loading || filters.categoryId === null || subCategoryOptions.length === 0}
            placeholder="All Sub-Categories"
          />

          <FilterSelect
            label="Site"
            value={filters.siteId}
            options={siteOptions}
            onChange={(val) => handleFilterChange("siteId", val)}
            disabled={loading || filters.categoryId === null}
            placeholder="All Sites"
          />
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center gap-2 text-xs text-stone-500">
            <span>Showing:</span>
            {filters.siteId !== null ? (
              <span className="font-medium text-green-700">
                {siteOptions.find((s) => s.value === filters.siteId)?.label || "1 Site"}
              </span>
            ) : (
              <span className="font-medium text-stone-700">
                {siteOptions.length} site{siteOptions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
