"use client";

import { useState, useEffect } from 'react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
  selectClassName,
} from '@/components/admin/shared/FormModal';
import {
  Region,
  Organization,
  CreateRegionData,
  createRegion,
  updateRegion,
  generateSlug,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface RegionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingRegion: Region | null;
  organizations: Organization[];
  defaultOrganizationId?: number;
}

export default function RegionFormModal({
  open,
  onClose,
  onSuccess,
  editingRegion,
  organizations,
  defaultOrganizationId,
}: RegionFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!editingRegion;

  // Form state
  const [formData, setFormData] = useState<CreateRegionData>({
    name: '',
    slug: '',
    organizationId: defaultOrganizationId || 0,
  });
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingRegion) {
      setFormData({
        name: editingRegion.name,
        slug: editingRegion.slug,
        organizationId: editingRegion.organizationId,
      });
      setAutoSlug(false);
    } else {
      setFormData({
        name: '',
        slug: '',
        organizationId: defaultOrganizationId || organizations[0]?.id || 0,
      });
      setAutoSlug(true);
    }
    setErrors({});
  }, [editingRegion, open, defaultOrganizationId, organizations]);

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

    if (!formData.organizationId) {
      newErrors.organizationId = 'Organization is required';
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
        await updateRegion(editingRegion.id, formData);
        showToast('Region updated successfully', 'success');
      } else {
        await createRegion(formData);
        showToast('Region created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save region', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = (field: keyof CreateRegionData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Region' : 'Create Region'}
      description={
        isEditing
          ? 'Update the region details below.'
          : 'Enter the details for the new region.'
      }
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? 'Save Changes' : 'Create Region'}
          loading={loading}
        />
      }
    >
      <div className="space-y-4">
        {/* Organization */}
        <FormField
          label="Organization"
          htmlFor="region-org"
          required
          error={errors.organizationId}
        >
          <select
            id="region-org"
            value={formData.organizationId || ''}
            onChange={(e) => handleChange('organizationId', Number(e.target.value))}
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
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">
              Organization cannot be changed after creation
            </p>
          )}
        </FormField>

        {/* Name */}
        <FormField
          label="Region Name"
          htmlFor="region-name"
          required
          error={errors.name}
        >
          <input
            id="region-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={inputClassName}
            placeholder="e.g., Gilgit-Baltistan"
            disabled={loading}
          />
        </FormField>

        {/* Slug */}
        <FormField
          label="URL Slug"
          htmlFor="region-slug"
          required
          error={errors.slug}
          hint={autoSlug ? 'Auto-generated from name' : 'Custom slug'}
        >
          <div className="flex gap-2">
            <input
              id="region-slug"
              type="text"
              value={formData.slug}
              onChange={(e) => {
                setAutoSlug(false);
                handleChange('slug', e.target.value.toLowerCase());
              }}
              className={inputClassName}
              placeholder="e.g., gilgit-baltistan"
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
