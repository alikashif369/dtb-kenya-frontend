"use client";

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Filter } from 'lucide-react';
import MetricFormModal from './MetricFormModal';
import MetricListTable from './MetricListTable';
import ConfirmModal from '../shared/ConfirmModal';
import { listMetrics, deleteMetric } from '@/lib/admin/metricsApi';
import { AggregateMetric, MetricFilters } from '@/lib/admin/types';
import { ENTITY_TYPES, METRIC_TYPES } from '@/lib/admin/constants';
import { useToast } from '@/components/ToastContext';

export default function AggregateMetricsTab() {
  const { showToast } = useToast();

  // State
  const [metrics, setMetrics] = useState<AggregateMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState<AggregateMetric | null>(null);
  const [deletingMetric, setDeletingMetric] = useState<AggregateMetric | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filters, setFilters] = useState<MetricFilters>({
    entityType: undefined,
    metricType: undefined,
    year: undefined,
  });

  // Fetch metrics
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await listMetrics(filters);
      setMetrics(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load metrics on mount and when filters change
  useEffect(() => {
    fetchMetrics();
  }, [filters]);

  // Handlers
  const handleCreateClick = () => {
    setEditingMetric(null);
    setShowFormModal(true);
  };

  const handleEditClick = (metric: AggregateMetric) => {
    setEditingMetric(metric);
    setShowFormModal(true);
  };

  const handleDeleteClick = (metric: AggregateMetric) => {
    setDeletingMetric(metric);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMetric) return;

    setDeleting(true);
    try {
      await deleteMetric(deletingMetric.id);
      showToast('Metric deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingMetric(null);
      fetchMetrics();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete metric', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    fetchMetrics();
  };

  const handleFilterChange = (key: keyof MetricFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      entityType: undefined,
      metricType: undefined,
      year: undefined,
    });
  };

  const hasActiveFilters = filters.entityType || filters.metricType || filters.year;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Aggregate Metrics Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage aggregate metrics for organizations, regions, and categories
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Metric
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
          {/* Entity Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Entity Type</label>
            <select
              value={filters.entityType || ''}
              onChange={(e) => handleFilterChange('entityType', e.target.value || undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All Entity Types</option>
              {ENTITY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Metric Type</label>
            <select
              value={filters.metricType || ''}
              onChange={(e) => handleFilterChange('metricType', e.target.value || undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All Metric Types</option>
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

          {/* Year Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Year</label>
            <input
              type="number"
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              placeholder="Filter by year"
              min={2019}
              max={2100}
            />
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
                Showing <span className="font-medium text-gray-900">{metrics.length}</span> metric{metrics.length !== 1 ? 's' : ''}
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

      {/* Metrics List Table */}
      <MetricListTable
        metrics={metrics}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Form Modal */}
      {showFormModal && (
        <MetricFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingMetric(null);
          }}
          onSuccess={handleFormSuccess}
          editingMetric={editingMetric}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Metric"
        message={`Are you sure you want to delete "${deletingMetric?.label}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingMetric(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
