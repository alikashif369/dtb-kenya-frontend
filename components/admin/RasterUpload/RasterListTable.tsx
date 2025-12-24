"use client";

import { Eye, Trash2, RefreshCw } from 'lucide-react';
import { RasterResponse } from '@/lib/admin/types';
import { getRasterTypeBadgeClass } from '@/lib/admin/constants';

interface RasterListTableProps {
  rasters: RasterResponse[];
  loading: boolean;
  onPreview: (raster: RasterResponse) => void;
  onDelete: (raster: RasterResponse) => void;
  onRefreshMetadata: (raster: RasterResponse) => void;
}

export default function RasterListTable({ rasters, loading, onPreview, onDelete, onRefreshMetadata }: RasterListTableProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (rasters.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No rasters found. Upload your first GeoTIFF file to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Site
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Year
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                File Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Size
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Uploaded
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rasters.map((raster, index) => (
              <tr
                key={raster.id}
                className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-900">{raster.id}</td>
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-gray-900">{raster.site?.name || 'Unknown'}</div>
                  {raster.site?.category && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      {raster.site.category.region?.organization?.name || ''} → {raster.site.category.region?.name || ''} → {raster.site.category.name}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{raster.year}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRasterTypeBadgeClass(
                      raster.isClassified
                    )}`}
                  >
                    {raster.isClassified ? 'Classified' : 'Base'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate" title={raster.fileName}>
                  {raster.fileName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatFileSize(raster.fileSize)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(raster.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onPreview(raster)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded transition"
                      title="Preview on map"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                    <button
                      onClick={() => onRefreshMetadata(raster)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 rounded transition"
                      title="Refresh metadata from TiTiler"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh
                    </button>
                    <button
                      onClick={() => onDelete(raster)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 rounded transition"
                      title="Delete raster"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (placeholder for future) */}
      {rasters.length > 20 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{rasters.length}</span> raster{rasters.length !== 1 ? 's' : ''}
          </p>
          <div className="text-xs text-gray-500">Pagination coming soon</div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Site</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Year</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">File Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Size</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Uploaded</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="px-4 py-3">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-center">
        <RefreshCw className="w-4 h-4 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-600">Loading rasters...</span>
      </div>
    </div>
  );
}

// Helper functions
function formatFileSize(sizeString: string): string {
  const bytes = parseInt(sizeString);
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
