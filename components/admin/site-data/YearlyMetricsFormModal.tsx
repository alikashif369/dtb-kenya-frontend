"use client";

import { useState, useEffect } from 'react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
  selectClassName,
} from '@/components/admin/shared/FormModal';
import {
  YearlyMetrics,
  CreateYearlyMetricsData,
  createYearlyMetrics,
  updateYearlyMetrics,
  LAND_COVER_FIELDS,
  getAvailableYears,
  calculateTotalPercentage,
} from '@/lib/admin/yearlyMetricsApi';
import {
  Site,
  Category,
  Region,
  Organization,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface YearlyMetricsFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingMetrics: YearlyMetrics | null;
  sites: Site[];
  categories: Category[];
  regions: Region[];
  organizations: Organization[];
  defaultSiteId?: number;
  defaultYear?: number;
}

export default function YearlyMetricsFormModal({
  open,
  onClose,
  onSuccess,
  editingMetrics,
  sites,
  categories,
  regions,
  organizations,
  defaultSiteId,
  defaultYear,
}: YearlyMetricsFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!editingMetrics;
  const years = getAvailableYears();

  // Form state
  const [formData, setFormData] = useState<CreateYearlyMetricsData>({
    siteId: defaultSiteId || 0,
    year: defaultYear || new Date().getFullYear(),
    treeCanopy: undefined,
    greenArea: undefined,
    barrenLand: undefined,
    wetLand: undefined,
    snow: undefined,
    rock: undefined,
    water: undefined,
    buildup: undefined,
    solarPanels: undefined,
    baseRasterId: undefined,
    classifiedRasterId: undefined,
  });
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate total percentage
  const totalPercentage = calculateTotalPercentage(formData);
  const isValidTotal = totalPercentage >= 99.5 && totalPercentage <= 100.5;

  // Filtered dropdown options
  const filteredRegions = selectedOrgId
    ? regions.filter((r) => r.organizationId === selectedOrgId)
    : regions;

  const filteredCategories = selectedRegionId
    ? categories.filter((c) => c.regionId === selectedRegionId)
    : selectedOrgId
    ? categories.filter((c) => {
        const region = regions.find((r) => r.id === c.regionId);
        return region?.organizationId === selectedOrgId;
      })
    : categories;

  const filteredSites = selectedCategoryId
    ? sites.filter((s) => s.categoryId === selectedCategoryId)
    : selectedRegionId
    ? sites.filter((s) => {
        const category = categories.find((c) => c.id === s.categoryId);
        return category?.regionId === selectedRegionId;
      })
    : selectedOrgId
    ? sites.filter((s) => {
        const category = categories.find((c) => c.id === s.categoryId);
        const region = regions.find((r) => r.id === category?.regionId);
        return region?.organizationId === selectedOrgId;
      })
    : sites;

  // Initialize form data when editing
  useEffect(() => {
    if (editingMetrics) {
      setFormData({
        siteId: editingMetrics.siteId,
        year: editingMetrics.year,
        treeCanopy: editingMetrics.treeCanopy ?? undefined,
        greenArea: editingMetrics.greenArea ?? undefined,
        barrenLand: editingMetrics.barrenLand ?? undefined,
        wetLand: editingMetrics.wetLand ?? undefined,
        snow: editingMetrics.snow ?? undefined,
        rock: editingMetrics.rock ?? undefined,
        water: editingMetrics.water ?? undefined,
        buildup: editingMetrics.buildup ?? undefined,
        solarPanels: editingMetrics.solarPanels ?? undefined,
        baseRasterId: editingMetrics.baseRasterId ?? undefined,
        classifiedRasterId: editingMetrics.classifiedRasterId ?? undefined,
      });

      // Find the hierarchy for the editing site
      const site = sites.find((s) => s.id === editingMetrics.siteId);
      const category = categories.find((c) => c.id === site?.categoryId);
      const region = regions.find((r) => r.id === category?.regionId);
      setSelectedCategoryId(category?.id);
      setSelectedRegionId(region?.id);
      setSelectedOrgId(region?.organizationId);
    } else {
      // Find default site's hierarchy
      const defaultSite = sites.find((s) => s.id === defaultSiteId);
      const defaultCategory = categories.find((c) => c.id === defaultSite?.categoryId);
      const defaultRegion = regions.find((r) => r.id === defaultCategory?.regionId);
      setSelectedCategoryId(defaultCategory?.id);
      setSelectedRegionId(defaultRegion?.id);
      setSelectedOrgId(defaultRegion?.organizationId || organizations[0]?.id);

      setFormData({
        siteId: defaultSiteId || 0,
        year: defaultYear || new Date().getFullYear(),
        treeCanopy: undefined,
        greenArea: undefined,
        barrenLand: undefined,
        wetLand: undefined,
        snow: undefined,
        rock: undefined,
        water: undefined,
        buildup: undefined,
        solarPanels: undefined,
        baseRasterId: undefined,
        classifiedRasterId: undefined,
      });
    }
    setErrors({});
  }, [editingMetrics, open, defaultSiteId, defaultYear, sites, categories, regions, organizations]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.siteId) {
      newErrors.siteId = 'Site is required';
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    }

    // Check that at least one land cover field is filled
    const hasLandCoverData = LAND_COVER_FIELDS.some(
      (field) => formData[field.key as keyof CreateYearlyMetricsData] != null
    );
    if (!hasLandCoverData) {
      newErrors.landCover = 'At least one land cover value is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('formData:', formData);
    
    if (!validate()) {
      console.log('Validation failed - showing error toast');
      showToast('Please fill in all required fields', 'error');
      return;
    }

    console.log('Validation passed, submitting...');
    setLoading(true);
    try {
      // Clean up undefined values
      const submitData: CreateYearlyMetricsData = {
        siteId: formData.siteId,
        year: formData.year,
        treeCanopy: formData.treeCanopy,
        greenArea: formData.greenArea,
        barrenLand: formData.barrenLand,
        wetLand: formData.wetLand,
        snow: formData.snow,
        rock: formData.rock,
        water: formData.water,
        buildup: formData.buildup,
        solarPanels: formData.solarPanels,
        baseRasterId: formData.baseRasterId,
        classifiedRasterId: formData.classifiedRasterId,
      };

      if (isEditing) {
        await updateYearlyMetrics(editingMetrics.id, submitData);
        showToast('Yearly metrics updated successfully', 'success');
      } else {
        await createYearlyMetrics(submitData);
        showToast('Yearly metrics created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save yearly metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = (field: keyof CreateYearlyMetricsData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleLandCoverChange = (field: string, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    handleChange(field as keyof CreateYearlyMetricsData, numValue);
    if (errors.landCover) {
      setErrors((prev) => ({ ...prev, landCover: '' }));
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Yearly Metrics' : 'Add Yearly Metrics'}
      description={
        isEditing
          ? 'Update the land cover metrics for this site and year.'
          : 'Enter land cover metrics for a site in a specific year.'
      }
      size="xl"
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? 'Save Changes' : 'Add Metrics'}
          loading={loading}
        />
      }
    >
      <div className="space-y-6">
        {/* Site Selection */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Site & Year</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Organization */}
            <FormField label="Organization" htmlFor="metrics-org">
              <select
                id="metrics-org"
                value={selectedOrgId || ''}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value ? Number(e.target.value) : undefined);
                  setSelectedRegionId(undefined);
                  setSelectedCategoryId(undefined);
                  handleChange('siteId', 0);
                }}
                className={selectClassName}
                disabled={loading || isEditing}
              >
                <option value="">Select...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Region */}
            <FormField label="Region" htmlFor="metrics-region">
              <select
                id="metrics-region"
                value={selectedRegionId || ''}
                onChange={(e) => {
                  setSelectedRegionId(e.target.value ? Number(e.target.value) : undefined);
                  setSelectedCategoryId(undefined);
                  handleChange('siteId', 0);
                }}
                className={selectClassName}
                disabled={loading || isEditing || !selectedOrgId}
              >
                <option value="">Select...</option>
                {filteredRegions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Category */}
            <FormField label="Category" htmlFor="metrics-category">
              <select
                id="metrics-category"
                value={selectedCategoryId || ''}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value ? Number(e.target.value) : undefined);
                  handleChange('siteId', 0);
                }}
                className={selectClassName}
                disabled={loading || isEditing || !selectedRegionId}
              >
                <option value="">Select...</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Site */}
            <FormField label="Site" htmlFor="metrics-site" required error={errors.siteId}>
              <select
                id="metrics-site"
                value={formData.siteId || ''}
                onChange={(e) => handleChange('siteId', Number(e.target.value))}
                className={selectClassName}
                disabled={loading || isEditing || !selectedCategoryId}
              >
                <option value="">Select...</option>
                {filteredSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Year */}
            <FormField label="Year" htmlFor="metrics-year" required error={errors.year}>
              <select
                id="metrics-year"
                value={formData.year || ''}
                onChange={(e) => handleChange('year', Number(e.target.value))}
                className={selectClassName}
                disabled={loading || isEditing}
              >
                <option value="">Select...</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {isEditing && (
            <p className="text-xs text-gray-500">
              Site and year cannot be changed after creation
            </p>
          )}
        </div>

        {/* Land Cover Percentages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Land Cover Percentages</h3>
            <div className={`text-sm font-medium ${isValidTotal ? 'text-green-600' : 'text-amber-600'}`}>
              Total: {totalPercentage.toFixed(2)}%
              {!isValidTotal && totalPercentage > 0 && (
                <span className="ml-1 text-xs">(should be ~100%)</span>
              )}
            </div>
          </div>

          {errors.landCover && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium">{errors.landCover}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {LAND_COVER_FIELDS.map((field) => (
              <FormField
                key={field.key}
                label={
                  <span className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: field.color }}
                    />
                    {field.label}
                  </span>
                }
                htmlFor={`metrics-${field.key}`}
              >
                <input
                  id={`metrics-${field.key}`}
                  type="number"
                  value={formData[field.key as keyof CreateYearlyMetricsData] ?? ''}
                  onChange={(e) => handleLandCoverChange(field.key, e.target.value)}
                  className={inputClassName}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max="100"
                  disabled={loading}
                />
              </FormField>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Enter percentages for each land cover type. Values should sum to approximately 100%.
          </p>
        </div>

        {/* Visual Progress Bar */}
        {totalPercentage > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700">Distribution Preview</h4>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
              {LAND_COVER_FIELDS.map((field) => {
                const value = formData[field.key as keyof CreateYearlyMetricsData];
                if (typeof value !== 'number' || value <= 0) return null;
                const widthPercent = (value / Math.max(totalPercentage, 100)) * 100;
                return (
                  <div
                    key={field.key}
                    className="h-full transition-all duration-300"
                    style={{
                      backgroundColor: field.color,
                      width: `${widthPercent}%`,
                    }}
                    title={`${field.label}: ${value.toFixed(2)}%`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </FormModal>
  );
}
