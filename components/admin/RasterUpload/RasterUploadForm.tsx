"use client";

import { useState, useRef } from 'react';
import { RefreshCw, Upload, X } from 'lucide-react';
import { RasterHierarchySelector } from './RasterHierarchySelector';
import { useHierarchy } from '@/components/vector-draw/useHierarchy';
import { uploadRaster, refreshRasterMetadata } from '@/lib/admin/rasterApi';
import { YEARS, RASTER_FILE_CONSTRAINTS } from '@/lib/admin/constants';
import { useToast } from '@/components/ToastContext';

interface RasterUploadFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RasterUploadForm({ open, onClose, onSuccess }: RasterUploadFormProps) {
  // Hierarchy state
  const { orgs, regionsByOrg, categoriesByRegion, subCatsByCategory, sitesByCategory, sitesBySubCategory, loading: hierarchyLoading } = useHierarchy();
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  // Form state
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isClassified, setIsClassified] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  if (!open) return null;

  const handleHierarchyChange = (level: "org" | "region" | "category" | "subCategory" | "site", id: number | null) => {
    if (level === "org") setSelectedOrgId(id);
    else if (level === "region") setSelectedRegionId(id);
    else if (level === "category") setSelectedCategoryId(id);
    else if (level === "subCategory") setSelectedSubCategoryId(id);
    else if (level === "site") setSelectedSiteId(id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file extension
    const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
    const validExtensions = RASTER_FILE_CONSTRAINTS.acceptedExtensions.map(ext => ext.replace('.', ''));
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      setError(`Invalid file format. Please upload a GeoTIFF file (${RASTER_FILE_CONSTRAINTS.acceptedExtensions.join(', ')})`);
      setFile(null);
      return;
    }

    // Validate file size
    if (selectedFile.size > RASTER_FILE_CONSTRAINTS.maxSizeBytes) {
      setError(`File size exceeds ${RASTER_FILE_CONSTRAINTS.maxSizeMB}MB limit. Please select a smaller file.`);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedSiteId) {
      setError('Please select a site');
      return;
    }

    if (!file) {
      setError('Please select a GeoTIFF file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (actual upload progress tracking would require XMLHttpRequest)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 70));
      }, 200);

      const uploadedRaster = await uploadRaster(file, selectedSiteId, year, isClassified);

      clearInterval(progressInterval);
      setUploadProgress(80);

      // Auto-refresh metadata from TiTiler to get accurate bbox and center
      try {
        await refreshRasterMetadata(uploadedRaster.id);
        setUploadProgress(100);
      } catch (metaError) {
        console.warn('Failed to auto-refresh metadata:', metaError);
        // Don't fail the upload if metadata refresh fails
        setUploadProgress(100);
      }

      showToast('Raster uploaded successfully!', 'success');
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload raster');
      showToast(err.message || 'Failed to upload raster', 'error');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Reset form
    setSelectedOrgId(null);
    setSelectedRegionId(null);
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedSiteId(null);
    setYear(new Date().getFullYear());
    setIsClassified(false);
    setFile(null);
    setError(null);
    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const fileSizeMB = file ? (file.size / (1024 * 1024)).toFixed(2) : '0';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Upload Raster</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Hierarchy Selector */}
          <div>
            <RasterHierarchySelector
              orgs={orgs}
              regionsByOrg={regionsByOrg}
              categoriesByRegion={categoriesByRegion}
              subCatsByCategory={subCatsByCategory}
              sitesByCategory={sitesByCategory}
              sitesBySubCategory={sitesBySubCategory}
              selectedOrgId={selectedOrgId}
              selectedRegionId={selectedRegionId}
              selectedCategoryId={selectedCategoryId}
              selectedSubCategoryId={selectedSubCategoryId}
              selectedSiteId={selectedSiteId}
              onChange={handleHierarchyChange}
              loading={hierarchyLoading}
            />
          </div>

          {/* Year Selection */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={uploading}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Classification Type */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Raster Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rasterType"
                  value="base"
                  checked={!isClassified}
                  onChange={() => setIsClassified(false)}
                  disabled={uploading}
                  className="w-4 h-4 text-green-900 focus:ring-green-900"
                />
                <span className="text-sm text-gray-700">Base Raster</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rasterType"
                  value="classified"
                  checked={isClassified}
                  onChange={() => setIsClassified(true)}
                  disabled={uploading}
                  className="w-4 h-4 text-green-900 focus:ring-green-900"
                />
                <span className="text-sm text-gray-700">Classified Raster</span>
              </label>
            </div>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">GeoTIFF File</label>
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
                ${file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={RASTER_FILE_CONSTRAINTS.acceptedExtensions.join(',')}
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
              <Upload className={`w-8 h-8 mx-auto mb-2 ${file ? 'text-green-600' : 'text-gray-400'}`} />
              {file ? (
                <div>
                  <p className="text-sm font-medium text-green-900">{file.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{fileSizeMB} MB</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">Click to select GeoTIFF file</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max size: {RASTER_FILE_CONSTRAINTS.maxSizeMB}MB • Formats: .tif, .tiff, .geotiff
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedSiteId || !file}
              className="rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition disabled:opacity-50 inline-flex items-center gap-2"
            >
              {uploading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
