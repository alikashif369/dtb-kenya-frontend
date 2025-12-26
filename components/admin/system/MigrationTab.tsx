"use client";

import { useState, useRef } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle, Loader2, FileWarning, Database } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import {
  parseLegacySpecies,
  validateLegacySpecies,
  importSpecies,
  parseLegacyCalculations,
  validateLegacyCalculations,
  getLegacyDataSummary,
  importCalculations,
  MigrationResult,
} from '@/lib/admin/migration';
import { useToast } from '@/components/ToastContext';

type MigrationStep = 'upload' | 'validate' | 'preview' | 'importing' | 'complete';

interface FileData {
  name: string;
  content: string;
  type: 'species' | 'calculations';
}

export default function MigrationTab() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [step, setStep] = useState<MigrationStep>('upload');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, name: '' });
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [unmatchedLocations, setUnmatchedLocations] = useState<string[]>([]);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showToast('Please select a JSON file', 'error');
      return;
    }

    try {
      const content = await file.text();

      // Detect file type
      let type: 'species' | 'calculations' = 'species';
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check for species-specific fields
          if ('Name' in parsed[0] && 'localname' in parsed[0]) {
            type = 'species';
          }
          // Check for calculations-specific fields
          else if ('Location' in parsed[0]) {
            type = 'calculations';
          }
        }
      } catch {
        showToast('Invalid JSON file', 'error');
        return;
      }

      setFileData({ name: file.name, content, type });
      setStep('validate');
      setValidationErrors([]);
      setResult(null);

      // Validate the data
      validateData(content, type);
    } catch (error: any) {
      showToast(`Failed to read file: ${error.message}`, 'error');
    }
  };

  // Validate the data
  const validateData = (content: string, type: 'species' | 'calculations') => {
    try {
      let errors: string[] = [];
      let preview: any = null;

      if (type === 'species') {
        const data = parseLegacySpecies(content);
        errors = validateLegacySpecies(data);
        preview = {
          type: 'species',
          count: data.length,
          sample: data.slice(0, 3).map(d => ({
            name: d.Name,
            code: d.check,
            local: d.localname,
            english: d.englishname,
          })),
        };
      } else {
        const data = parseLegacyCalculations(content);
        errors = validateLegacyCalculations(data);
        const summary = getLegacyDataSummary(data);
        preview = {
          type: 'calculations',
          ...summary,
          sample: data.slice(0, 3).map(d => ({
            location: d.Location,
            years: Object.keys(d).filter(k => k.match(/\d{4}$/)).map(k => k.match(/(\d{4})$/)?.[1]).filter((v, i, a) => a.indexOf(v) === i),
          })),
        };
      }

      setValidationErrors(errors);
      setPreviewData(preview);
      setStep(errors.length > 0 ? 'validate' : 'preview');
    } catch (error: any) {
      setValidationErrors([error.message]);
      setStep('validate');
    }
  };

  // Start the import
  const handleImport = async () => {
    if (!fileData) return;

    setStep('importing');
    setProgress({ current: 0, total: 0, name: '' });

    try {
      let importResult: MigrationResult;

      if (fileData.type === 'species') {
        const data = parseLegacySpecies(fileData.content);
        importResult = await importSpecies(data, (current, total, name) => {
          setProgress({ current, total, name });
        });
      } else {
        const data = parseLegacyCalculations(fileData.content);
        const calcResult = await importCalculations(data, (current, total, name) => {
          setProgress({ current, total, name });
        });
        importResult = calcResult;
        setUnmatchedLocations(calcResult.unmatchedLocations);
      }

      setResult(importResult);
      setStep('complete');

      if (importResult.success) {
        showToast(`Successfully imported ${importResult.created} records`, 'success');
      } else {
        showToast(`Import completed with ${importResult.errors.length} errors`, 'error');
      }
    } catch (error: any) {
      showToast(`Import failed: ${error.message}`, 'error');
      setStep('preview');
    }
  };

  // Reset
  const handleReset = () => {
    setFileData(null);
    setStep('upload');
    setValidationErrors([]);
    setPreviewData(null);
    setResult(null);
    setUnmatchedLocations([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Data Migration"
        description="Import legacy data from JSON files into the new system"
      />

      {/* Step indicator */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {[
            { key: 'upload', label: 'Upload File' },
            { key: 'validate', label: 'Validate' },
            { key: 'preview', label: 'Preview' },
            { key: 'importing', label: 'Import' },
            { key: 'complete', label: 'Complete' },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s.key
                    ? 'bg-green-900 text-white'
                    : ['validate', 'preview', 'importing', 'complete'].indexOf(step) > ['upload', 'validate', 'preview', 'importing', 'complete'].indexOf(s.key)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
              <span className="ml-2 text-sm text-gray-600 hidden sm:inline">{s.label}</span>
              {i < 4 && <div className="w-8 sm:w-16 h-0.5 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Upload step */}
      {step === 'upload' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileJson className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a JSON file to import</h3>
            <p className="text-sm text-gray-500 mb-4">
              Supported files: species.json, CALCULATIONS.json
            </p>
            <button className="px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 transition inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">species.json</h4>
              <p className="text-sm text-gray-600">
                Import species catalog with scientific names, local names, descriptions, and images.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">CALCULATIONS.json</h4>
              <p className="text-sm text-gray-600">
                Import yearly land cover metrics (tree canopy, green area, barren land, etc.) for sites.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Validation step */}
      {step === 'validate' && validationErrors.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <FileWarning className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Validation Issues Found</h3>
              <p className="text-sm text-gray-500">
                The following issues were found in {fileData?.name}. You can proceed with import, but some records may be skipped.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-64 overflow-auto">
            <ul className="space-y-1 text-sm text-yellow-800">
              {validationErrors.slice(0, 20).map((error, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </li>
              ))}
              {validationErrors.length > 20 && (
                <li className="text-yellow-600">...and {validationErrors.length - 20} more issues</li>
              )}
            </ul>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Choose Different File
            </button>
            <button
              onClick={() => setStep('preview')}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}

      {/* Preview step */}
      {step === 'preview' && previewData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <Database className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">Ready to Import</h3>
              <p className="text-sm text-gray-500">
                Review the data preview below before importing.
              </p>
            </div>
          </div>

          {previewData.type === 'species' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{previewData.count}</span> species will be imported
                </p>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Scientific Name</th>
                      <th className="px-4 py-2 text-left">Code</th>
                      <th className="px-4 py-2 text-left">Local Name</th>
                      <th className="px-4 py-2 text-left">English Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.sample.map((item: any, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2 italic">{item.name}</td>
                        <td className="px-4 py-2">{item.code}</td>
                        <td className="px-4 py-2">{item.local}</td>
                        <td className="px-4 py-2">{item.english}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {previewData.type === 'calculations' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{previewData.totalLocations}</p>
                  <p className="text-sm text-gray-500">Locations</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{previewData.yearsAvailable.length}</p>
                  <p className="text-sm text-gray-500">Years</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-sm font-medium text-gray-900">Years: {previewData.yearsAvailable.join(', ')}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Location</th>
                      <th className="px-4 py-2 text-left">Data Years</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.sample.map((item: any, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{item.location}</td>
                        <td className="px-4 py-2">{item.years.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 transition inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Start Import
            </button>
          </div>
        </div>
      )}

      {/* Importing step */}
      {step === 'importing' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Loader2 className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Importing Data...</h3>
          <p className="text-sm text-gray-500 mb-4">{progress.name}</p>
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {progress.current} / {progress.total}
          </p>
        </div>
      )}

      {/* Complete step */}
      {step === 'complete' && result && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            {result.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            )}
            <div>
              <h3 className="font-medium text-gray-900">
                {result.success ? 'Import Completed Successfully' : 'Import Completed with Issues'}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-700">{result.created}</p>
              <p className="text-sm text-green-600">Created</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-700">{result.updated}</p>
              <p className="text-sm text-blue-600">Updated</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-700">{result.skipped}</p>
              <p className="text-sm text-gray-600">Skipped</p>
            </div>
          </div>

          {unmatchedLocations.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Unmatched Locations</h4>
              <p className="text-sm text-yellow-700 mb-2">
                The following locations could not be matched to existing sites. Create these sites first and re-import:
              </p>
              <ul className="text-sm text-yellow-600 list-disc list-inside">
                {unmatchedLocations.map((loc, i) => (
                  <li key={i}>{loc}</li>
                ))}
              </ul>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-h-48 overflow-auto">
              <h4 className="font-medium text-red-800 mb-2">Errors</h4>
              <ul className="space-y-1 text-sm text-red-600">
                {result.errors.slice(0, 10).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
                {result.errors.length > 10 && (
                  <li>...and {result.errors.length - 10} more errors</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 transition"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
