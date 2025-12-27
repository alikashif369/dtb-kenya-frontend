"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FolderTree, Filter } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import SubCategoryFormModal from './SubCategoryFormModal';
import {
  SubCategory,
  Category,
  Region,
  Organization,
  listSubCategories,
  listCategories,
  listRegions,
  listOrganizations,
  deleteSubCategory,
  getCategoryTypeLabel,
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

export default function SubCategoriesTab() {
  const { showToast } = useToast();

  // State
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  const [deletingSubCategory, setDeletingSubCategory] = useState<SubCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterOrgId, setFilterOrgId] = useState<number | undefined>(undefined);
  const [filterRegionId, setFilterRegionId] = useState<number | undefined>(undefined);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(undefined);

  // Filtered regions based on org selection
  const filteredRegions = filterOrgId
    ? regions.filter((r) => r.organizationId === filterOrgId)
    : regions;

  // Filtered categories based on region selection
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
      const [subCategoriesData, categoriesData, regionsData, orgsData] = await Promise.all([
        listSubCategories(filterCategoryId),
        listCategories(),
        listRegions(),
        listOrganizations(),
      ]);

      // Apply additional filters on frontend
      let filtered = subCategoriesData;
      if (!filterCategoryId && filterRegionId) {
        const categoryIds = categoriesData
          .filter((c) => c.regionId === filterRegionId)
          .map((c) => c.id);
        filtered = filtered.filter((sc) => categoryIds.includes(sc.categoryId));
      } else if (!filterCategoryId && !filterRegionId && filterOrgId) {
        const regionIds = regionsData
          .filter((r) => r.organizationId === filterOrgId)
          .map((r) => r.id);
        const categoryIds = categoriesData
          .filter((c) => regionIds.includes(c.regionId))
          .map((c) => c.id);
        filtered = filtered.filter((sc) => categoryIds.includes(sc.categoryId));
      }

      setSubCategories(filtered);
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

  // Reset cascading filters
  useEffect(() => {
    if (filterOrgId && filterRegionId) {
      const region = regions.find((r) => r.id === filterRegionId);
      if (region && region.organizationId !== filterOrgId) {
        setFilterRegionId(undefined);
        setFilterCategoryId(undefined);
      }
    }
  }, [filterOrgId, filterRegionId, regions]);

  useEffect(() => {
    if (filterRegionId && filterCategoryId) {
      const category = categories.find((c) => c.id === filterCategoryId);
      if (category && category.regionId !== filterRegionId) {
        setFilterCategoryId(undefined);
      }
    }
  }, [filterRegionId, filterCategoryId, categories]);

  // Handlers
  const handleCreateClick = () => {
    setEditingSubCategory(null);
    setShowFormModal(true);
  };

  const handleEditClick = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setShowFormModal(true);
  };

  const handleDeleteClick = (subCategory: SubCategory) => {
    setDeletingSubCategory(subCategory);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSubCategory) return;

    setDeleting(true);
    try {
      await deleteSubCategory(deletingSubCategory.id);
      showToast('SubCategory deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingSubCategory(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete subcategory', 'error');
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
  };

  const hasActiveFilters = filterOrgId || filterRegionId || filterCategoryId;

  // Get category with region info for display
  const getCategoryWithPath = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return { name: '-', region: '-', type: undefined };
    const region = regions.find((r) => r.id === category.regionId);
    return {
      name: category.name,
      region: region?.name || '-',
      type: category.type,
    };
  };

  // Table columns
  const columns: Column<SubCategory>[] = [
    {
      key: 'name',
      label: 'SubCategory',
      sortable: true,
      render: (subCategory) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <FolderTree className="w-4 h-4 text-indigo-700" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{subCategory.name}</div>
            <div className="text-xs text-gray-500">/{subCategory.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category.name',
      label: 'Category',
      sortable: true,
      render: (subCategory) => {
        const info = getCategoryWithPath(subCategory.categoryId);
        return (
          <div className="space-y-1">
            <div className="text-sm text-gray-900">{info.name}</div>
            {info.type && (
              <Badge variant={TYPE_BADGE_VARIANTS[info.type]}>
                {getCategoryTypeLabel(info.type)}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'region',
      label: 'Region',
      render: (subCategory) => {
        const info = getCategoryWithPath(subCategory.categoryId);
        return <span className="text-sm text-gray-700">{info.region}</span>;
      },
    },
    {
      key: '_count.sites',
      label: 'Sites',
      align: 'center',
      render: (subCategory) => (
        <Badge variant="info">{subCategory._count?.sites || 0}</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (subCategory) => (
        <span className="text-sm text-gray-500">
          {new Date(subCategory.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="SubCategories"
        description="Manage sub-categories for further organizing sites within categories"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create SubCategory
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
                  {category.name} ({getCategoryTypeLabel(category.type)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{subCategories.length}</span> subcategor{subCategories.length !== 1 ? 'ies' : 'y'}
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={subCategories}
        columns={columns}
        keyExtractor={(subCategory) => subCategory.id}
        loading={loading}
        emptyMessage="No subcategories found. Create your first subcategory to get started."
        emptyIcon={<FolderTree className="w-12 h-12 text-gray-300" />}
        actions={(subCategory) => (
          <>
            <ActionButton
              onClick={() => handleEditClick(subCategory)}
              icon={<Pencil className="w-4 h-4" />}
              label="Edit"
            />
            <ActionButton
              onClick={() => handleDeleteClick(subCategory)}
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete"
              variant="danger"
            />
          </>
        )}
      />

      {/* Form Modal */}
      {showFormModal && (
        <SubCategoryFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingSubCategory(null);
          }}
          onSuccess={handleFormSuccess}
          editingSubCategory={editingSubCategory}
          categories={categories}
          regions={regions}
          organizations={organizations}
          defaultCategoryId={filterCategoryId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete SubCategory"
        message={`Are you sure you want to delete "${deletingSubCategory?.name}"? Sites within this subcategory will be unassigned from it. This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingSubCategory(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
