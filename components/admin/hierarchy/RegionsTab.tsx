"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Globe, Filter } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import RegionFormModal from './RegionFormModal';
import {
  Region,
  Organization,
  listRegions,
  listOrganizations,
  deleteRegion,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

export default function RegionsTab() {
  const { showToast } = useToast();

  // State
  const [regions, setRegions] = useState<Region[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [deletingRegion, setDeletingRegion] = useState<Region | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterOrgId, setFilterOrgId] = useState<number | undefined>(undefined);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [regionsData, orgsData] = await Promise.all([
        listRegions(filterOrgId),
        listOrganizations(),
      ]);
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
  }, [filterOrgId]);

  // Handlers
  const handleCreateClick = () => {
    setEditingRegion(null);
    setShowFormModal(true);
  };

  const handleEditClick = (region: Region) => {
    setEditingRegion(region);
    setShowFormModal(true);
  };

  const handleDeleteClick = (region: Region) => {
    setDeletingRegion(region);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRegion) return;

    setDeleting(true);
    try {
      await deleteRegion(deletingRegion.id);
      showToast('Region deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingRegion(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete region', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    fetchData();
  };

  // Table columns
  const columns: Column<Region>[] = [
    {
      key: 'name',
      label: 'Region',
      sortable: true,
      render: (region) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Globe className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{region.name}</div>
            <div className="text-xs text-gray-500">/{region.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'organization.name',
      label: 'Organization',
      sortable: true,
      render: (region) => (
        <span className="text-sm text-gray-700">
          {region.organization?.name || '-'}
        </span>
      ),
    },
    {
      key: '_count.categories',
      label: 'Categories',
      align: 'center',
      render: (region) => (
        <Badge variant="info">{region._count?.categories || 0}</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (region) => (
        <span className="text-sm text-gray-500">
          {new Date(region.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Regions"
        description="Manage geographic regions within organizations"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Region
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {filterOrgId && (
            <button
              onClick={() => setFilterOrgId(undefined)}
              className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{regions.length}</span> region{regions.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={regions}
        columns={columns}
        keyExtractor={(region) => region.id}
        loading={loading}
        emptyMessage="No regions found. Create your first region to get started."
        emptyIcon={<Globe className="w-12 h-12 text-gray-300" />}
        actions={(region) => (
          <>
            <ActionButton
              onClick={() => handleEditClick(region)}
              icon={<Pencil className="w-4 h-4" />}
              label="Edit"
            />
            <ActionButton
              onClick={() => handleDeleteClick(region)}
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete"
              variant="danger"
            />
          </>
        )}
      />

      {/* Form Modal */}
      {showFormModal && (
        <RegionFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingRegion(null);
          }}
          onSuccess={handleFormSuccess}
          editingRegion={editingRegion}
          organizations={organizations}
          defaultOrganizationId={filterOrgId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Region"
        message={`Are you sure you want to delete "${deletingRegion?.name}"? This will also delete all categories and sites within this region. This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingRegion(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
