"use client";

import { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
} from '@/components/admin/shared/FormModal';
import {
  PhotoCategory,
  UploadPhotoData,
  uploadPhoto,
} from '@/lib/admin/photosApi';
import { Site } from '@/lib/admin/hierarchyApi';
import { Species } from '@/lib/admin/speciesApi';
import { useToast } from '@/components/ToastContext';

interface PhotoUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sites: Site[];
  speciesList: Species[];
}

export default function PhotoUploadModal({
  open,
  onClose,
  onSuccess,
  sites,
  speciesList,
}: PhotoUploadModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<UploadPhotoData, 'file'>>({
    category: 'SITE',
    siteId: undefined,
    speciesId: undefined,
    year: new Date().getFullYear(),
    latitude: undefined,
    longitude: undefined,
    caption: '',
    description: '',
    tags: [],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  // Reset form when modal opens/closes
  const resetForm = () => {
    setFormData({
      category: 'SITE',
      siteId: undefined,
      speciesId: undefined,
      year: new Date().getFullYear(),
      latitude: undefined,
      longitude: undefined,
      caption: '',
      description: '',
      tags: [],
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setTagsInput('');
    setErrors({});
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (JPEG, PNG, or WebP)', 'error');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast('File size exceeds 10MB limit', 'error');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, file: '' }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedFile) {
      newErrors.file = 'Please select a photo to upload';
    }

    if ((formData.category === 'EVENT' || formData.category === 'SITE' || formData.category === 'COMMUNITY') && !formData.siteId) {
      newErrors.siteId = 'Site is required for Event/Site/Community photos';
    }

    if (formData.category === 'SPECIES' && !formData.speciesId) {
      newErrors.speciesId = 'Species is required for Species photos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate() || !selectedFile) return;

    setLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await uploadPhoto({
        ...formData,
        tags,
        file: selectedFile,
      });

      showToast('Photo uploaded successfully', 'success');
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to upload photo', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleCategoryChange = (category: PhotoCategory) => {
    setFormData((prev) => ({
      ...prev,
      category,
      siteId: category === 'SPECIES' ? undefined : prev.siteId,
      speciesId: category === 'SPECIES' ? prev.speciesId : undefined,
    }));
    setErrors({});
  };

  return (
    <FormModal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Upload Photo"
      description="Upload a new photo with metadata and categorization"
      size="xl"
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={() => {
            resetForm();
            onClose();
          }}
          onSubmit={handleSubmit}
          submitLabel="Upload Photo"
          loading={loading}
        />
      }
    >
      <div className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Photo <span className="text-red-500">*</span>
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-green-500 bg-green-50'
                : errors.file
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {previewUrl ? (
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 rounded-lg mx-auto"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="mt-2 text-sm text-gray-600">{selectedFile?.name}</p>
              </div>
            ) : (
              <>
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop a photo here, or click to select
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-green-900 text-white text-sm rounded-lg hover:bg-green-800 transition inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Select Photo
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  Supports JPEG, PNG, WebP (max 10MB)
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>
          {errors.file && <p className="mt-1 text-sm text-red-500">{errors.file}</p>}
        </div>

        {/* Category Selection */}
        <FormField label="Category" htmlFor="photo-category" required>
          <div className="flex gap-2">
            {(['EVENT', 'SITE', 'SPECIES', 'COMMUNITY'] as PhotoCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition ${
                  formData.category === cat
                    ? 'bg-green-900 text-white border-green-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat === 'EVENT' ? 'Event' : cat === 'SITE' ? 'Site' : cat === 'SPECIES' ? 'Species' : 'Community'}
              </button>
            ))}
          </div>
        </FormField>

        {/* Site/Species Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(formData.category === 'EVENT' || formData.category === 'SITE' || formData.category === 'COMMUNITY') && (
            <FormField label="Site" htmlFor="photo-site" required error={errors.siteId}>
              <select
                id="photo-site"
                value={formData.siteId || ''}
                onChange={(e) => handleChange('siteId', e.target.value ? parseInt(e.target.value) : undefined)}
                className={inputClassName}
                disabled={loading}
              >
                <option value="">Select a site...</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {formData.category === 'SPECIES' && (
            <FormField label="Species" htmlFor="photo-species" required error={errors.speciesId}>
              <select
                id="photo-species"
                value={formData.speciesId || ''}
                onChange={(e) => handleChange('speciesId', e.target.value ? parseInt(e.target.value) : undefined)}
                className={inputClassName}
                disabled={loading}
              >
                <option value="">Select a species...</option>
                {speciesList.map((species) => (
                  <option key={species.id} value={species.id}>
                    {species.scientificName} ({species.localName})
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {(formData.category === 'EVENT' || formData.category === 'SITE' || formData.category === 'COMMUNITY') && (
            <FormField label="Year" htmlFor="photo-year">
              <input
                id="photo-year"
                type="number"
                value={formData.year || ''}
                onChange={(e) => handleChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                className={inputClassName}
                placeholder="e.g., 2024"
                min={2019}
                max={2100}
                disabled={loading}
              />
            </FormField>
          )}
        </div>

        {/* Caption & Description */}
        <FormField label="Caption" htmlFor="photo-caption">
          <input
            id="photo-caption"
            type="text"
            value={formData.caption || ''}
            onChange={(e) => handleChange('caption', e.target.value)}
            className={inputClassName}
            placeholder="Brief caption for the photo"
            disabled={loading}
          />
        </FormField>

        <FormField label="Description" htmlFor="photo-description">
          <textarea
            id="photo-description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`${inputClassName} h-20 resize-none`}
            placeholder="Detailed description of the photo..."
            disabled={loading}
          />
        </FormField>

        {/* Geolocation */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Geolocation (Optional)</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Latitude" htmlFor="photo-lat">
              <input
                id="photo-lat"
                type="number"
                step="any"
                value={formData.latitude ?? ''}
                onChange={(e) => handleChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={inputClassName}
                placeholder="e.g., 35.3095"
                disabled={loading}
              />
            </FormField>
            <FormField label="Longitude" htmlFor="photo-lng">
              <input
                id="photo-lng"
                type="number"
                step="any"
                value={formData.longitude ?? ''}
                onChange={(e) => handleChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={inputClassName}
                placeholder="e.g., 75.6927"
                disabled={loading}
              />
            </FormField>
          </div>
        </div>

        {/* Tags */}
        <FormField label="Tags" htmlFor="photo-tags" hint="Separate tags with commas">
          <input
            id="photo-tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className={inputClassName}
            placeholder="e.g., plantation, trees, 2024, spring"
            disabled={loading}
          />
        </FormField>
      </div>
    </FormModal>
  );
}
