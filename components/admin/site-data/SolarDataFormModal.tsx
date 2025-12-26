"use client";

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sun, Zap } from 'lucide-react';
import { inputClassName } from '@/components/admin/shared/FormModal';
import {
  SolarData,
  CreateSolarData,
  createSolarData,
  updateSolarData,
} from '@/lib/admin/siteDataApi';
import { Site } from '@/lib/admin/hierarchyApi';
import { useToast } from '@/components/ToastContext';

interface SolarDataFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingData: SolarData | null;
  sites: Site[];
}

interface QuarterlyEntry {
  year: number;
  q1: number | '';
  q2: number | '';
  q3: number | '';
  q4: number | '';
}

export default function SolarDataFormModal({
  open,
  onClose,
  onSuccess,
  editingData,
  sites,
}: SolarDataFormModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form state
  const [siteId, setSiteId] = useState<number | ''>('');
  const [installationYear, setInstallationYear] = useState<number | ''>(new Date().getFullYear());
  const [capacityKwh, setCapacityKwh] = useState<number | ''>('');
  const [quarterlyEntries, setQuarterlyEntries] = useState<QuarterlyEntry[]>([]);

  // Parse quarterly production from editing data
  useEffect(() => {
    if (editingData) {
      setSiteId(editingData.siteId);
      setInstallationYear(editingData.installationYear);
      setCapacityKwh(editingData.capacityKwh);

      // Parse quarterly production into entries
      const entries: QuarterlyEntry[] = [];
      const yearMap = new Map<number, QuarterlyEntry>();

      Object.entries(editingData.quarterlyProduction).forEach(([key, value]) => {
        const match = key.match(/^Q(\d)_(\d{4})$/);
        if (match) {
          const quarter = parseInt(match[1]);
          const year = parseInt(match[2]);

          if (!yearMap.has(year)) {
            yearMap.set(year, { year, q1: '', q2: '', q3: '', q4: '' });
          }

          const entry = yearMap.get(year)!;
          if (quarter === 1) entry.q1 = value;
          else if (quarter === 2) entry.q2 = value;
          else if (quarter === 3) entry.q3 = value;
          else if (quarter === 4) entry.q4 = value;
        }
      });

      // Sort by year
      const sortedEntries = Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
      setQuarterlyEntries(sortedEntries.length > 0 ? sortedEntries : [createDefaultEntry()]);
    } else {
      // Reset form
      setSiteId('');
      setInstallationYear(new Date().getFullYear());
      setCapacityKwh('');
      setQuarterlyEntries([createDefaultEntry()]);
    }
  }, [editingData, open]);

  const createDefaultEntry = (): QuarterlyEntry => ({
    year: new Date().getFullYear(),
    q1: '',
    q2: '',
    q3: '',
    q4: '',
  });

  // Add a new year entry
  const addYearEntry = () => {
    const lastYear = quarterlyEntries.length > 0
      ? Math.max(...quarterlyEntries.map(e => e.year))
      : new Date().getFullYear() - 1;
    setQuarterlyEntries([...quarterlyEntries, { year: lastYear + 1, q1: '', q2: '', q3: '', q4: '' }]);
  };

  // Remove a year entry
  const removeYearEntry = (index: number) => {
    setQuarterlyEntries(quarterlyEntries.filter((_, i) => i !== index));
  };

  // Update entry
  const updateEntry = (index: number, field: keyof QuarterlyEntry, value: number | '') => {
    const updated = [...quarterlyEntries];
    updated[index] = { ...updated[index], [field]: value };
    setQuarterlyEntries(updated);
  };

  // Calculate total for a year
  const calculateYearTotal = (entry: QuarterlyEntry): number => {
    return (
      (typeof entry.q1 === 'number' ? entry.q1 : 0) +
      (typeof entry.q2 === 'number' ? entry.q2 : 0) +
      (typeof entry.q3 === 'number' ? entry.q3 : 0) +
      (typeof entry.q4 === 'number' ? entry.q4 : 0)
    );
  };

  // Calculate grand total
  const grandTotal = quarterlyEntries.reduce((sum, entry) => sum + calculateYearTotal(entry), 0);

  // Convert entries to quarterlyProduction format
  const buildQuarterlyProduction = (): Record<string, number> => {
    const production: Record<string, number> = {};
    quarterlyEntries.forEach((entry) => {
      if (typeof entry.q1 === 'number' && entry.q1 > 0) {
        production[`Q1_${entry.year}`] = entry.q1;
      }
      if (typeof entry.q2 === 'number' && entry.q2 > 0) {
        production[`Q2_${entry.year}`] = entry.q2;
      }
      if (typeof entry.q3 === 'number' && entry.q3 > 0) {
        production[`Q3_${entry.year}`] = entry.q3;
      }
      if (typeof entry.q4 === 'number' && entry.q4 > 0) {
        production[`Q4_${entry.year}`] = entry.q4;
      }
    });
    return production;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!siteId || !installationYear || !capacityKwh) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const quarterlyProduction = buildQuarterlyProduction();

      if (editingData) {
        await updateSolarData(editingData.id, {
          installationYear: Number(installationYear),
          capacityKwh: Number(capacityKwh),
          quarterlyProduction,
        });
        showToast('Solar data updated successfully', 'success');
      } else {
        await createSolarData({
          siteId: Number(siteId),
          installationYear: Number(installationYear),
          capacityKwh: Number(capacityKwh),
          quarterlyProduction,
        });
        showToast('Solar data created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save solar data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  // Generate year options (from 1990 to 2100)
  const yearOptions = Array.from({ length: 111 }, (_, i) => 1990 + i);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Sun className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingData ? 'Edit Solar Data' : 'Add Solar Data'}
                </h2>
                <p className="text-sm text-gray-500">
                  Enter installation details and quarterly production
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
          <form onSubmit={handleSubmit} className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    Installation Year *
                  </label>
                  <select
                    value={installationYear}
                    onChange={(e) => setInstallationYear(e.target.value ? Number(e.target.value) : '')}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select year...</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (kWh) *
                  </label>
                  <input
                    type="number"
                    value={capacityKwh}
                    onChange={(e) => setCapacityKwh(e.target.value ? Number(e.target.value) : '')}
                    className={inputClassName}
                    placeholder="e.g., 500"
                    min={0}
                    step={0.01}
                    required
                  />
                </div>
              </div>

              {/* Quarterly Production */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Quarterly Production (kWh)</h3>
                    <p className="text-xs text-gray-500">Enter energy production for each quarter</p>
                  </div>
                  <button
                    type="button"
                    onClick={addYearEntry}
                    className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 inline-flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Year
                  </button>
                </div>

                <div className="space-y-3">
                  {quarterlyEntries.map((entry, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <select
                          value={entry.year}
                          onChange={(e) => updateEntry(index, 'year', Number(e.target.value))}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium"
                        >
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            Total: <span className="font-medium text-gray-900">{calculateYearTotal(entry).toLocaleString()} kWh</span>
                          </span>
                          {quarterlyEntries.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeYearEntry(index)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Q1 (Jan-Mar)</label>
                          <input
                            type="number"
                            value={entry.q1}
                            onChange={(e) => updateEntry(index, 'q1', e.target.value ? Number(e.target.value) : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            placeholder="0"
                            min={0}
                            step={0.01}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Q2 (Apr-Jun)</label>
                          <input
                            type="number"
                            value={entry.q2}
                            onChange={(e) => updateEntry(index, 'q2', e.target.value ? Number(e.target.value) : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            placeholder="0"
                            min={0}
                            step={0.01}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Q3 (Jul-Sep)</label>
                          <input
                            type="number"
                            value={entry.q3}
                            onChange={(e) => updateEntry(index, 'q3', e.target.value ? Number(e.target.value) : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            placeholder="0"
                            min={0}
                            step={0.01}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Q4 (Oct-Dec)</label>
                          <input
                            type="number"
                            value={entry.q4}
                            onChange={(e) => updateEntry(index, 'q4', e.target.value ? Number(e.target.value) : '')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            placeholder="0"
                            min={0}
                            step={0.01}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Grand Total */}
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-gray-900">Total Production</span>
                  </div>
                  <span className="text-xl font-bold text-yellow-700">
                    {grandTotal.toLocaleString()} kWh
                  </span>
                </div>
              </div>
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
