"use client";

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import EntityHierarchySelector from '../AggregateMetrics/EntityHierarchySelector';
import { useHierarchy } from '@/components/vector-draw/useHierarchy';
import { createSummary, updateSummary } from '@/lib/admin/summariesApi';
import { SummaryFormData, CategorySummary } from '@/lib/admin/types';
import { ENTITY_TYPES } from '@/lib/admin/constants';
import { useToast } from '@/components/ToastContext';

interface SummaryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingSummary?: CategorySummary | null;
}

export default function SummaryFormModal({ open, onClose, onSuccess, editingSummary }: SummaryFormModalProps) {
  const { orgs, regionsByOrg, categoriesByRegion, loading: hierarchyLoading } = useHierarchy();
  const { showToast } = useToast();

  // Form state
  const [form, setForm] = useState<SummaryFormData>({
    linkTo: 'ORGANIZATION',
    organizationId: undefined,
    regionId: undefined,
    categoryId: undefined,
    title: '',
    summary: '',
    displayOrder: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingSummary) {
      let linkTo: 'ORGANIZATION' | 'REGION' | 'CATEGORY' = 'ORGANIZATION';
      if (editingSummary.categoryId) linkTo = 'CATEGORY';
      else if (editingSummary.regionId) linkTo = 'REGION';
      else if (editingSummary.organizationId) linkTo = 'ORGANIZATION';

      setForm({
        linkTo,
        organizationId: editingSummary.organizationId,
        regionId: editingSummary.regionId,
        categoryId: editingSummary.categoryId,
        title: editingSummary.title || '',
        summary: editingSummary.summary,
        displayOrder: editingSummary.displayOrder,
      });
    }
  }, [editingSummary]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!form.summary || form.summary.length < 10) {
      setError('Summary must be at least 10 characters');
      return;
    }

    // Entity validation
    if (form.linkTo === 'ORGANIZATION' && !form.organizationId) {
      setError('Please select an organization');
      return;
    }
    if (form.linkTo === 'REGION' && !form.regionId) {
      setError('Please select a region');
      return;
    }
    if (form.linkTo === 'CATEGORY' && !form.categoryId) {
      setError('Please select a category');
      return;
    }

    setSaving(true);
    try {
      if (editingSummary) {
        await updateSummary(editingSummary.id, form);
        showToast('Summary updated successfully!', 'success');
      } else {
        await createSummary(form);
        showToast('Summary created successfully!', 'success');
      }
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save summary');
      showToast(err.message || 'Failed to save summary', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({
      linkTo: 'ORGANIZATION',
      organizationId: undefined,
      regionId: undefined,
      categoryId: undefined,
      title: '',
      summary: '',
      displayOrder: 0,
    });
    setError(null);
    setSaving(false);
    onClose();
  };

  const characterCount = form.summary.length;
  const isValidLength = characterCount >= 10;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto py-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {editingSummary ? 'Edit Summary' : 'Create New Summary'}
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
          {/* Link To (Entity Type) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
              Link To <span className="text-red-600">*</span>
            </label>
            <div className="flex gap-4">
              {ENTITY_TYPES.map((type) => (
                <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="linkTo"
                    value={type.value}
                    checked={form.linkTo === type.value}
                    onChange={(e) => setForm({ ...form, linkTo: e.target.value as any })}
                    disabled={saving}
                    className="w-4 h-4 text-green-900 focus:ring-green-900"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              The summary will be displayed on the selected {form.linkTo.toLowerCase()}'s page
            </p>
          </div>

          {/* Entity Hierarchy Selector */}
          <EntityHierarchySelector
            entityType={form.linkTo}
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

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Title (Optional)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={saving}
              placeholder="e.g., Asia Green Initiatives"
            />
            <p className="text-xs text-gray-500">A heading for the summary (optional)</p>
          </div>

          {/* Summary */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-700">
                Summary <span className="text-red-600">*</span>
              </label>
              <span
                className={`text-xs ${
                  isValidLength ? 'text-gray-600' : 'text-red-600'
                }`}
              >
                {characterCount} characters {!isValidLength && '(minimum 10)'}
              </span>
            </div>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent resize-none ${
                error && !isValidLength ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={saving}
              required
              minLength={10}
              rows={8}
              placeholder="Enter a detailed summary describing this organization/region/category. This text will be displayed on public-facing pages..."
            />
            <p className="text-xs text-gray-500">
              Provide a descriptive summary for display on the public website
            </p>
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
            <p className="text-xs text-gray-500">Lower numbers appear first (default: 0)</p>
          </div>

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
              disabled={saving || !isValidLength}
              className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition disabled:opacity-50 inline-flex items-center gap-2"
            >
              {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : editingSummary ? 'Update Summary' : 'Create Summary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
