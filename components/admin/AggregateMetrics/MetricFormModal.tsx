"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import EntityHierarchySelector from './EntityHierarchySelector';
import { useHierarchy } from '@/components/vector-draw/useHierarchy';
import { createMetric, updateMetric } from '@/lib/admin/metricsApi';
import { MetricFormData, AggregateMetric } from '@/lib/admin/types';
import { ENTITY_TYPES, METRIC_TYPES, TIME_PERIOD_TYPES, YEARS } from '@/lib/admin/constants';
import { useToast } from '@/components/ToastContext';

interface MetricFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingMetric?: AggregateMetric | null;
}

export default function MetricFormModal({ open, onClose, onSuccess, editingMetric }: MetricFormModalProps) {
  const { orgs, regionsByOrg, categoriesByRegion, loading: hierarchyLoading } = useHierarchy();
  const { showToast } = useToast();

  // Form state
  const [form, setForm] = useState<MetricFormData>({
    entityType: 'ORGANIZATION',
    organizationId: undefined,
    regionId: undefined,
    categoryId: undefined,
    metricType: '',
    timePeriodType: 'single',
    year: new Date().getFullYear(),
    startYear: undefined,
    endYear: undefined,
    targetValue: undefined,
    achievedValue: undefined,
    unit: '',
    label: '',
    description: '',
    displayOrder: 0,
    details: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingMetric) {
      setForm({
        entityType: editingMetric.entityType,
        organizationId: editingMetric.organizationId,
        regionId: editingMetric.regionId,
        categoryId: editingMetric.categoryId,
        metricType: editingMetric.metricType,
        timePeriodType: editingMetric.year ? 'single' : 'multi',
        year: editingMetric.year,
        startYear: editingMetric.startYear,
        endYear: editingMetric.endYear,
        targetValue: editingMetric.targetValue,
        achievedValue: editingMetric.achievedValue,
        unit: editingMetric.unit || '',
        label: editingMetric.label,
        description: editingMetric.description || '',
        displayOrder: editingMetric.displayOrder,
        details: editingMetric.details ? JSON.stringify(editingMetric.details, null, 2) : '',
      });
    }
  }, [editingMetric]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.metricType) {
      setError('Please select a metric type');
      return;
    }

    if (!form.label || form.label.length < 3) {
      setError('Label must be at least 3 characters');
      return;
    }

    // Entity validation
    if (form.entityType === 'ORGANIZATION' && !form.organizationId) {
      setError('Please select an organization');
      return;
    }
    if (form.entityType === 'REGION' && !form.regionId) {
      setError('Please select a region');
      return;
    }
    if (form.entityType === 'CATEGORY' && !form.categoryId) {
      setError('Please select a category');
      return;
    }

    // Time period validation
    if (form.timePeriodType === 'single' && !form.year) {
      setError('Please select a year');
      return;
    }
    if (form.timePeriodType === 'multi') {
      if (!form.startYear || !form.endYear) {
        setError('Please select start and end years');
        return;
      }
      if (form.endYear < form.startYear) {
        setError('End year must be greater than or equal to start year');
        return;
      }
    }

    setSaving(true);
    try {
      if (editingMetric) {
        await updateMetric(editingMetric.id, form);
        showToast('Metric updated successfully!', 'success');
      } else {
        await createMetric(form);
        showToast('Metric created successfully!', 'success');
      }
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save metric');
      showToast(err.message || 'Failed to save metric', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({
      entityType: 'ORGANIZATION',
      organizationId: undefined,
      regionId: undefined,
      categoryId: undefined,
      metricType: '',
      timePeriodType: 'single',
      year: new Date().getFullYear(),
      startYear: undefined,
      endYear: undefined,
      targetValue: undefined,
      achievedValue: undefined,
      unit: '',
      label: '',
      description: '',
      displayOrder: 0,
      details: '',
    });
    setError(null);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto py-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {editingMetric ? 'Edit Metric' : 'Create New Metric'}
          </h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Entity Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Entity Type <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4">
              {ENTITY_TYPES.map((type) => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="entityType"
                    value={type.value}
                    checked={form.entityType === type.value}
                    onChange={(e) => setForm({ ...form, entityType: e.target.value as any })}
                    disabled={saving}
                    className="w-4 h-4 text-green-900 focus:ring-green-900"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Entity Hierarchy Selector */}
          <EntityHierarchySelector
            entityType={form.entityType}
            organizationId={form.organizationId}
            regionId={form.regionId}
            categoryId={form.categoryId}
            onOrganizationChange={(id) => setForm({ ...form, organizationId: id })}
            onRegionChange={(id) => setForm({ ...form, regionId: id })}
            onCategoryChange={(id) => setForm({ ...form, categoryId: id })}
            orgs={orgs}
            regionsByOrg={regionsByOrg}
            categoriesByRegion={categoriesByRegion}
            loading={hierarchyLoading}
          />

          {/* Metric Type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Metric Type <span className="text-red-600">*</span>
            </label>
            <select
              value={form.metricType}
              onChange={(e) => setForm({ ...form, metricType: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={saving}
              required
            >
              <option value="">Choose metric type</option>
              {Object.entries(
                METRIC_TYPES.reduce((acc, metric) => {
                  if (!acc[metric.category]) acc[metric.category] = [];
                  acc[metric.category].push(metric);
                  return acc;
                }, {} as Record<string, Array<typeof METRIC_TYPES[number]>>)
              ).map(([category, metrics]) => (
                <optgroup key={category} label={category}>
                  {metrics.map((metric) => (
                    <option key={metric.value} value={metric.value}>
                      {metric.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Time Period */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Time Period <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4 mb-3">
              {TIME_PERIOD_TYPES.map((type) => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timePeriodType"
                    value={type.value}
                    checked={form.timePeriodType === type.value}
                    onChange={(e) => setForm({ ...form, timePeriodType: e.target.value as 'single' | 'multi' })}
                    disabled={saving}
                    className="w-4 h-4 text-green-900 focus:ring-green-900"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>

            {form.timePeriodType === 'single' ? (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Year</label>
                <select
                  value={form.year || ''}
                  onChange={(e) => setForm({ ...form, year: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                  disabled={saving}
                  required
                >
                  <option value="">Choose year</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Start Year</label>
                  <select
                    value={form.startYear || ''}
                    onChange={(e) => setForm({ ...form, startYear: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                    disabled={saving}
                    required
                  >
                    <option value="">Choose start year</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">End Year</label>
                  <select
                    value={form.endYear || ''}
                    onChange={(e) => setForm({ ...form, endYear: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                    disabled={saving}
                    required
                  >
                    <option value="">Choose end year</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Values */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Target Value</label>
              <input
                type="number"
                step="any"
                value={form.targetValue || ''}
                onChange={(e) => setForm({ ...form, targetValue: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                disabled={saving}
                placeholder="e.g., 600000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Achieved Value</label>
              <input
                type="number"
                step="any"
                value={form.achievedValue || ''}
                onChange={(e) => setForm({ ...form, achievedValue: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                disabled={saving}
                placeholder="e.g., 623195"
              />
            </div>
          </div>

          {/* Unit */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Unit</label>
            <input
              type="text"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={saving}
              placeholder="e.g., trees, kWh, units"
            />
          </div>

          {/* Label */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Label <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={saving}
              required
              minLength={3}
              placeholder="e.g., Serena Total Target (2021-2023)"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent resize-none"
              disabled={saving}
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          {/* Display Order */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Display Order</label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={saving}
              min={0}
            />
            <p className="text-xs text-gray-500">Lower numbers appear first</p>
          </div>

          {/* Details JSON (Advanced) */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-2 cursor-pointer text-xs font-medium text-gray-700 hover:bg-gray-50">
              Advanced: JSON Details (Optional)
            </summary>
            <div className="p-4 border-t border-gray-200 space-y-1">
              <label className="text-xs font-medium text-gray-700">Details (JSON)</label>
              <textarea
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-green-900 focus:border-transparent resize-none"
                disabled={saving}
                rows={4}
                placeholder='{"key": "value"}'
              />
              <p className="text-xs text-gray-500">Enter valid JSON for additional metadata</p>
            </div>
          </details>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : editingMetric ? 'Update Metric' : 'Create Metric'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
