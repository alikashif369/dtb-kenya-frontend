"use client";

import { useState } from 'react';
import { Edit, Trash2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { CategorySummary } from '@/lib/admin/types';

interface SummaryListTableProps {
  summaries: CategorySummary[];
  loading: boolean;
  onEdit: (summary: CategorySummary) => void;
  onDelete: (summary: CategorySummary) => void;
}

export default function SummaryListTable({ summaries, loading, onEdit, onDelete }: SummaryListTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (summaries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No summaries found. Create your first summary to get started.</p>
      </div>
    );
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide w-8">
                {/* Expand icon column */}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Linked To
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Summary Preview
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary, index) => (
              <React.Fragment key={summary.id}>
                <tr
                  className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {/* Expand Button */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleExpand(summary.id)}
                      className="text-gray-400 hover:text-gray-600 transition"
                      title="Toggle full summary"
                    >
                      {expandedId === summary.id ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm text-gray-900">
                      {summary.title || <span className="italic text-gray-400">Untitled</span>}
                    </div>
                  </td>

                  {/* Linked To */}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      {summary.organizationId && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          Org: {summary.organization?.name || 'Unknown'}
                        </span>
                      )}
                      {summary.regionId && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Region: {summary.region?.name || 'Unknown'}
                        </span>
                      )}
                      {summary.categoryId && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Category: {summary.category?.name || 'Unknown'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Summary Preview */}
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-md">
                    <div className="line-clamp-2">{summary.summary}</div>
                  </td>

                  {/* Display Order */}
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    {summary.displayOrder}
                  </td>

                  {/* Created At */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(summary.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(summary)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded transition"
                        title="Edit summary"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(summary)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 rounded transition"
                        title="Delete summary"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Row - Full Summary */}
                {expandedId === summary.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-4 py-4 border-b border-gray-200">
                      <div className="max-w-3xl">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          Full Summary
                        </h4>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white rounded border border-gray-200 p-4">
                          {summary.summary}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {summaries.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{summaries.length}</span> summar{summaries.length !== 1 ? 'ies' : 'y'}
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-8"></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Linked To</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Summary Preview</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="px-4 py-3">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse mx-auto" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
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
        <span className="text-sm text-gray-600">Loading summaries...</span>
      </div>
    </div>
  );
}

// Helper function
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Import React for Fragment
import React from 'react';
