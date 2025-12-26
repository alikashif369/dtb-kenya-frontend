"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Sun, Search, Zap } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import SolarDataFormModal from './SolarDataFormModal';
import {
  SolarData,
  listSolarData,
  deleteSolarData,
  calculateTotalProduction,
} from '@/lib/admin/siteDataApi';
import { listSites, Site } from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

export default function SolarDataTab() {
  const { showToast } = useToast();

  // Data state
  const [data, setData] = useState<SolarData[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingData, setEditingData] = useState<SolarData | null>(null);
  const [deletingData, setDeletingData] = useState<SolarData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterSiteId, setFilterSiteId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [solarData, sitesData] = await Promise.all([
        listSolarData(filterSiteId),
        listSites({ siteType: 'SOLAR_INSTALLATION' }),
      ]);
      setData(solarData);
      setSites(sitesData);
    } catch (error: any) {
      showToast(error.message || 'Failed to load solar data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterSiteId]);

  // Filter by search
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.site?.name.toLowerCase().includes(query) ||
      item.installationYear.toString().includes(query)
    );
  });

  // Handlers
  const handleCreateClick = () => {
    setEditingData(null);
    setShowFormModal(true);
  };

  const handleEditClick = (item: SolarData) => {
    setEditingData(item);
    setShowFormModal(true);
  };

  const handleDeleteClick = (item: SolarData) => {
    setDeletingData(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingData) return;

    setDeleting(true);
    try {
      await deleteSolarData(deletingData.id);
      showToast('Solar data deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingData(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete solar data', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Calculate totals
  const totalCapacity = filteredData.reduce((sum, item) => sum + item.capacityKwh, 0);
  const totalProduction = filteredData.reduce(
    (sum, item) => sum + calculateTotalProduction(item.quarterlyProduction),
    0
  );

  // Table columns
  const columns: Column<SolarData>[] = [
    {
      key: 'site',
      label: 'Site',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-50 rounded-lg">
            <Sun className="w-4 h-4 text-yellow-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{item.site?.name || '-'}</div>
            <div className="text-xs text-gray-500">{item.site?.category?.name || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'installationYear',
      label: 'Installation',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700">{item.installationYear}</span>
      ),
    },
    {
      key: 'capacityKwh',
      label: 'Capacity',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="text-sm font-medium text-gray-900">
          {item.capacityKwh.toLocaleString()} kWh
        </span>
      ),
    },
    {
      key: 'production',
      label: 'Total Production',
      align: 'right',
      render: (item) => {
        const total = calculateTotalProduction(item.quarterlyProduction);
        return (
          <span className="text-sm text-gray-700">
            {total.toLocaleString()} kWh
          </span>
        );
      },
    },
    {
      key: 'quarters',
      label: 'Quarters Recorded',
      align: 'center',
      render: (item) => {
        const count = Object.keys(item.quarterlyProduction).length;
        return (
          <Badge variant={count > 0 ? 'success' : 'default'}>
            {count} quarters
          </Badge>
        );
      },
    },
    {
      key: 'updatedAt',
      label: 'Updated',
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
        title="Solar Data"
        description="Manage solar installation capacity and quarterly energy production"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Solar Data
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Sun className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
              <p className="text-sm text-gray-500">Solar Sites</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCapacity.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Capacity (kWh)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalProduction.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Production (kWh)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by site name..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterSiteId || ''}
            onChange={(e) => setFilterSiteId(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            <option value="">All Sites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredData.length}</span> records
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyExtractor={(item) => item.id}
        loading={loading}
        emptyMessage="No solar data found. Add data for your solar installations."
        emptyIcon={<Sun className="w-12 h-12 text-gray-300" />}
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
        <SolarDataFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingData(null);
          }}
          onSuccess={fetchData}
          editingData={editingData}
          sites={sites}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Solar Data"
        message={`Are you sure you want to delete solar data for "${deletingData?.site?.name}"? This action cannot be undone.`}
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
