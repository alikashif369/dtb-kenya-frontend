"use client";

import { useState, useEffect } from 'react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
  selectClassName,
} from '@/components/admin/shared/FormModal';
import {
  SubCategory,
  Category,
  Region,
  Organization,
  CreateSubCategoryData,
  createSubCategory,
  updateSubCategory,
  generateSlug,
  getCategoryTypeLabel,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface SubCategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSubCategory: SubCategory | null;
  categories: Category[];
  regions: Region[];
  organizations: Organization[];
  defaultCategoryId?: number;
}

export default function SubCategoryFormModal({
  open,
  onClose,
  onSuccess,
  editingSubCategory,
  categories,
  regions,
  organizations,
  defaultCategoryId,
}: SubCategoryFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!editingSubCategory;

  // Form state
  const [formData, setFormData] = useState<CreateSubCategoryData>({
    name: '',
    slug: '',
    categoryId: defaultCategoryId || 0,
  });
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(undefined);
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (editingSubCategory) {
      setFormData({
        name: editingSubCategory.name,
        slug: editingSubCategory.slug,
        categoryId: editingSubCategory.categoryId,
      });

      // Find the hierarchy for the editing subcategory
      const category = categories.find((c) => c.id === editingSubCategory.categoryId);
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
      });
      setAutoSlug(true);
    }
    setErrors({});
  }, [editingSubCategory, open, defaultCategoryId, categories, regions, organizations]);

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && formData.name) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.name),
      }));
    }
  }, [formData.name, autoSlug]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await updateSubCategory(editingSubCategory.id, formData);
        showToast('SubCategory updated successfully', 'success');
      } else {
        await createSubCategory(formData);
        showToast('SubCategory created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save subcategory', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = (field: keyof CreateSubCategoryData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit SubCategory' : 'Create SubCategory'}
      description={
        isEditing
          ? 'Update the subcategory details below.'
          : 'Enter the details for the new subcategory.'
      }
      size="lg"
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? 'Save Changes' : 'Create SubCategory'}
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
            <FormField label="Organization" htmlFor="subcat-org">
              <select
                id="subcat-org"
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
            <FormField label="Region" htmlFor="subcat-region">
              <select
                id="subcat-region"
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
            <FormField label="Category" htmlFor="subcat-category" required error={errors.categoryId}>
              <select
                id="subcat-category"
                value={formData.categoryId || ''}
                onChange={(e) => handleChange('categoryId', Number(e.target.value))}
                className={selectClassName}
                disabled={loading || isEditing || !selectedRegionId}
              >
                <option value="">Select...</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({getCategoryTypeLabel(category.type)})
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
          <FormField label="SubCategory Name" htmlFor="subcat-name" required error={errors.name}>
            <input
              id="subcat-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={inputClassName}
              placeholder="e.g., Community Engagement"
              disabled={loading}
            />
          </FormField>

          {/* Slug */}
          <FormField
            label="URL Slug"
            htmlFor="subcat-slug"
            required
            error={errors.slug}
            hint={autoSlug ? 'Auto-generated' : 'Custom'}
          >
            <div className="flex gap-2">
              <input
                id="subcat-slug"
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setAutoSlug(false);
                  handleChange('slug', e.target.value.toLowerCase());
                }}
                className={inputClassName}
                placeholder="e.g., community-engagement"
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
      </div>
    </FormModal>
  );
}
