"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
  selectClassName,
} from '@/components/admin/shared/FormModal';
import {
  PlantationData,
  CreatePlantationData,
  createPlantationData,
  updatePlantationData,
} from '@/lib/admin/siteDataApi';
import {
  Site,
  Category,
  Region,
  Organization,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface PlantationDataFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingData: PlantationData | null;
  sites: Site[];
  categories: Category[];
  regions: Region[];
  organizations: Organization[];
}

export default function PlantationDataFormModal({
  open,
  onClose,
  onSuccess,
  editingData,
  sites,
  categories,
  regions,
  organizations,
}: PlantationDataFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!editingData;

  // Form state
  const [formData, setFormData] = useState<CreatePlantationData>({
    siteId: 0,
    plants: 0,
    species: [],
  });
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [speciesInput, setSpeciesInput] = useState('');
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

  // Initialize form data
  useEffect(() => {
    if (editingData) {
      setFormData({
        siteId: editingData.siteId,
        plants: editingData.plants,
        species: editingData.species,
      });

      const site = sites.find((s) => s.id === editingData.siteId);
      const category = categories.find((c) => c.id === site?.categoryId);
      const region = regions.find((r) => r.id === category?.regionId);
      setSelectedCategoryId(category?.id);
      setSelectedRegionId(region?.id);
      setSelectedOrgId(region?.organizationId);
    } else {
      setFormData({ siteId: 0, plants: 0, species: [] });
      setSelectedOrgId(organizations[0]?.id);
      setSelectedRegionId(undefined);
      setSelectedCategoryId(undefined);
    }
    setSpeciesInput('');
    setErrors({});
  }, [editingData, open, sites, categories, regions, organizations]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.siteId) {
      newErrors.siteId = 'Site is required';
    }

    if (formData.plants < 0) {
      newErrors.plants = 'Plants must be a positive number';
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
        await updatePlantationData(editingData.id, {
          plants: formData.plants,
          species: formData.species,
        });
        showToast('Plantation data updated successfully', 'success');
      } else {
        await createPlantationData(formData);
        showToast('Plantation data created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addSpecies = () => {
    const trimmed = speciesInput.trim().toUpperCase();
    if (trimmed && !formData.species.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        species: [...prev.species, trimmed],
      }));
    }
    setSpeciesInput('');
  };

  const removeSpecies = (sp: string) => {
    setFormData((prev) => ({
      ...prev,
      species: prev.species.filter((s) => s !== sp),
    }));
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Plantation Data' : 'Add Plantation Data'}
      description={
        isEditing
          ? 'Update the plantation information for this site.'
          : 'Enter plantation information for a site.'
      }
      size="lg"
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? 'Save Changes' : 'Add Data'}
          loading={loading}
        />
      }
    >
      <div className="space-y-6">
        {/* Site Selection */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Select Site</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Organization" htmlFor="plantation-org">
              <select
                id="plantation-org"
                value={selectedOrgId || ''}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value ? Number(e.target.value) : undefined);
                  setSelectedRegionId(undefined);
                  setSelectedCategoryId(undefined);
                  setFormData((prev) => ({ ...prev, siteId: 0 }));
                }}
                className={selectClassName}
                disabled={loading || isEditing}
              >
                <option value="">Select...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Region" htmlFor="plantation-region">
              <select
                id="plantation-region"
                value={selectedRegionId || ''}
                onChange={(e) => {
                  setSelectedRegionId(e.target.value ? Number(e.target.value) : undefined);
                  setSelectedCategoryId(undefined);
                  setFormData((prev) => ({ ...prev, siteId: 0 }));
                }}
                className={selectClassName}
                disabled={loading || isEditing || !selectedOrgId}
              >
                <option value="">Select...</option>
                {filteredRegions.map((region) => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Category" htmlFor="plantation-category">
              <select
                id="plantation-category"
                value={selectedCategoryId || ''}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value ? Number(e.target.value) : undefined);
                  setFormData((prev) => ({ ...prev, siteId: 0 }));
                }}
                className={selectClassName}
                disabled={loading || isEditing || !selectedRegionId}
              >
                <option value="">Select...</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Site" htmlFor="plantation-site" required error={errors.siteId}>
              <select
                id="plantation-site"
                value={formData.siteId || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, siteId: Number(e.target.value) }))}
                className={selectClassName}
                disabled={loading || isEditing || !selectedCategoryId}
              >
                <option value="">Select...</option>
                {filteredSites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Plantation Info */}
        <FormField label="Total Plants" htmlFor="plantation-plants" required error={errors.plants}>
          <input
            id="plantation-plants"
            type="number"
            value={formData.plants}
            onChange={(e) => setFormData((prev) => ({ ...prev, plants: parseInt(e.target.value) || 0 }))}
            className={inputClassName}
            placeholder="e.g., 5000"
            min="0"
            disabled={loading}
          />
        </FormField>

        {/* Species */}
        <div className="space-y-2">
          <FormField label="Species Codes" htmlFor="plantation-species">
            <div className="flex gap-2">
              <input
                id="plantation-species"
                type="text"
                value={speciesInput}
                onChange={(e) => setSpeciesInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSpecies();
                  }
                }}
                className={inputClassName}
                placeholder="e.g., PINWAL"
                disabled={loading}
              />
              <button
                type="button"
                onClick={addSpecies}
                className="px-4 py-2 bg-green-900 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition"
                disabled={loading}
              >
                Add
              </button>
            </div>
          </FormField>

          {formData.species.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.species.map((sp) => (
                <span
                  key={sp}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {sp}
                  <button
                    type="button"
                    onClick={() => removeSpecies(sp)}
                    className="p-0.5 hover:bg-green-200 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500">
            Enter species codes (e.g., PINWAL, CEDDAR). Press Enter or click Add to include.
          </p>
        </div>
      </div>
    </FormModal>
  );
}
