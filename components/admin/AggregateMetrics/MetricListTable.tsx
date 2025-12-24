"use client";

import { Edit, Trash2, RefreshCw } from 'lucide-react';
import { AggregateMetric } from '@/lib/admin/types';
import { getMetricTypeLabel, getEntityTypeLabel } from '@/lib/admin/constants';

interface MetricListTableProps {
  metrics: AggregateMetric[];
  loading: boolean;
  onEdit: (metric: AggregateMetric) => void;
  onDelete: (metric: AggregateMetric) => void;
}

export default function MetricListTable({ metrics, loading, onEdit, onDelete }: MetricListTableProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (metrics.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No metrics found. Create your first metric to get started.</p>
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
                Label
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Entity
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Metric Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Period
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Target
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Achieved
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Order
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => (
              <tr
                key={metric.id}
                className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-sm text-gray-900">{metric.label}</div>
                  {metric.description && (
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{metric.description}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        metric.entityType === 'ORGANIZATION'
                          ? 'bg-purple-100 text-purple-800'
                          : metric.entityType === 'REGION'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {getEntityTypeLabel(metric.entityType)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {formatEntityPath(metric)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {getMetricTypeLabel(metric.metricType)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatPeriod(metric)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {metric.targetValue !== null && metric.targetValue !== undefined ? (
                    <span className="font-medium text-gray-900">
                      {formatNumber(metric.targetValue)} {metric.unit || ''}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {metric.achievedValue !== null && metric.achievedValue !== undefined ? (
                    <span className="font-medium text-gray-900">
                      {formatNumber(metric.achievedValue)} {metric.unit || ''}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-600">
                  {metric.displayOrder}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(metric)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded transition"
                      title="Edit metric"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(metric)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 rounded transition"
                      title="Delete metric"
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

      {/* Footer */}
      {metrics.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{metrics.length}</span> metric{metrics.length !== 1 ? 's' : ''}
          </p>
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Label</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Entity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Metric Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Period</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Target</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Achieved</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Order</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="px-4 py-3">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-center">
        <RefreshCw className="w-4 h-4 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-600">Loading metrics...</span>
      </div>
    </div>
  );
}

// Helper functions
function formatEntityPath(metric: AggregateMetric): string {
  if (metric.entityType === 'ORGANIZATION') {
    return metric.organization?.name || 'Unknown Organization';
  } else if (metric.entityType === 'REGION') {
    return metric.region?.name || 'Unknown Region';
  } else if (metric.entityType === 'CATEGORY') {
    return metric.category?.name || 'Unknown Category';
  }
  return '';
}

function formatPeriod(metric: AggregateMetric): string {
  if (metric.year) {
    return String(metric.year);
  } else if (metric.startYear && metric.endYear) {
    return `${metric.startYear}-${metric.endYear}`;
  }
  return '-';
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}
