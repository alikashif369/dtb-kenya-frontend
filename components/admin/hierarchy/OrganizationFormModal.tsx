"use client";

import { useState, useEffect } from 'react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
  textareaClassName,
} from '@/components/admin/shared/FormModal';
import {
  Organization,
  CreateOrganizationData,
  createOrganization,
  updateOrganization,
  generateSlug,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface OrganizationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingOrg: Organization | null;
}

export default function OrganizationFormModal({
  open,
  onClose,
  onSuccess,
  editingOrg,
}: OrganizationFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!editingOrg;

  // Form state
  const [formData, setFormData] = useState<CreateOrganizationData>({
    name: '',
    slug: '',
    description: '',
  });
  const [autoSlug, setAutoSlug] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (editingOrg) {
      setFormData({
        name: editingOrg.name,
        slug: editingOrg.slug,
        description: editingOrg.description || '',
      });
      setAutoSlug(false);
    } else {
      setFormData({ name: '', slug: '', description: '' });
      setAutoSlug(true);
    }
    setErrors({});
  }, [editingOrg, open]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await updateOrganization(editingOrg.id, formData);
        showToast('Organization updated successfully', 'success');
      } else {
        await createOrganization(formData);
        showToast('Organization created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save organization', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = (field: keyof CreateOrganizationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Organization' : 'Create Organization'}
      description={
        isEditing
          ? 'Update the organization details below.'
          : 'Enter the details for the new organization.'
      }
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? 'Save Changes' : 'Create Organization'}
          loading={loading}
        />
      }
    >
      <div className="space-y-4">
        {/* Name */}
        <FormField
          label="Organization Name"
          htmlFor="org-name"
          required
          error={errors.name}
        >
          <input
            id="org-name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={inputClassName}
            placeholder="e.g., Serena Hotels"
            disabled={loading}
          />
        </FormField>

        {/* Slug */}
        <FormField
          label="URL Slug"
          htmlFor="org-slug"
          required
          error={errors.slug}
          hint={autoSlug ? 'Auto-generated from name' : 'Custom slug'}
        >
          <div className="flex gap-2">
            <input
              id="org-slug"
              type="text"
              value={formData.slug}
              onChange={(e) => {
                setAutoSlug(false);
                handleChange('slug', e.target.value.toLowerCase());
              }}
              className={inputClassName}
              placeholder="e.g., serena-hotels"
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

        {/* Description */}
        <FormField
          label="Description"
          htmlFor="org-description"
          hint="Optional description for this organization"
        >
          <textarea
            id="org-description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className={textareaClassName}
            placeholder="Enter a description..."
            rows={3}
            disabled={loading}
          />
        </FormField>
      </div>
    </FormModal>
  );
}
