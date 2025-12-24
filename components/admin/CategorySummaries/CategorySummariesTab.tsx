"use client";

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Filter } from 'lucide-react';
import SummaryFormModal from './SummaryFormModal';
import SummaryListTable from './SummaryListTable';
import ConfirmModal from '../shared/ConfirmModal';
import { useHierarchy } from '@/components/vector-draw/useHierarchy';
import { listSummaries, deleteSummary } from '@/lib/admin/summariesApi';
import { CategorySummary, SummaryFilters } from '@/lib/admin/types';
import { useToast } from '@/components/ToastContext';

export default function CategorySummariesTab() {
  const { orgs, regionsByOrg, categoriesByRegion } = useHierarchy();
  const { showToast } = useToast();

  // Flatten hierarchy data for filters
  const organizations = orgs;
  const regions = Object.values(regionsByOrg).flat();
  const categories = Object.values(categoriesByRegion).flat();

  // State
  const [summaries, setSummaries] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSummary, setEditingSummary] = useState<CategorySummary | null>(null);
  const [deletingSummary, setDeletingSummary] = useState<CategorySummary | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filters, setFilters] = useState<SummaryFilters>({
    organizationId: undefined,
    regionId: undefined,
    categoryId: undefined,
  });

  // Fetch summaries
  const fetchSummaries = async () => {
    setLoading(true);
    try {
      const data = await listSummaries(filters);
      setSummaries(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load summaries', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load summaries on mount and when filters change
  useEffect(() => {
    fetchSummaries();
  }, [filters]);

  // Handlers
  const handleCreateClick = () => {
    setEditingSummary(null);
    setShowFormModal(true);
  };

  const handleEditClick = (summary: CategorySummary) => {
    setEditingSummary(summary);
    setShowFormModal(true);
  };

  const handleDeleteClick = (summary: CategorySummary) => {
    setDeletingSummary(summary);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSummary) return;

    setDeleting(true);
    try {
      await deleteSummary(deletingSummary.id);
      showToast('Summary deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingSummary(null);
      fetchSummaries();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete summary', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    fetchSummaries();
  };

  const handleFilterChange = (key: keyof SummaryFilters, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // Clear dependent filters when parent changes
      if (key === 'organizationId') {
        newFilters.regionId = undefined;
        newFilters.categoryId = undefined;
      } else if (key === 'regionId') {
        newFilters.categoryId = undefined;
      }

      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      organizationId: undefined,
      regionId: undefined,
      categoryId: undefined,
    });
  };

  const hasActiveFilters = filters.organizationId || filters.regionId || filters.categoryId;

  // Filter regions and categories based on parent selections
  const filteredRegions = filters.organizationId
    ? regions.filter((r) => r.organizationId === filters.organizationId)
    : regions;

  const filteredCategories = filters.regionId
    ? categories.filter((c) => c.regionId === filters.regionId)
    : filters.organizationId
    ? categories.filter((c) => c.region?.organizationId === filters.organizationId)
    : categories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Summaries Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage summaries for organizations, regions, and categories
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Summary
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Organization Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Organization</label>
            <select
              value={filters.organizationId || ''}
              onChange={(e) => handleFilterChange('organizationId', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Region</label>
            <select
              value={filters.regionId || ''}
              onChange={(e) => handleFilterChange('regionId', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={!filters.organizationId}
            >
              <option value="">All Regions</option>
              {filteredRegions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Category</label>
            <select
              value={filters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={!filters.regionId}
            >
              <option value="">All Categories</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
          <div>
            {loading ? (
              <span className="inline-flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Loading...
              </span>
            ) : (
              <span>
                Showing <span className="font-medium text-gray-900">{summaries.length}</span> summar{summaries.length !== 1 ? 'ies' : 'y'}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <span className="text-blue-600 font-medium">
              {Object.values(filters).filter(Boolean).length} filter{Object.values(filters).filter(Boolean).length !== 1 ? 's' : ''} active
            </span>
          )}
        </div>
      </div>

      {/* Summaries List Table */}
      <SummaryListTable
        summaries={summaries}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Form Modal */}
      {showFormModal && (
        <SummaryFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingSummary(null);
          }}
          onSuccess={handleFormSuccess}
          editingSummary={editingSummary}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Summary"
        message={`Are you sure you want to delete "${deletingSummary?.title || 'this summary'}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingSummary(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
