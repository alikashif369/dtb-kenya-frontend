"use client";

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Leaf, Trees, Calendar, Hash, Search } from 'lucide-react';
import { inputClassName } from '@/components/admin/shared/FormModal';
import {
  SiteSpecies,
  getSpeciesAtSite,
  addSpeciesToSite,
  updateSiteSpecies,
  removeSpeciesFromSite,
  getSiteSpeciesStats,
  SiteSpeciesStats,
} from '@/lib/admin/siteSpeciesApi';
import { Species, listSpecies } from '@/lib/admin/speciesApi';
import { Site } from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface SiteSpeciesModalProps {
  open: boolean;
  onClose: () => void;
  site: Site;
}

export default function SiteSpeciesModal({
  open,
  onClose,
  site,
}: SiteSpeciesModalProps) {
  const { showToast } = useToast();

  // Data state
  const [siteSpecies, setSiteSpecies] = useState<SiteSpecies[]>([]);
  const [allSpecies, setAllSpecies] = useState<Species[]>([]);
  const [stats, setStats] = useState<SiteSpeciesStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | ''>('');
  const [plantedCount, setPlantedCount] = useState<number | ''>('');
  const [plantedYear, setPlantedYear] = useState<number | ''>('');
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editCount, setEditCount] = useState<number | ''>('');
  const [editYear, setEditYear] = useState<number | ''>('');

  // Search/filter
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [speciesData, allSpeciesData, statsData] = await Promise.all([
        getSpeciesAtSite(site.id),
        listSpecies(),
        getSiteSpeciesStats(site.id),
      ]);
      setSiteSpecies(speciesData);
      setAllSpecies(allSpeciesData);
      setStats(statsData);
    } catch (error: any) {
      showToast(error.message || 'Failed to load species data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, site.id]);

  // Get available species (not already added)
  const availableSpecies = allSpecies.filter(
    (s) => !siteSpecies.some((ss) => ss.speciesId === s.id)
  );

  // Filter site species by search
  const filteredSiteSpecies = siteSpecies.filter((ss) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ss.species.scientificName.toLowerCase().includes(query) ||
      ss.species.localName.toLowerCase().includes(query) ||
      ss.species.englishName.toLowerCase().includes(query) ||
      ss.species.code?.toLowerCase().includes(query)
    );
  });

  // Handle add species
  const handleAdd = async () => {
    if (!selectedSpeciesId) return;

    setAdding(true);
    try {
      await addSpeciesToSite(site.id, {
        speciesId: Number(selectedSpeciesId),
        plantedCount: plantedCount ? Number(plantedCount) : undefined,
        plantedYear: plantedYear ? Number(plantedYear) : undefined,
      });
      showToast('Species added successfully', 'success');
      setShowAddForm(false);
      setSelectedSpeciesId('');
      setPlantedCount('');
      setPlantedYear('');
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to add species', 'error');
    } finally {
      setAdding(false);
    }
  };

  // Handle update
  const handleUpdate = async (speciesId: number) => {
    try {
      await updateSiteSpecies(site.id, speciesId, {
        plantedCount: editCount ? Number(editCount) : undefined,
        plantedYear: editYear ? Number(editYear) : undefined,
      });
      showToast('Species updated successfully', 'success');
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to update species', 'error');
    }
  };

  // Handle remove
  const handleRemove = async (speciesId: number) => {
    if (!confirm('Are you sure you want to remove this species from the site?')) return;

    try {
      await removeSpeciesFromSite(site.id, speciesId);
      showToast('Species removed successfully', 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Failed to remove species', 'error');
    }
  };

  // Start editing
  const startEdit = (ss: SiteSpecies) => {
    setEditingId(ss.speciesId);
    setEditCount(ss.plantedCount || '');
    setEditYear(ss.plantedYear || '');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Species at {site.name}
              </h2>
              <p className="text-sm text-gray-500">
                Manage which species are planted at this site
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{stats.totalSpecies}</div>
                <div className="text-xs text-gray-500">Species</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{stats.totalPlanted.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total Planted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {stats.plantedYears.length > 0
                    ? `${Math.min(...stats.plantedYears)}-${Math.max(...stats.plantedYears)}`
                    : '-'}
                </div>
                <div className="text-xs text-gray-500">Years Active</div>
              </div>
            </div>
          )}

          {/* Search and Add */}
          <div className="flex items-center gap-4 p-4 border-b">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search species..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              disabled={availableSpecies.length === 0}
              className="px-4 py-2 bg-green-900 text-white text-sm rounded-lg hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Species
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="p-4 bg-green-50 border-b space-y-4">
              <h3 className="font-medium text-gray-900">Add Species</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
                  <select
                    value={selectedSpeciesId}
                    onChange={(e) => setSelectedSpeciesId(e.target.value ? Number(e.target.value) : '')}
                    className={inputClassName}
                  >
                    <option value="">Select species...</option>
                    {availableSpecies.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.scientificName} ({s.localName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planted Count</label>
                  <input
                    type="number"
                    value={plantedCount}
                    onChange={(e) => setPlantedCount(e.target.value ? Number(e.target.value) : '')}
                    className={inputClassName}
                    placeholder="e.g., 100"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Planted Year</label>
                  <input
                    type="number"
                    value={plantedYear}
                    onChange={(e) => setPlantedYear(e.target.value ? Number(e.target.value) : '')}
                    className={inputClassName}
                    placeholder="e.g., 2023"
                    min={1900}
                    max={2100}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!selectedSpeciesId || adding}
                  className="px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 text-sm disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Species'}
                </button>
              </div>
            </div>
          )}

          {/* Species List */}
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-green-900 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sm text-gray-500">Loading species...</p>
              </div>
            ) : filteredSiteSpecies.length === 0 ? (
              <div className="text-center py-12">
                <Trees className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {siteSpecies.length === 0
                    ? 'No species added yet. Click "Add Species" to get started.'
                    : 'No species match your search.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSiteSpecies.map((ss) => (
                  <div
                    key={ss.speciesId}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    {/* Image */}
                    {ss.species.image1Url ? (
                      <img
                        src={ss.species.image1Url}
                        alt={ss.species.scientificName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-green-600" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 italic">
                        {ss.species.scientificName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ss.species.localName} • {ss.species.englishName}
                        {ss.species.code && (
                          <span className="ml-2 px-1.5 py-0.5 bg-gray-200 rounded text-xs">
                            {ss.species.code}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit or display values */}
                    {editingId === ss.speciesId ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editCount}
                          onChange={(e) => setEditCount(e.target.value ? Number(e.target.value) : '')}
                          className="w-24 px-2 py-1 text-sm border rounded"
                          placeholder="Count"
                          min={0}
                        />
                        <input
                          type="number"
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value ? Number(e.target.value) : '')}
                          className="w-20 px-2 py-1 text-sm border rounded"
                          placeholder="Year"
                          min={1900}
                          max={2100}
                        />
                        <button
                          onClick={() => handleUpdate(ss.speciesId)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-gray-600 text-sm hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          {ss.plantedCount !== null && ss.plantedCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Hash className="w-4 h-4" />
                              {ss.plantedCount.toLocaleString()}
                            </span>
                          )}
                          {ss.plantedYear && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {ss.plantedYear}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEdit(ss)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemove(ss.speciesId)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
