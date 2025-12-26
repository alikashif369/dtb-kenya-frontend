"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Folder, Filter } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import CategoryFormModal from './CategoryFormModal';
import {
  Category,
  Region,
  Organization,
  listCategories,
  listRegions,
  listOrganizations,
  deleteCategory,
  getCategoryTypeLabel,
  CATEGORY_TYPES,
  CategoryType,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

const TYPE_BADGE_VARIANTS: Record<CategoryType, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  PLANTATION: 'success',
  SOLAR: 'warning',
  COMMUNITY: 'info',
  WASTE: 'danger',
  SEWAGE: 'default',
  RESTORATION: 'success',
};

export default function CategoriesTab() {
  const { showToast } = useToast();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterOrgId, setFilterOrgId] = useState<number | undefined>(undefined);
  const [filterRegionId, setFilterRegionId] = useState<number | undefined>(undefined);
  const [filterType, setFilterType] = useState<CategoryType | undefined>(undefined);

  // Filtered regions based on org selection
  const filteredRegions = filterOrgId
    ? regions.filter((r) => r.organizationId === filterOrgId)
    : regions;

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesData, regionsData, orgsData] = await Promise.all([
        listCategories(filterRegionId),
        listRegions(),
        listOrganizations(),
      ]);

      // Filter by type on frontend if needed
      let filtered = categoriesData;
      if (filterType) {
        filtered = filtered.filter((c) => c.type === filterType);
      }

      setCategories(filtered);
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
  }, [filterRegionId, filterType]);

  // Reset region filter when org changes
  useEffect(() => {
    if (filterOrgId && filterRegionId) {
      const region = regions.find((r) => r.id === filterRegionId);
      if (region && region.organizationId !== filterOrgId) {
        setFilterRegionId(undefined);
      }
    }
  }, [filterOrgId, filterRegionId, regions]);

  // Handlers
  const handleCreateClick = () => {
    setEditingCategory(null);
    setShowFormModal(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setShowFormModal(true);
  };

  const handleDeleteClick = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;

    setDeleting(true);
    try {
      await deleteCategory(deletingCategory.id);
      showToast('Category deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingCategory(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete category', 'error');
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
    setFilterType(undefined);
  };

  const hasActiveFilters = filterOrgId || filterRegionId || filterType;

  // Table columns
  const columns: Column<Category>[] = [
    {
      key: 'name',
      label: 'Category',
      sortable: true,
      render: (category) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Folder className="w-4 h-4 text-purple-700" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{category.name}</div>
            <div className="text-xs text-gray-500">/{category.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (category) => (
        <Badge variant={TYPE_BADGE_VARIANTS[category.type]}>
          {getCategoryTypeLabel(category.type)}
        </Badge>
      ),
    },
    {
      key: 'region.name',
      label: 'Region',
      sortable: true,
      render: (category) => (
        <span className="text-sm text-gray-700">
          {category.region?.name || '-'}
        </span>
      ),
    },
    {
      key: '_count.sites',
      label: 'Sites',
      align: 'center',
      render: (category) => (
        <Badge variant="info">{category._count?.sites || 0}</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (category) => (
        <span className="text-sm text-gray-500">
          {new Date(category.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Manage categories within regions (Plantation, Solar, Community, etc.)"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Category
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

          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Type</label>
            <select
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value as CategoryType || undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All Types</option>
              {CATEGORY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{categories.length}</span> categor{categories.length !== 1 ? 'ies' : 'y'}
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={categories}
        columns={columns}
        keyExtractor={(category) => category.id}
        loading={loading}
        emptyMessage="No categories found. Create your first category to get started."
        emptyIcon={<Folder className="w-12 h-12 text-gray-300" />}
        actions={(category) => (
          <>
            <ActionButton
              onClick={() => handleEditClick(category)}
              icon={<Pencil className="w-4 h-4" />}
              label="Edit"
            />
            <ActionButton
              onClick={() => handleDeleteClick(category)}
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete"
              variant="danger"
            />
          </>
        )}
      />

      {/* Form Modal */}
      {showFormModal && (
        <CategoryFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingCategory(null);
          }}
          onSuccess={handleFormSuccess}
          editingCategory={editingCategory}
          regions={regions}
          organizations={organizations}
          defaultRegionId={filterRegionId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? This will also delete all sites within this category. This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingCategory(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
