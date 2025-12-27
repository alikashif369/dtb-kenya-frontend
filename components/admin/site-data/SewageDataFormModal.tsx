"use client";

import { useState, useEffect } from 'react';
import { X, Droplets } from 'lucide-react';
import { inputClassName } from '@/components/admin/shared/FormModal';
import {
  SewageData,
  CreateSewageData,
  createSewageData,
  updateSewageData,
} from '@/lib/admin/siteDataApi';
import { Site } from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface SewageDataFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingData: SewageData | null;
  sites: Site[];
}

export default function SewageDataFormModal({
  open,
  onClose,
  onSuccess,
  editingData,
  sites,
}: SewageDataFormModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [siteId, setSiteId] = useState<number | ''>('');
  const [year, setYear] = useState<number | ''>(new Date().getFullYear());
  const [recoveryRatio, setRecoveryRatio] = useState<number | ''>('');
  const [methaneSaved, setMethaneSaved] = useState<number | ''>('');

  // Populate form when editing
  useEffect(() => {
    if (editingData) {
      setSiteId(editingData.siteId);
      setYear(editingData.year);
      setRecoveryRatio(editingData.recoveryRatio);
      setMethaneSaved(editingData.methaneSaved);
    } else {
      // Reset form
      setSiteId('');
      setYear(new Date().getFullYear());
      setRecoveryRatio('');
      setMethaneSaved('');
    }
  }, [editingData, open]);

  // Get efficiency level
  const getEfficiencyLevel = () => {
    if (recoveryRatio === '' || recoveryRatio === null || recoveryRatio === undefined) return null;
    const ratio = Number(recoveryRatio);
    if (ratio >= 80) return { level: 'Excellent', color: 'text-green-600 bg-green-50' };
    if (ratio >= 60) return { level: 'Good', color: 'text-blue-600 bg-blue-50' };
    if (ratio >= 40) return { level: 'Moderate', color: 'text-amber-600 bg-amber-50' };
    return { level: 'Low', color: 'text-gray-600 bg-gray-50' };
  };

  const efficiency = getEfficiencyLevel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!siteId || !year || recoveryRatio === '' || methaneSaved === '') {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (Number(recoveryRatio) < 0 || Number(recoveryRatio) > 100) {
      showToast('Recovery ratio must be between 0 and 100', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateSewageData = {
        siteId: Number(siteId),
        year: Number(year),
        recoveryRatio: Number(recoveryRatio),
        methaneSaved: Number(methaneSaved),
      };

      if (editingData) {
        await updateSewageData(editingData.id, payload);
        showToast('Sewage data updated successfully', 'success');
      } else {
        await createSewageData(payload);
        showToast('Sewage data created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save sewage data', 'error');
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingData ? 'Edit Sewage Data' : 'Add Sewage Data'}
                </h2>
                <p className="text-sm text-gray-500">
                  Enter sewage treatment recovery information
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

              {/* Recovery Ratio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recovery Ratio (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={recoveryRatio}
                    onChange={(e) => setRecoveryRatio(e.target.value ? Number(e.target.value) : '')}
                    className={inputClassName}
                    placeholder="e.g., 75"
                    min={0}
                    max={100}
                    step={0.1}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Percentage of sewage water recovered through treatment (0-100%)
                </p>
              </div>

              {/* Methane Saved */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Methane Saved (m³) *
                </label>
                <input
                  type="number"
                  value={methaneSaved}
                  onChange={(e) => setMethaneSaved(e.target.value ? Number(e.target.value) : '')}
                  className={inputClassName}
                  placeholder="e.g., 5000"
                  min={0}
                  step={0.01}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Volume of methane captured/saved from sewage treatment
                </p>
              </div>

              {/* Efficiency Display */}
              {efficiency && (
                <div className={`p-4 rounded-lg border ${efficiency.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Efficiency Level</span>
                    <span className={`text-lg font-bold ${efficiency.color.split(' ')[0]}`}>
                      {efficiency.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on recovery ratio:
                    {Number(recoveryRatio) >= 80 && ' Excellent (≥80%)'}
                    {Number(recoveryRatio) >= 60 && Number(recoveryRatio) < 80 && ' Good (60-79%)'}
                    {Number(recoveryRatio) >= 40 && Number(recoveryRatio) < 60 && ' Moderate (40-59%)'}
                    {Number(recoveryRatio) < 40 && ' Low (<40%)'}
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
