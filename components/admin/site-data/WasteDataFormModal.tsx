"use client";

import { useState, useEffect } from 'react';
import { X, Recycle } from 'lucide-react';
import { inputClassName } from '@/components/admin/shared/FormModal';
import {
  WasteData,
  CreateWasteData,
  createWasteData,
  updateWasteData,
} from '@/lib/admin/siteDataApi';
import { Site } from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface WasteDataFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingData: WasteData | null;
  sites: Site[];
}

export default function WasteDataFormModal({
  open,
  onClose,
  onSuccess,
  editingData,
  sites,
}: WasteDataFormModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [siteId, setSiteId] = useState<number | ''>('');
  const [year, setYear] = useState<number | ''>(new Date().getFullYear());
  const [organicWaste, setOrganicWaste] = useState<number | ''>('');
  const [compostReceived, setCompostReceived] = useState<number | ''>('');
  const [methaneRecovered, setMethaneRecovered] = useState<number | ''>('');

  // Populate form when editing
  useEffect(() => {
    if (editingData) {
      setSiteId(editingData.siteId);
      setYear(editingData.year);
      setOrganicWaste(editingData.organicWaste);
      setCompostReceived(editingData.compostReceived);
      setMethaneRecovered(editingData.methaneRecovered || '');
    } else {
      // Reset form
      setSiteId('');
      setYear(new Date().getFullYear());
      setOrganicWaste('');
      setCompostReceived('');
      setMethaneRecovered('');
    }
  }, [editingData, open]);

  // Calculate conversion rate
  const conversionRate = organicWaste && organicWaste > 0
    ? ((Number(compostReceived) / Number(organicWaste)) * 100).toFixed(1)
    : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!siteId || !year || organicWaste === '' || compostReceived === '') {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateWasteData = {
        siteId: Number(siteId),
        year: Number(year),
        organicWaste: Number(organicWaste),
        compostReceived: Number(compostReceived),
        methaneRecovered: methaneRecovered ? Number(methaneRecovered) : undefined,
      };

      if (editingData) {
        await updateWasteData(editingData.id, payload);
        showToast('Waste data updated successfully', 'success');
      } else {
        await createWasteData(payload);
        showToast('Waste data created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save waste data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // Generate year options (from 2019 to 2100)
  const yearOptions = [];
  for (let y = 2019; y <= 2100; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Recycle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingData ? 'Edit Waste Data' : 'Add Waste Data'}
                </h2>
                <p className="text-sm text-gray-500">
                  Enter organic waste and composting information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Site and Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site *
                  </label>
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value ? Number(e.target.value) : '')}
                    className={inputClassName}
                    disabled={!!editingData}
                    required
                  >
                    <option value="">Select site...</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select year...</option>
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Organic Waste */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organic Waste (kg) *
                </label>
                <input
                  type="number"
                  value={organicWaste}
                  onChange={(e) => setOrganicWaste(e.target.value ? Number(e.target.value) : '')}
                  className={inputClassName}
                  placeholder="e.g., 10000"
                  min={0}
                  step={0.01}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total organic waste collected during the year
                </p>
              </div>

              {/* Compost Received */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compost Received (kg) *
                </label>
                <input
                  type="number"
                  value={compostReceived}
                  onChange={(e) => setCompostReceived(e.target.value ? Number(e.target.value) : '')}
                  className={inputClassName}
                  placeholder="e.g., 5000"
                  min={0}
                  step={0.01}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Compost produced from organic waste
                </p>
              </div>

              {/* Methane Recovered */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Methane Recovered (m³)
                </label>
                <input
                  type="number"
                  value={methaneRecovered}
                  onChange={(e) => setMethaneRecovered(e.target.value ? Number(e.target.value) : '')}
                  className={inputClassName}
                  placeholder="e.g., 1000"
                  min={0}
                  step={0.01}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Biogas/methane recovered from composting process
                </p>
              </div>

              {/* Conversion Rate Display */}
              {organicWaste && Number(organicWaste) > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                    <span className={`text-lg font-bold ${
                      Number(conversionRate) >= 50 ? 'text-green-700' :
                      Number(conversionRate) >= 25 ? 'text-amber-700' : 'text-gray-700'
                    }`}>
                      {conversionRate}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of organic waste converted to compost
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingData ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
