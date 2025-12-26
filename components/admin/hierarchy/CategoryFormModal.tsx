"use client";

import { useState, useEffect } from 'react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
  selectClassName,
} from '@/components/admin/shared/FormModal';
import {
  Category,
  Region,
  Organization,
  CreateCategoryData,
  CategoryType,
  createCategory,
  updateCategory,
  generateSlug,
  CATEGORY_TYPES,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCategory: Category | null;
  regions: Region[];
  organizations: Organization[];
  defaultRegionId?: number;
}

export default function CategoryFormModal({
  open,
  onClose,
  onSuccess,
  editingCategory,
  regions,
  organizations,
  defaultRegionId,
}: CategoryFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!editingCategory;

  // Form state
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    slug: '',
    type: 'PLANTATION',
    regionId: defaultRegionId || 0,
  });
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtered regions based on org selection
  const filteredRegions = selectedOrgId
    ? regions.filter((r) => r.organizationId === selectedOrgId)
    : regions;

  // Initialize form data when editing
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        slug: editingCategory.slug,
        type: editingCategory.type,
        regionId: editingCategory.regionId,
      });
      // Find the organization for the editing category's region
      const region = regions.find((r) => r.id === editingCategory.regionId);
      setSelectedOrgId(region?.organizationId);
      setAutoSlug(false);
    } else {
      // Find default region's org
      const defaultRegion = regions.find((r) => r.id === defaultRegionId);
      setSelectedOrgId(defaultRegion?.organizationId || organizations[0]?.id);

      setFormData({
        name: '',
        slug: '',
        type: 'PLANTATION',
        regionId: defaultRegionId || 0,
      });
      setAutoSlug(true);
    }
    setErrors({});
  }, [editingCategory, open, defaultRegionId, regions, organizations]);

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && formData.name) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.name),
      }));
    }
  }, [formData.name, autoSlug]);

  // Reset region when org changes
  useEffect(() => {
    if (!isEditing && selectedOrgId) {
      const firstRegion = filteredRegions[0];
      if (firstRegion && formData.regionId) {
        const currentRegion = regions.find((r) => r.id === formData.regionId);
        if (currentRegion && currentRegion.organizationId !== selectedOrgId) {
          setFormData((prev) => ({
            ...prev,
            regionId: firstRegion.id,
          }));
        }
      }
    }
  }, [selectedOrgId, isEditing, filteredRegions, regions, formData.regionId]);

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

    if (!formData.regionId) {
      newErrors.regionId = 'Region is required';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await updateCategory(editingCategory.id, formData);
        showToast('Category updated successfully', 'success');
      } else {
        await createCategory(formData);
        showToast('Category created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save category', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = (field: keyof CreateCategoryData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Category' : 'Create Category'}
      description={
        isEditing
          ? 'Update the category details below.'
          : 'Enter the details for the new category.'
      }
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? 'Save Changes' : 'Create Category'}
          loading={loading}
        />
      }
    >
      <div className="space-y-4">
        {/* Organization (for filtering regions) */}
        <FormField label="Organization" htmlFor="cat-org">
          <select
            id="cat-org"
            value={selectedOrgId || ''}
            onChange={(e) => setSelectedOrgId(e.target.value ? Number(e.target.value) : undefined)}
            className={selectClassName}
            disabled={loading || isEditing}
          >
            <option value="">Select Organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </FormField>

        {/* Region */}
        <FormField
          label="Region"
          htmlFor="cat-region"
          required
          error={errors.regionId}
        >
          <select
            id="cat-region"
            value={formData.regionId || ''}
            onChange={(e) => handleChange('regionId', Number(e.target.value))}
            className={selectClassName}
            disabled={loading || isEditing || !selectedOrgId}
          >
            <option value="">Select Region</option>
            {filteredRegions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">
              Region cannot be changed after creation
            </p>
          )}
        </FormField>

        {/* Type */}
        <FormField
          label="Category Type"
          htmlFor="cat-type"
          required
          error={errors.type}
        >
          <select
            id="cat-type"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value as CategoryType)}
            className={selectClassName}
            disabled={loading}
          >
            {CATEGORY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Name */}
        <FormField
          label="Category Name"
          htmlFor="cat-name"
          required
          error={errors.name}
        >
          <input
            id="cat-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={inputClassName}
            placeholder="e.g., AKRSP Plantation Sites"
            disabled={loading}
          />
        </FormField>

        {/* Slug */}
        <FormField
          label="URL Slug"
          htmlFor="cat-slug"
          required
          error={errors.slug}
          hint={autoSlug ? 'Auto-generated from name' : 'Custom slug'}
        >
          <div className="flex gap-2">
            <input
              id="cat-slug"
              type="text"
              value={formData.slug}
              onChange={(e) => {
                setAutoSlug(false);
                handleChange('slug', e.target.value.toLowerCase());
              }}
              className={inputClassName}
              placeholder="e.g., akrsp-plantation"
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
    </FormModal>
  );
}
