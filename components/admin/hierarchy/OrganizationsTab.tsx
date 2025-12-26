"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import OrganizationFormModal from './OrganizationFormModal';
import {
  Organization,
  listOrganizations,
  deleteOrganization,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

export default function OrganizationsTab() {
  const { showToast } = useToast();

  // State
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch organizations
  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const data = await listOrganizations();
      setOrganizations(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load organizations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Handlers
  const handleCreateClick = () => {
    setEditingOrg(null);
    setShowFormModal(true);
  };

  const handleEditClick = (org: Organization) => {
    setEditingOrg(org);
    setShowFormModal(true);
  };

  const handleDeleteClick = (org: Organization) => {
    setDeletingOrg(org);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOrg) return;

    setDeleting(true);
    try {
      await deleteOrganization(deletingOrg.id);
      showToast('Organization deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingOrg(null);
      fetchOrganizations();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete organization', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    fetchOrganizations();
  };

  // Table columns
  const columns: Column<Organization>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (org) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Building2 className="w-4 h-4 text-green-700" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{org.name}</div>
            <div className="text-xs text-gray-500">/{org.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (org) => (
        <span className="text-gray-600 text-sm">
          {org.description || <span className="text-gray-400 italic">No description</span>}
        </span>
      ),
    },
    {
      key: '_count.regions',
      label: 'Regions',
      align: 'center',
      render: (org) => (
        <Badge variant="info">{org._count?.regions || 0} regions</Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (org) => (
        <span className="text-sm text-gray-500">
          {new Date(org.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Organizations"
        description="Manage top-level organizations in the hierarchy"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Organization
          </button>
        }
      />

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Organizations</strong> are the top level of the hierarchy. Each organization
          contains regions, which contain categories, which contain sites.
        </p>
      </div>

      {/* Table */}
      <DataTable
        data={organizations}
        columns={columns}
        keyExtractor={(org) => org.id}
        loading={loading}
        emptyMessage="No organizations found. Create your first organization to get started."
        emptyIcon={<Building2 className="w-12 h-12 text-gray-300" />}
        actions={(org) => (
          <>
            <ActionButton
              onClick={() => handleEditClick(org)}
              icon={<Pencil className="w-4 h-4" />}
              label="Edit"
            />
            <ActionButton
              onClick={() => handleDeleteClick(org)}
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete"
              variant="danger"
            />
          </>
        )}
      />

      {/* Form Modal */}
      {showFormModal && (
        <OrganizationFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingOrg(null);
          }}
          onSuccess={handleFormSuccess}
          editingOrg={editingOrg}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Organization"
        message={`Are you sure you want to delete "${deletingOrg?.name}"? This will also delete all regions, categories, and sites within this organization. This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingOrg(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
