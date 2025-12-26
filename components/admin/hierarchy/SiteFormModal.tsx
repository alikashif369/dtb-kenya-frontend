"use client";

import { useState, useEffect } from 'react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
  selectClassName,
} from '@/components/admin/shared/FormModal';
import {
  Site,
  Category,
  Region,
  Organization,
  CreateSiteData,
  SiteType,
  createSite,
  updateSite,
  generateSlug,
  SITE_TYPES,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface SiteFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSite: Site | null;
  categories: Category[];
  regions: Region[];
  organizations: Organization[];
  defaultCategoryId?: number;
}

export default function SiteFormModal({
  open,
  onClose,
  onSuccess,
  editingSite,
  categories,
  regions,
  organizations,
  defaultCategoryId,
}: SiteFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!editingSite;

  // Form state
  const [formData, setFormData] = useState<CreateSiteData>({
    name: '',
    slug: '',
    categoryId: defaultCategoryId || 0,
    siteType: 'PLANTATION',
    district: '',
    city: '',
    area: undefined,
    coordinates: undefined,
    infrastructure: '',
  });
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(undefined);
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Coordinate inputs
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [zoom, setZoom] = useState<string>('15');

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

  // Initialize form data when editing
  useEffect(() => {
    if (editingSite) {
      setFormData({
        name: editingSite.name,
        slug: editingSite.slug,
        categoryId: editingSite.categoryId,
        siteType: editingSite.siteType,
        district: editingSite.district || '',
        city: editingSite.city || '',
        area: editingSite.area,
        coordinates: editingSite.coordinates,
        infrastructure: editingSite.infrastructure || '',
      });

      // Set coordinates
      if (editingSite.coordinates) {
        setLat(editingSite.coordinates.lat?.toString() || '');
        setLng(editingSite.coordinates.lng?.toString() || '');
        setZoom(editingSite.coordinates.zoom?.toString() || '15');
      }

      // Find the hierarchy for the editing site
      const category = categories.find((c) => c.id === editingSite.categoryId);
      const region = regions.find((r) => r.id === category?.regionId);
      setSelectedRegionId(region?.id);
      setSelectedOrgId(region?.organizationId);
      setAutoSlug(false);
    } else {
      // Find default category's hierarchy
      const defaultCategory = categories.find((c) => c.id === defaultCategoryId);
      const defaultRegion = regions.find((r) => r.id === defaultCategory?.regionId);
      setSelectedRegionId(defaultRegion?.id);
      setSelectedOrgId(defaultRegion?.organizationId || organizations[0]?.id);

      setFormData({
        name: '',
        slug: '',
        categoryId: defaultCategoryId || 0,
        siteType: 'PLANTATION',
        district: '',
        city: '',
        area: undefined,
        coordinates: undefined,
        infrastructure: '',
      });
      setLat('');
      setLng('');
      setZoom('15');
      setAutoSlug(true);
    }
    setErrors({});
  }, [editingSite, open, defaultCategoryId, categories, regions, organizations]);

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && formData.name) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.name),
      }));
    }
  }, [formData.name, autoSlug]);

  // Update coordinates when inputs change
  useEffect(() => {
    if (lat && lng) {
      setFormData((prev) => ({
        ...prev,
        coordinates: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          zoom: parseInt(zoom) || 15,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        coordinates: undefined,
      }));
    }
  }, [lat, lng, zoom]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.siteType) {
      newErrors.siteType = 'Site type is required';
    }

    // Validate coordinates if partially filled
    if ((lat && !lng) || (!lat && lng)) {
      newErrors.coordinates = 'Both latitude and longitude are required';
    }
    if (lat && (parseFloat(lat) < -90 || parseFloat(lat) > 90)) {
      newErrors.coordinates = 'Latitude must be between -90 and 90';
    }
    if (lng && (parseFloat(lng) < -180 || parseFloat(lng) > 180)) {
      newErrors.coordinates = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Clean up undefined values
      const submitData: CreateSiteData = {
        ...formData,
        area: formData.area || undefined,
        coordinates: formData.coordinates || undefined,
        district: formData.district || undefined,
        city: formData.city || undefined,
        infrastructure: formData.infrastructure || undefined,
      };

      if (isEditing) {
        await updateSite(editingSite.id, submitData);
        showToast('Site updated successfully', 'success');
      } else {
        await createSite(submitData);
        showToast('Site created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save site', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = (field: keyof CreateSiteData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Site' : 'Create Site'}
      description={
        isEditing
          ? 'Update the site details below.'
          : 'Enter the details for the new site.'
      }
      size="xl"
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? 'Save Changes' : 'Create Site'}
          loading={loading}
        />
      }
    >
      <div className="space-y-6">
        {/* Hierarchy Selection */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Location in Hierarchy</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Organization */}
            <FormField label="Organization" htmlFor="site-org">
              <select
                id="site-org"
                value={selectedOrgId || ''}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value ? Number(e.target.value) : undefined);
                  setSelectedRegionId(undefined);
                  handleChange('categoryId', 0);
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
            <FormField label="Region" htmlFor="site-region">
              <select
                id="site-region"
                value={selectedRegionId || ''}
                onChange={(e) => {
                  setSelectedRegionId(e.target.value ? Number(e.target.value) : undefined);
                  handleChange('categoryId', 0);
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
            <FormField label="Category" htmlFor="site-category" required error={errors.categoryId}>
              <select
                id="site-category"
                value={formData.categoryId || ''}
                onChange={(e) => handleChange('categoryId', Number(e.target.value))}
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
          </div>

          {isEditing && (
            <p className="text-xs text-gray-500">
              Category cannot be changed after creation
            </p>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <FormField label="Site Name" htmlFor="site-name" required error={errors.name}>
            <input
              id="site-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={inputClassName}
              placeholder="e.g., Momi Plantation Site"
              disabled={loading}
            />
          </FormField>

          {/* Slug */}
          <FormField
            label="URL Slug"
            htmlFor="site-slug"
            required
            error={errors.slug}
            hint={autoSlug ? 'Auto-generated' : 'Custom'}
          >
            <div className="flex gap-2">
              <input
                id="site-slug"
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  handleChange('slug', e.target.value.toLowerCase());
                }}
                className={inputClassName}
                placeholder="e.g., momi-plantation"
                disabled={loading}
              />
              {!autoSlug && (
                <button
                  type="button"
                  onClick={() => {
                    setAutoSlug(true);
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateSlug(prev.name),
                    }));
                  }}
                  className="px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition whitespace-nowrap"
                >
                  Auto
                </button>
              )}
            </div>
          </FormField>
        </div>

        {/* Site Type */}
        <FormField label="Site Type" htmlFor="site-type" required error={errors.siteType}>
          <select
            id="site-type"
            value={formData.siteType}
            onChange={(e) => handleChange('siteType', e.target.value as SiteType)}
            className={selectClassName}
            disabled={loading}
          >
            {SITE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="District" htmlFor="site-district">
            <input
              id="site-district"
              type="text"
              value={formData.district || ''}
              onChange={(e) => handleChange('district', e.target.value)}
              className={inputClassName}
              placeholder="e.g., Gilgit"
              disabled={loading}
            />
          </FormField>

          <FormField label="City" htmlFor="site-city">
            <input
              id="site-city"
              type="text"
              value={formData.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
              className={inputClassName}
              placeholder="e.g., Gilgit City"
              disabled={loading}
            />
          </FormField>

          <FormField label="Area (hectares)" htmlFor="site-area">
            <input
              id="site-area"
              type="number"
              value={formData.area || ''}
              onChange={(e) => handleChange('area', e.target.value ? parseFloat(e.target.value) : undefined)}
              className={inputClassName}
              placeholder="e.g., 25.5"
              step="0.01"
              min="0"
              disabled={loading}
            />
          </FormField>
        </div>

        {/* Coordinates */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Coordinates (Optional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Latitude" htmlFor="site-lat" error={errors.coordinates}>
              <input
                id="site-lat"
                type="number"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className={inputClassName}
                placeholder="e.g., 35.8979"
                step="0.0001"
                min="-90"
                max="90"
                disabled={loading}
              />
            </FormField>

            <FormField label="Longitude" htmlFor="site-lng">
              <input
                id="site-lng"
                type="number"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className={inputClassName}
                placeholder="e.g., 74.3587"
                step="0.0001"
                min="-180"
                max="180"
                disabled={loading}
              />
            </FormField>

            <FormField label="Default Zoom" htmlFor="site-zoom">
              <input
                id="site-zoom"
                type="number"
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                className={inputClassName}
                placeholder="15"
                min="1"
                max="22"
                disabled={loading}
              />
            </FormField>
          </div>
        </div>

        {/* Infrastructure */}
        <FormField label="Infrastructure" htmlFor="site-infrastructure" hint="Describe any infrastructure at the site">
          <input
            id="site-infrastructure"
            type="text"
            value={formData.infrastructure || ''}
            onChange={(e) => handleChange('infrastructure', e.target.value)}
            className={inputClassName}
            placeholder="e.g., Solar Lift Irrigation, Nursery"
            disabled={loading}
          />
        </FormField>
      </div>
    </FormModal>
  );
}
