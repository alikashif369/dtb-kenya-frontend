"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Droplets, Search, Factory, Gauge } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import SewageDataFormModal from './SewageDataFormModal';
import {
  SewageData,
  listSewageData,
  deleteSewageData,
} from '@/lib/admin/siteDataApi';
import { listSites, Site } from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

export default function SewageDataTab() {
  const { showToast } = useToast();

  // Data state
  const [data, setData] = useState<SewageData[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingData, setEditingData] = useState<SewageData | null>(null);
  const [deletingData, setDeletingData] = useState<SewageData | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filterSiteId, setFilterSiteId] = useState<number | undefined>(undefined);
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [sewageData, sitesData] = await Promise.all([
        listSewageData({ siteId: filterSiteId, year: filterYear }),
        listSites(),
      ]);
      setData(sewageData);
      setSites(sitesData);
    } catch (error: any) {
      showToast(error.message || 'Failed to load sewage data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterSiteId, filterYear]);

  // Filter by search
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.site?.name.toLowerCase().includes(query) ||
      item.year.toString().includes(query)
    );
  });

  // Handlers
  const handleCreateClick = () => {
    setEditingData(null);
    setShowFormModal(true);
  };

  const handleEditClick = (item: SewageData) => {
    setEditingData(item);
    setShowFormModal(true);
  };

  const handleDeleteClick = (item: SewageData) => {
    setDeletingData(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingData) return;

    setDeleting(true);
    try {
      await deleteSewageData(deletingData.id);
      showToast('Sewage data deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingData(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete sewage data', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Calculate totals
  const avgRecoveryRatio = filteredData.length > 0
    ? filteredData.reduce((sum, item) => sum + item.recoveryRatio, 0) / filteredData.length
    : 0;
  const totalMethaneSaved = filteredData.reduce((sum, item) => sum + item.methaneSaved, 0);

  // Get years for filter (2019 to 2100)
  const years = [];
  for (let y = 2019; y <= 2100; y++) {
    years.push(y);
  }

  // Table columns
  const columns: Column<SewageData>[] = [
    {
      key: 'site',
      label: 'Site',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Droplets className="w-4 h-4 text-blue-600" />
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
        <Badge variant="default">{item.year}</Badge>
      ),
    },
    {
      key: 'recoveryRatio',
      label: 'Recovery Ratio',
      sortable: true,
      align: 'center',
      render: (item) => {
        const ratio = item.recoveryRatio;
        return (
          <Badge variant={ratio >= 80 ? 'success' : ratio >= 50 ? 'warning' : 'default'}>
            {ratio.toFixed(1)}%
          </Badge>
        );
      },
    },
    {
      key: 'methaneSaved',
      label: 'Methane Saved',
      sortable: true,
      align: 'right',
      render: (item) => (
        <span className="text-sm font-medium text-green-700">
          {item.methaneSaved.toLocaleString()} m³
        </span>
      ),
    },
    {
      key: 'efficiency',
      label: 'Efficiency',
      align: 'center',
      render: (item) => {
        const ratio = item.recoveryRatio;
        let level = 'Low';
        let color = 'text-gray-500';
        if (ratio >= 80) {
          level = 'Excellent';
          color = 'text-green-600';
        } else if (ratio >= 60) {
          level = 'Good';
          color = 'text-blue-600';
        } else if (ratio >= 40) {
          level = 'Moderate';
          color = 'text-amber-600';
        }
        return (
          <span className={`text-sm font-medium ${color}`}>{level}</span>
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
        title="Sewage Data"
        description="Manage sewage treatment recovery and methane capture data"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Sewage Data
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Droplets className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
              <p className="text-sm text-gray-500">Records</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Gauge className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgRecoveryRatio.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Avg Recovery Ratio</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Factory className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalMethaneSaved.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Methane Saved (m³)</p>
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
          <select
            value={filterYear || ''}
            onChange={(e) => setFilterYear(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
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
        emptyMessage="No sewage data found. Add data to track treatment recovery."
        emptyIcon={<Droplets className="w-12 h-12 text-gray-300" />}
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
        <SewageDataFormModal
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
        title="Delete Sewage Data"
        message={`Are you sure you want to delete sewage data for "${deletingData?.site?.name}" (${deletingData?.year})? This action cannot be undone.`}
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
