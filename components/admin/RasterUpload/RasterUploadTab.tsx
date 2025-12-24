"use client";

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Filter } from 'lucide-react';
import RasterUploadForm from './RasterUploadForm';
import RasterListTable from './RasterListTable';
import RasterMapPreview from './RasterMapPreview';
import ConfirmModal from '../shared/ConfirmModal';
import { useHierarchy } from '@/components/vector-draw/useHierarchy';
import { listRasters, deleteRaster, refreshRasterMetadata } from '@/lib/admin/rasterApi';
import { RasterResponse, RasterFilters } from '@/lib/admin/types';
import { YEARS } from '@/lib/admin/constants';
import { useToast } from '@/components/ToastContext';

export default function RasterUploadTab() {
  const { sites } = useHierarchy();
  const { showToast } = useToast();

  // State
  const [rasters, setRasters] = useState<RasterResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRaster, setSelectedRaster] = useState<RasterResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filters, setFilters] = useState<RasterFilters>({
    siteId: undefined,
    year: undefined,
    isClassified: undefined,
  });

  // Fetch rasters
  const fetchRasters = async () => {
    setLoading(true);
    try {
      const data = await listRasters(filters);
      setRasters(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load rasters', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load rasters on mount and when filters change
  useEffect(() => {
    fetchRasters();
  }, [filters]);

  // Handlers
  const handleUploadSuccess = () => {
    fetchRasters();
  };

  const handlePreview = (raster: RasterResponse) => {
    setSelectedRaster(raster);
    setShowPreviewModal(true);
  };

  const handleDeleteClick = (raster: RasterResponse) => {
    setSelectedRaster(raster);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRaster) return;

    setDeleting(true);
    try {
      await deleteRaster(selectedRaster.id);
      showToast('Raster deleted successfully', 'success');
      setShowDeleteModal(false);
      setSelectedRaster(null);
      fetchRasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete raster', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleRefreshMetadata = async (raster: RasterResponse) => {
    try {
      await refreshRasterMetadata(raster.id);
      showToast('Metadata refreshed successfully', 'success');
      fetchRasters();
    } catch (error: any) {
      showToast(error.message || 'Failed to refresh metadata', 'error');
    }
  };

  const handleFilterChange = (key: keyof RasterFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      siteId: undefined,
      year: undefined,
      isClassified: undefined,
    });
  };

  const hasActiveFilters = filters.siteId || filters.year || filters.isClassified !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Raster Upload Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload and manage GeoTIFF raster files for sites
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload New Raster
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
          {/* Site Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Site</label>
            <select
              value={filters.siteId || ''}
              onChange={(e) => handleFilterChange('siteId', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All Sites</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} {site.city ? `- ${site.city}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Year</label>
            <select
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All Years</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Type</label>
            <select
              value={filters.isClassified === undefined ? '' : filters.isClassified ? 'true' : 'false'}
              onChange={(e) =>
                handleFilterChange(
                  'isClassified',
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="false">Base Raster</option>
              <option value="true">Classified Raster</option>
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
                Showing <span className="font-medium text-gray-900">{rasters.length}</span> raster{rasters.length !== 1 ? 's' : ''}
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

      {/* Raster List Table */}
      <RasterListTable
        rasters={rasters}
        loading={loading}
        onPreview={handlePreview}
        onDelete={handleDeleteClick}
        onRefreshMetadata={handleRefreshMetadata}
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <RasterUploadForm
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Map Preview Modal */}
      {showPreviewModal && selectedRaster && (
        <RasterMapPreview
          raster={selectedRaster}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedRaster(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Raster"
        message={`Are you sure you want to delete "${selectedRaster?.fileName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedRaster(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
