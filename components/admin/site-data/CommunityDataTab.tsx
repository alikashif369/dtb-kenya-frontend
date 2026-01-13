"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, Filter } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import CommunityDataFormModal from './CommunityDataFormModal';
import {
  CommunityData,
  listCommunityData,
  deleteCommunityData,
} from '@/lib/admin/siteDataApi';
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

export default function CommunityDataTab() {
  const { showToast } = useToast();

  // State
  const [data, setData] = useState<CommunityData[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingData, setEditingData] = useState<CommunityData | null>(null);
  const [deletingData, setDeletingData] = useState<CommunityData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterOrgId, setFilterOrgId] = useState<number | undefined>(undefined);
  const [filterRegionId, setFilterRegionId] = useState<number | undefined>(undefined);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(undefined);

  // Filtered dropdown options
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

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [communityData, sitesData, categoriesData, regionsData, orgsData] = await Promise.all([
        listCommunityData(),
        listSites(),
        listCategories(),
        listRegions(),
        listOrganizations(),
      ]);

      // Apply hierarchy filters
      let filtered = communityData;
      if (filterCategoryId) {
        const siteIds = sitesData
          .filter((s) => s.categoryId === filterCategoryId)
          .map((s) => s.id);
        filtered = filtered.filter((d) => siteIds.includes(d.siteId));
      } else if (filterRegionId) {
        const categoryIds = categoriesData
          .filter((c) => c.regionId === filterRegionId)
          .map((c) => c.id);
        const siteIds = sitesData
          .filter((s) => categoryIds.includes(s.categoryId))
          .map((s) => s.id);
        filtered = filtered.filter((d) => siteIds.includes(d.siteId));
      } else if (filterOrgId) {
        const regionIds = regionsData
          .filter((r) => r.organizationId === filterOrgId)
          .map((r) => r.id);
        const categoryIds = categoriesData
          .filter((c) => regionIds.includes(c.regionId))
          .map((c) => c.id);
        const siteIds = sitesData
          .filter((s) => categoryIds.includes(s.categoryId))
          .map((s) => s.id);
        filtered = filtered.filter((d) => siteIds.includes(d.siteId));
      }

      setData(filtered);
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
  }, [filterCategoryId, filterRegionId, filterOrgId]);

  // Handlers
  const handleCreateClick = () => {
    setEditingData(null);
    setShowFormModal(true);
  };

  const handleEditClick = (item: CommunityData) => {
    setEditingData(item);
    setShowFormModal(true);
  };

  const handleDeleteClick = (item: CommunityData) => {
    setDeletingData(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingData) return;

    setDeleting(true);
    try {
      await deleteCommunityData(deletingData.id);
      showToast('Community data deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingData(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setFilterOrgId(undefined);
    setFilterRegionId(undefined);
    setFilterCategoryId(undefined);
  };

  const hasActiveFilters = filterOrgId || filterRegionId || filterCategoryId;

  // Table columns
  const columns: Column<CommunityData>[] = [
    {
      key: 'site.name',
      label: 'Site',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Users className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{item.site?.name || '-'}</div>
            <div className="text-xs text-gray-500">{item.site?.category?.name || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'year',
      label: 'Year',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm">{item.year}</span>
      ),
    },
    {
      key: 'data',
      label: 'Initiatives',
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {Object.entries(item.data).slice(0, 3).map(([key, value]) => (
            <Badge key={key} variant="default">
              {key}: {String(value)}
            </Badge>
          ))}
          {Object.keys(item.data).length > 3 && (
            <Badge variant="info">+{Object.keys(item.data).length - 3}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-500">
          {new Date(item.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Community Data"
        description="Manage community initiative metrics and impact data"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-amber-900 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Community Data
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Organization</label>
            <select
              value={filterOrgId || ''}
              onChange={(e) => setFilterOrgId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-900 focus:border-transparent"
            >
              <option value="">All Organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Region</label>
            <select
              value={filterRegionId || ''}
              onChange={(e) => setFilterRegionId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-900 focus:border-transparent"
            >
              <option value="">All Regions</option>
              {filteredRegions.map((region) => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Category</label>
            <select
              value={filterCategoryId || ''}
              onChange={(e) => setFilterCategoryId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-900 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{data.length}</span> record{data.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        keyExtractor={(item) => item.id}
        loading={loading}
        emptyMessage="No community data found. Add data to track initiative impact."
        emptyIcon={<Users className="w-12 h-12 text-gray-300" />}
        actions={(item) => (
          <>
            <ActionButton
              onClick={() => handleEditClick(item)}
              icon={<Pencil className="w-4 h-4" />}
              label="Edit"
            />
            <ActionButton
              onClick={() => handleDeleteClick(item)}
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete"
              variant="danger"
            />
          </>
        )}
      />

      {/* Form Modal */}
      {showFormModal && (
        <CommunityDataFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingData(null);
          }}
          onSuccess={fetchData}
          editingData={editingData}
          sites={sites}
          categories={categories}
          regions={regions}
          organizations={organizations}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Community Data"
        message={`Are you sure you want to delete community data for "${deletingData?.site?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingData(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
