"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Leaf, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import SpeciesFormModal from './SpeciesFormModal';
import {
  Species,
  listSpecies,
  deleteSpecies,
  getSpeciesImages,
} from '@/lib/admin/speciesApi';
import { useToast } from '@/components/ToastContext';

export default function SpeciesTab() {
  const { showToast } = useToast();

  // State
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<Species | null>(null);
  const [deletingSpecies, setDeletingSpecies] = useState<Species | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await listSpecies(debouncedSearch || undefined);
      setSpecies(data);
    } catch (error: any) {
      showToast(error.message || 'Failed to load species', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch]);

  // Handlers
  const handleCreateClick = () => {
    setEditingSpecies(null);
    setShowFormModal(true);
  };

  const handleEditClick = (item: Species) => {
    setEditingSpecies(item);
    setShowFormModal(true);
  };

  const handleDeleteClick = (item: Species) => {
    setDeletingSpecies(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSpecies) return;

    setDeleting(true);
    try {
      await deleteSpecies(deletingSpecies.id);
      showToast('Species deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingSpecies(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete species', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Table columns
  const columns: Column<Species>[] = [
    {
      key: 'scientificName',
      label: 'Species',
      sortable: true,
      render: (item) => {
        const images = getSpeciesImages(item);
        return (
          <div className="flex items-center gap-3">
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={item.scientificName}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
            )}
            <div>
              <div className="font-medium text-gray-900 italic">{item.scientificName}</div>
              <div className="text-xs text-gray-500">{item.code || '-'}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'localName',
      label: 'Local Name',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">{item.localName || '-'}</span>
      ),
    },
    {
      key: 'englishName',
      label: 'English Name',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">{item.englishName || '-'}</span>
      ),
    },
    {
      key: 'images',
      label: 'Images',
      align: 'center',
      render: (item) => {
        const count = getSpeciesImages(item).length;
        return (
          <Badge variant={count > 0 ? 'success' : 'default'}>
            {count}/4
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-500">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Species Catalog"
        description="Manage tree and plant species with scientific names, descriptions, and images"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Species
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, scientific name, local name, or English name..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
          />
        </div>
        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{species.length}</span> species
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={species}
        columns={columns}
        keyExtractor={(item) => item.id}
        loading={loading}
        emptyMessage="No species found. Add species to build your catalog."
        emptyIcon={<Leaf className="w-12 h-12 text-gray-300" />}
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
        <SpeciesFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingSpecies(null);
          }}
          onSuccess={fetchData}
          editingSpecies={editingSpecies}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Species"
        message={`Are you sure you want to delete "${deletingSpecies?.scientificName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingSpecies(null);
        }}
        loading={deleting}
      />
    </div>
  );
}
