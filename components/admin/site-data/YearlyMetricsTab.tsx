"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BarChart3, Filter, TreeDeciduous, ChevronDown, ChevronRight } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import YearlyMetricsFormModal from './YearlyMetricsFormModal';
import {
  YearlyMetrics,
  listYearlyMetrics,
  deleteYearlyMetrics,
  LAND_COVER_FIELDS,
  getAvailableYears,
} from '@/lib/admin/yearlyMetricsApi';
import {
  Site,
  Category,
  Region,
  Organization,
  listSites,
  listCategories,
  listRegions,
  listOrganizations,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

export default function YearlyMetricsTab() {
  const { showToast } = useToast();

  // State
  const [metrics, setMetrics] = useState<YearlyMetrics[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingMetrics, setEditingMetrics] = useState<YearlyMetrics | null>(null);
  const [deletingMetrics, setDeletingMetrics] = useState<YearlyMetrics | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterOrgId, setFilterOrgId] = useState<number | undefined>(undefined);
  const [filterRegionId, setFilterRegionId] = useState<number | undefined>(undefined);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(undefined);
  const [filterSiteId, setFilterSiteId] = useState<number | undefined>(undefined);
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);

  // Expanded rows for land cover details
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const years = getAvailableYears();

  // Filtered dropdown options based on hierarchy
  const filteredRegions = filterOrgId
    ? regions.filter((r) => r.organizationId === filterOrgId)
    : regions;

  const filteredCategories = filterRegionId
    ? categories.filter((c) => c.regionId === filterRegionId)
    : filterOrgId
    ? categories.filter((c) => {
        const region = regions.find((r) => r.id === c.regionId);
        return region?.organizationId === filterOrgId;
      })
    : categories;

  const filteredSites = filterCategoryId
    ? sites.filter((s) => s.categoryId === filterCategoryId)
    : filterRegionId
    ? sites.filter((s) => {
        const category = categories.find((c) => c.id === s.categoryId);
        return category?.regionId === filterRegionId;
      })
    : filterOrgId
    ? sites.filter((s) => {
        const category = categories.find((c) => c.id === s.categoryId);
        const region = regions.find((r) => r.id === category?.regionId);
        return region?.organizationId === filterOrgId;
      })
    : sites;

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [metricsData, sitesData, categoriesData, regionsData, orgsData] = await Promise.all([
        listYearlyMetrics({ siteId: filterSiteId, year: filterYear }),
        listSites(),
        listCategories(),
        listRegions(),
        listOrganizations(),
      ]);

      // Apply additional filters on frontend
      let filtered = metricsData;
      if (!filterSiteId && filterCategoryId) {
        const siteIds = sitesData
          .filter((s) => s.categoryId === filterCategoryId)
          .map((s) => s.id);
        filtered = filtered.filter((m) => siteIds.includes(m.siteId));
      } else if (!filterSiteId && !filterCategoryId && filterRegionId) {
        const categoryIds = categoriesData
          .filter((c) => c.regionId === filterRegionId)
          .map((c) => c.id);
        const siteIds = sitesData
          .filter((s) => categoryIds.includes(s.categoryId))
          .map((s) => s.id);
        filtered = filtered.filter((m) => siteIds.includes(m.siteId));
      } else if (!filterSiteId && !filterCategoryId && !filterRegionId && filterOrgId) {
        const regionIds = regionsData
          .filter((r) => r.organizationId === filterOrgId)
          .map((r) => r.id);
        const categoryIds = categoriesData
          .filter((c) => regionIds.includes(c.regionId))
          .map((c) => c.id);
        const siteIds = sitesData
          .filter((s) => categoryIds.includes(s.categoryId))
          .map((s) => s.id);
        filtered = filtered.filter((m) => siteIds.includes(m.siteId));
      }

      setMetrics(filtered);
      setSites(sitesData);
      setCategories(categoriesData);
      setRegions(regionsData);
      setOrganizations(orgsData);
    } catch (error: any) {
      showToast(error.message || 'Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterSiteId, filterYear, filterCategoryId, filterRegionId, filterOrgId]);

  // Reset cascading filters
  useEffect(() => {
    if (filterOrgId && filterRegionId) {
      const region = regions.find((r) => r.id === filterRegionId);
      if (region && region.organizationId !== filterOrgId) {
        setFilterRegionId(undefined);
        setFilterCategoryId(undefined);
        setFilterSiteId(undefined);
      }
    }
  }, [filterOrgId, filterRegionId, regions]);

  useEffect(() => {
    if (filterRegionId && filterCategoryId) {
      const category = categories.find((c) => c.id === filterCategoryId);
      if (category && category.regionId !== filterRegionId) {
        setFilterCategoryId(undefined);
        setFilterSiteId(undefined);
      }
    }
  }, [filterRegionId, filterCategoryId, categories]);

  useEffect(() => {
    if (filterCategoryId && filterSiteId) {
      const site = sites.find((s) => s.id === filterSiteId);
      if (site && site.categoryId !== filterCategoryId) {
        setFilterSiteId(undefined);
      }
    }
  }, [filterCategoryId, filterSiteId, sites]);

  // Handlers
  const handleCreateClick = () => {
    setEditingMetrics(null);
    setShowFormModal(true);
  };

  const handleEditClick = (metric: YearlyMetrics) => {
    setEditingMetrics(metric);
    setShowFormModal(true);
  };

  const handleDeleteClick = (metric: YearlyMetrics) => {
    setDeletingMetrics(metric);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMetrics) return;

    setDeleting(true);
    try {
      await deleteYearlyMetrics(deletingMetrics.id);
      showToast('Yearly metrics deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingMetrics(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete metrics', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    fetchData();
  };

  const clearFilters = () => {
    setFilterOrgId(undefined);
    setFilterRegionId(undefined);
    setFilterCategoryId(undefined);
    setFilterSiteId(undefined);
    setFilterYear(undefined);
  };

  const toggleRowExpand = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasActiveFilters = filterOrgId || filterRegionId || filterCategoryId || filterSiteId || filterYear;

  // Table columns
  const columns: Column<YearlyMetrics>[] = [
    {
      key: 'expand',
      label: '',
      render: (metric) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleRowExpand(metric.id);
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {expandedRows.has(metric.id) ? (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      ),
    },
    {
      key: 'site.name',
      label: 'Site',
      sortable: true,
      render: (metric) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <TreeDeciduous className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{metric.site?.name || '-'}</div>
            <div className="text-xs text-gray-500">
              {metric.site?.category?.name || '-'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'year',
      label: 'Year',
      sortable: true,
      render: (metric) => (
        <Badge variant="info">{metric.year}</Badge>
      ),
    },
    {
      key: 'treeCanopy',
      label: 'Tree Canopy',
      sortable: true,
      align: 'right',
      render: (metric) => (
        <span className="font-mono text-sm">
          {metric.treeCanopy != null ? `${metric.treeCanopy.toFixed(2)}%` : '-'}
        </span>
      ),
    },
    {
      key: 'greenArea',
      label: 'Green Area',
      sortable: true,
      align: 'right',
      render: (metric) => (
        <span className="font-mono text-sm">
          {metric.greenArea != null ? `${metric.greenArea.toFixed(2)}%` : '-'}
        </span>
      ),
    },
    {
      key: 'barrenLand',
      label: 'Barren Land',
      sortable: true,
      align: 'right',
      render: (metric) => (
        <span className="font-mono text-sm">
          {metric.barrenLand != null ? `${metric.barrenLand.toFixed(2)}%` : '-'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (metric) => (
        <span className="text-sm text-gray-500">
          {new Date(metric.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // Render expanded row content
  const renderExpandedRow = (metric: YearlyMetrics) => {
    if (!expandedRows.has(metric.id)) return null;

    return (
      <tr key={`${metric.id}-expanded`}>
        <td colSpan={columns.length + 1} className="bg-gray-50 px-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900">Land Cover Breakdown</h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {LAND_COVER_FIELDS.map((field) => {
                const value = metric[field.key as keyof YearlyMetrics];
                return (
                  <div key={field.key} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: field.color }}
                    />
                    <div className="text-sm">
                      <span className="text-gray-600">{field.label}:</span>{' '}
                      <span className="font-medium">
                        {typeof value === 'number' ? `${value.toFixed(2)}%` : '-'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {(metric.baseRaster || metric.classifiedRaster) && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Linked Rasters</h4>
                <div className="flex gap-4">
                  {metric.baseRaster && (
                    <div className="text-sm">
                      <span className="text-gray-600">Base:</span>{' '}
                      <span className="font-medium">{metric.baseRaster.fileName}</span>
                    </div>
                  )}
                  {metric.classifiedRaster && (
                    <div className="text-sm">
                      <span className="text-gray-600">Classified:</span>{' '}
                      <span className="font-medium">{metric.classifiedRaster.fileName}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Yearly Metrics"
        description="Manage land cover metrics for sites by year"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Metrics
          </button>
        }
      />

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

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Organization Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Organization</label>
            <select
              value={filterOrgId || ''}
              onChange={(e) => setFilterOrgId(e.target.value ? Number(e.target.value) : undefined)}
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
              value={filterRegionId || ''}
              onChange={(e) => setFilterRegionId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
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
              value={filterCategoryId || ''}
              onChange={(e) => setFilterCategoryId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Site Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Site</label>
            <select
              value={filterSiteId || ''}
              onChange={(e) => setFilterSiteId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All Sites</option>
              {filteredSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Year</label>
            <select
              value={filterYear || ''}
              onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{metrics.length}</span> metric record{metrics.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={metrics}
        columns={columns}
        keyExtractor={(metric) => metric.id}
        loading={loading}
        emptyMessage="No yearly metrics found. Add metrics to track land cover changes over time."
        emptyIcon={<BarChart3 className="w-12 h-12 text-gray-300" />}
        actions={(metric) => (
          <>
            <ActionButton
              onClick={() => handleEditClick(metric)}
              icon={<Pencil className="w-4 h-4" />}
              label="Edit"
            />
            <ActionButton
              onClick={() => handleDeleteClick(metric)}
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete"
              variant="danger"
            />
          </>
        )}
        expandedRowRender={renderExpandedRow}
      />

      {/* Form Modal */}
      {showFormModal && (
        <YearlyMetricsFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingMetrics(null);
          }}
          onSuccess={handleFormSuccess}
          editingMetrics={editingMetrics}
          sites={sites}
          categories={categories}
          regions={regions}
          organizations={organizations}
          defaultSiteId={filterSiteId}
          defaultYear={filterYear}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Yearly Metrics"
        message={`Are you sure you want to delete metrics for "${deletingMetrics?.site?.name}" (${deletingMetrics?.year})? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingMetrics(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
