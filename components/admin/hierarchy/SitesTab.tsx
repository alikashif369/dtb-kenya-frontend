"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MapPin, Filter, Search, Trees } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import DataTable, { Column, ActionButton, Badge } from '@/components/admin/shared/DataTable';
import ConfirmModal from '@/components/admin/shared/ConfirmModal';
import SiteFormModal from './SiteFormModal';
import SiteSpeciesModal from './SiteSpeciesModal';
import {
  Site,
  Category,
  Region,
  Organization,
  listSites,
  listCategories,
  listRegions,
  listOrganizations,
  deleteSite,
  getSiteTypeLabel,
  SITE_TYPES,
  SiteType,
} from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

const TYPE_BADGE_VARIANTS: Record<SiteType, 'success' | 'info' | 'warning' | 'danger' | 'default'> = {
  HOTEL: 'info',
  PLANTATION: 'success',
  SOLAR_INSTALLATION: 'warning',
  COMMUNITY_INITIATIVE: 'info',
  WASTE_FACILITY: 'danger',
  SEWAGE_PLANT: 'default',
  CONSERVATION: 'success',
};

export default function SitesTab() {
  const { showToast } = useToast();

  // State
  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [speciesSite, setSpeciesSite] = useState<Site | null>(null);

  // Filters
  const [filterOrgId, setFilterOrgId] = useState<number | undefined>(undefined);
  const [filterRegionId, setFilterRegionId] = useState<number | undefined>(undefined);
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>(undefined);
  const [filterType, setFilterType] = useState<SiteType | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');

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
      const [sitesData, categoriesData, regionsData, orgsData] = await Promise.all([
        listSites({
          categoryId: filterCategoryId,
          siteType: filterType,
          search: searchQuery || undefined,
        }),
        listCategories(),
        listRegions(),
        listOrganizations(),
      ]);

      // Additional client-side filtering if needed
      let filtered = sitesData;
      if (filterRegionId && !filterCategoryId) {
        filtered = filtered.filter((s) => {
          const cat = categoriesData.find((c) => c.id === s.categoryId);
          return cat?.regionId === filterRegionId;
        });
      }
      if (filterOrgId && !filterRegionId && !filterCategoryId) {
        filtered = filtered.filter((s) => {
          const cat = categoriesData.find((c) => c.id === s.categoryId);
          const region = regionsData.find((r) => r.id === cat?.regionId);
          return region?.organizationId === filterOrgId;
        });
      }

      setSites(filtered);
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
  }, [filterCategoryId, filterType, searchQuery]);

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
    setEditingSite(null);
    setShowFormModal(true);
  };

  const handleEditClick = (site: Site) => {
    setEditingSite(site);
    setShowFormModal(true);
  };

  const handleDeleteClick = (site: Site) => {
    setDeletingSite(site);
    setShowDeleteModal(true);
  };

  const handleSpeciesClick = (site: Site) => {
    setSpeciesSite(site);
    setShowSpeciesModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSite) return;

    setDeleting(true);
    try {
      await deleteSite(deletingSite.id);
      showToast('Site deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeletingSite(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete site', 'error');
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
    setFilterType(undefined);
    setSearchQuery('');
  };

  const hasActiveFilters = filterOrgId || filterRegionId || filterCategoryId || filterType || searchQuery;

  // Get hierarchy path for a site
  const getSiteHierarchy = (site: Site) => {
    const category = categories.find((c) => c.id === site.categoryId);
    const region = regions.find((r) => r.id === category?.regionId);
    const org = organizations.find((o) => o.id === region?.organizationId);
    return { org, region, category };
  };

  // Table columns
  const columns: Column<Site>[] = [
    {
      key: 'name',
      label: 'Site',
      sortable: true,
      render: (site) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <MapPin className="w-4 h-4 text-green-700" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{site.name}</div>
            <div className="text-xs text-gray-500">/{site.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'siteType',
      label: 'Type',
      render: (site) => (
        <Badge variant={TYPE_BADGE_VARIANTS[site.siteType]}>
          {getSiteTypeLabel(site.siteType)}
        </Badge>
      ),
    },
    {
      key: 'hierarchy',
      label: 'Location',
      render: (site) => {
        const { region, category } = getSiteHierarchy(site);
        return (
          <div className="text-sm">
            <div className="text-gray-700">{category?.name || '-'}</div>
            <div className="text-xs text-gray-500">{region?.name || '-'}</div>
          </div>
        );
      },
    },
    {
      key: 'district',
      label: 'District/City',
      render: (site) => (
        <span className="text-sm text-gray-700">
          {site.district || site.city || '-'}
        </span>
      ),
    },
    {
      key: 'coordinates',
      label: 'Coordinates',
      render: (site) => {
        if (!site.coordinates) return <span className="text-gray-400">-</span>;
        return (
          <span className="text-xs text-gray-600 font-mono">
            {site.coordinates.lat?.toFixed(4)}, {site.coordinates.lng?.toFixed(4)}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (site) => (
        <span className="text-sm text-gray-500">
          {new Date(site.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sites"
        description="Manage individual sites (plantations, solar installations, conservation areas, etc.)"
        actions={
          <button
            onClick={handleCreateClick}
            className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Site
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="space-y-1 lg:col-span-2">
            <label className="text-xs font-medium text-gray-700">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sites..."
                className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              />
            </div>
          </div>

          {/* Organization Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Organization</label>
            <select
              value={filterOrgId || ''}
              onChange={(e) => {
                setFilterOrgId(e.target.value ? Number(e.target.value) : undefined);
                fetchData();
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All</option>
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
              onChange={(e) => {
                setFilterRegionId(e.target.value ? Number(e.target.value) : undefined);
                fetchData();
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All</option>
              {filteredRegions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Site Type</label>
            <select
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value as SiteType || undefined)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
            >
              <option value="">All Types</option>
              {SITE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{sites.length}</span> site{sites.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={sites}
        columns={columns}
        keyExtractor={(site) => site.id}
        loading={loading}
        emptyMessage="No sites found. Create your first site to get started."
        emptyIcon={<MapPin className="w-12 h-12 text-gray-300" />}
        actions={(site) => (
          <>
            <ActionButton
              onClick={() => handleSpeciesClick(site)}
              icon={<Trees className="w-4 h-4" />}
              label="Species"
            />
            <ActionButton
              onClick={() => handleEditClick(site)}
              icon={<Pencil className="w-4 h-4" />}
              label="Edit"
            />
            <ActionButton
              onClick={() => handleDeleteClick(site)}
              icon={<Trash2 className="w-4 h-4" />}
              label="Delete"
              variant="danger"
            />
          </>
        )}
      />

      {/* Form Modal */}
      {showFormModal && (
        <SiteFormModal
          open={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setEditingSite(null);
          }}
          onSuccess={handleFormSuccess}
          editingSite={editingSite}
          categories={categories}
          regions={regions}
          organizations={organizations}
          defaultCategoryId={filterCategoryId}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete Site"
        message={`Are you sure you want to delete "${deletingSite?.name}"? This will also delete all associated data (metrics, boundaries, rasters). This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingSite(null);
        }}
        loading={deleting}
      />

      {/* Site Species Modal */}
      {showSpeciesModal && speciesSite && (
        <SiteSpeciesModal
          open={showSpeciesModal}
          onClose={() => {
            setShowSpeciesModal(false);
            setSpeciesSite(null);
          }}
          site={speciesSite}
        />
      )}
    </div>
  );
}
