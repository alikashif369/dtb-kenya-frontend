"use client";

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
  selectClassName,
} from '@/components/admin/shared/FormModal';
import {
  CommunityData,
  CreateCommunityData,
  createCommunityData,
  updateCommunityData,
  upsertCommunityData,
} from '@/lib/admin/siteDataApi';
import {
  Site,
  Category,
  Region,
  Organization,
} from '@/lib/admin/hierarchyApi';
import { getAvailableYears } from '@/lib/admin/siteDataApi';
import { useToast } from '@/components/ToastContext';

interface CommunityDataFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingData: CommunityData | null;
  sites: Site[];
  categories: Category[];
  regions: Region[];
  organizations: Organization[];
}

interface DynamicField {
  label: string;
  value: string | number;
}

export default function CommunityDataFormModal({
  open,
  onClose,
  onSuccess,
  editingData,
  sites,
  categories,
  regions,
  organizations,
}: CommunityDataFormModalProps) {
  const { showToast } = useToast();
  const isEditing = !!editingData;
  const years = getAvailableYears();

  // Form state
  const [siteId, setSiteId] = useState<number>(0);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([]);
  
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>(undefined);
  const [selectedRegionId, setSelectedRegionId] = useState<number | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  
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
      setSiteId(editingData.siteId);
      setYear(editingData.year);
      
      const fields = Object.entries(editingData.data).map(([label, value]) => ({
        label,
        value: value as string | number
      }));
      setDynamicFields(fields);

      const site = sites.find((s) => s.id === editingData.siteId);
      const category = categories.find((c) => c.id === site?.categoryId);
      const region = regions.find((r) => r.id === category?.regionId);
      setSelectedCategoryId(category?.id);
      setSelectedRegionId(region?.id);
      setSelectedOrgId(region?.organizationId);
    } else {
      setSiteId(0);
      setYear(new Date().getFullYear());
      setDynamicFields([
        { label: 'Clean Stoves', value: 0 },
        { label: 'Seeds Distributed', value: 0 },
        { label: 'School Kits', value: 0 }
      ]);
      setSelectedOrgId(organizations[0]?.id);
      setSelectedRegionId(undefined);
      setSelectedCategoryId(undefined);
    }
    setErrors({});
  }, [editingData, open, sites, categories, regions, organizations]);

  const addField = () => {
    setDynamicFields([...dynamicFields, { label: '', value: 0 }]);
  };

  const removeField = (index: number) => {
    setDynamicFields(dynamicFields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<DynamicField>) => {
    const newFields = [...dynamicFields];
    newFields[index] = { ...newFields[index], ...updates };
    setDynamicFields(newFields);
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!siteId) {
      newErrors.siteId = 'Site is required';
    }

    dynamicFields.forEach((field, index) => {
      if (!field.label.trim()) {
        newErrors[`field_${index}_label`] = 'Label is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setLoading(true);
    try {
      // Convert dynamic fields back to JSON object
      const dataJson: Record<string, any> = {};
      dynamicFields.forEach(field => {
        dataJson[field.label.trim()] = field.value;
      });

      const payload: CreateCommunityData = {
        siteId,
        year,
        data: dataJson
      };

      if (isEditing) {
        await updateCommunityData(editingData.id, payload);
        showToast('Community data updated successfully', 'success');
      } else {
        await upsertCommunityData(payload);
        showToast('Community data saved successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Community Data' : 'Add Community Data'}
      description="Record impact from various community initiatives."
      size="lg"
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel={isEditing ? 'Save Changes' : 'Save Data'}
          loading={loading}
        />
      }
    >
      <div className="space-y-6">
        {/* Site Selection */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Select Site & Year</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormField label="Organization" htmlFor="comm-org">
              <select
                id="comm-org"
                value={selectedOrgId || ''}
                onChange={(e) => {
                  setSelectedOrgId(e.target.value ? Number(e.target.value) : undefined);
                  setSelectedRegionId(undefined);
                  setSelectedCategoryId(undefined);
                  setSiteId(0);
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

            <FormField label="Region" htmlFor="comm-region">
              <select
                id="comm-region"
                value={selectedRegionId || ''}
                onChange={(e) => {
                  setSelectedRegionId(e.target.value ? Number(e.target.value) : undefined);
                  setSelectedCategoryId(undefined);
                  setSiteId(0);
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

            <FormField label="Category" htmlFor="comm-category">
              <select
                id="comm-category"
                value={selectedCategoryId || ''}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value ? Number(e.target.value) : undefined);
                  setSiteId(0);
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

            <FormField label="Site" htmlFor="comm-site" required error={errors.siteId}>
              <select
                id="comm-site"
                value={siteId || ''}
                onChange={(e) => setSiteId(Number(e.target.value))}
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

          <div className="w-1/4">
             <FormField label="Year" htmlFor="comm-year" required>
              <select
                id="comm-year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={selectClassName}
                disabled={loading}
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </FormField>
          </div>
        </div>

        {/* Dynamic Initiatives */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Initiative Metrics</h3>
                <button
                    type="button"
                    onClick={addField}
                    className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-800"
                >
                    <Plus className="w-3 h-3" />
                    Add Metric
                </button>
            </div>

            <div className="space-y-3">
                {dynamicFields.map((field, index) => (
                    <div key={index} className="flex gap-4 items-start bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={field.label}
                                onChange={(e) => updateField(index, { label: e.target.value })}
                                placeholder="Metric Label (e.g. Health Kits)"
                                className={inputClassName}
                                disabled={loading}
                            />
                            {errors[`field_${index}_label`] && (
                                <p className="mt-1 text-xs text-red-600">{errors[`field_${index}_label`]}</p>
                            )}
                        </div>
                        <div className="w-32">
                             <input
                                type="number"
                                value={field.value}
                                onChange={(e) => updateField(index, { value: Number(e.target.value) || 0 })}
                                className={inputClassName}
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="p-2 text-gray-400 hover:text-red-500 transition mt-1"
                            disabled={loading || dynamicFields.length <= 1}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <p className="text-xs text-gray-500 italic">
                Tip: You can add any number of custom metrics for the selected community site.
            </p>
        </div>
      </div>
    </FormModal>
  );
}
