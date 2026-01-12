"use client";

import { useState, useEffect } from 'react';
import FormModal, {
  FormModalFooter,
  FormField,
  inputClassName,
} from '@/components/admin/shared/FormModal';
import {
  Photo,
  UpdatePhotoData,
  updatePhoto,
  getCategoryLabel,
  getCategoryColor,
} from '@/lib/admin/photosApi';
import { useToast } from '@/components/ToastContext';

interface PhotoEditModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  photo: Photo;
}

export default function PhotoEditModal({
  open,
  onClose,
  onSuccess,
  photo,
}: PhotoEditModalProps) {
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState<UpdatePhotoData>({
    year: photo.year,
    latitude: photo.latitude,
    longitude: photo.longitude,
    caption: photo.caption || '',
    description: photo.description || '',
    tags: photo.tags,
  });
  const [tagsInput, setTagsInput] = useState(photo.tags.join(', '));
  const [loading, setLoading] = useState(false);

  // Reset form when photo changes
  useEffect(() => {
    setFormData({
      year: photo.year,
      latitude: photo.latitude,
      longitude: photo.longitude,
      caption: photo.caption || '',
      description: photo.description || '',
      tags: photo.tags,
    });
    setTagsInput(photo.tags.join(', '));
  }, [photo]);

  // Handle submit
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await updatePhoto(photo.id, {
        ...formData,
        tags,
      });

      showToast('Photo updated successfully', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to update photo', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle field changes
  const handleChange = <K extends keyof UpdatePhotoData>(field: K, value: UpdatePhotoData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Edit Photo"
      description="Update photo metadata and details"
      size="lg"
      loading={loading}
      footer={
        <FormModalFooter
          onCancel={onClose}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          loading={loading}
        />
      }
    >
      <div className="space-y-6">
        {/* Photo Preview */}
        <div className="flex gap-4">
          <img
            src={photo.minioUrl}
            alt={photo.caption || photo.originalFileName}
            className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(photo.category)}`}>
                {getCategoryLabel(photo.category)}
              </span>
            </div>
            <p className="text-sm text-gray-900 font-medium">{photo.originalFileName}</p>
            {photo.site && (
              <p className="text-sm text-gray-500 mt-1">Site: {photo.site.name}</p>
            )}
            {photo.species && (
              <p className="text-sm text-gray-500 mt-1 italic">Species: {photo.species.botanicalName}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Uploaded: {new Date(photo.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Caption */}
        <FormField label="Caption" htmlFor="edit-caption">
          <input
            id="edit-caption"
            type="text"
            value={formData.caption || ''}
            onChange={(e) => handleChange('caption', e.target.value)}
            className={inputClassName}
            placeholder="Brief caption for the photo"
            disabled={loading}
          />
        </FormField>

        {/* Description */}
        <FormField label="Description" htmlFor="edit-description">
          <textarea
            id="edit-description"
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className={`${inputClassName} h-24 resize-none`}
            placeholder="Detailed description of the photo..."
            disabled={loading}
          />
        </FormField>

        {/* Year (for event/site photos) */}
        {(photo.category === 'EVENT' || photo.category === 'SITE') && (
          <FormField label="Year" htmlFor="edit-year">
            <input
              id="edit-year"
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

        {/* Geolocation */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Geolocation</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Latitude" htmlFor="edit-lat">
              <input
                id="edit-lat"
                type="number"
                step="any"
                value={formData.latitude ?? ''}
                onChange={(e) => handleChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                className={inputClassName}
                placeholder="e.g., 35.3095"
                disabled={loading}
              />
            </FormField>
            <FormField label="Longitude" htmlFor="edit-lng">
              <input
                id="edit-lng"
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
        <FormField label="Tags" htmlFor="edit-tags" hint="Separate tags with commas">
          <input
            id="edit-tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className={inputClassName}
            placeholder="e.g., plantation, trees, 2024, spring"
            disabled={loading}
          />
          {tagsInput && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tagsInput.split(',').map((tag, i) => tag.trim() && (
                <span key={i} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </FormField>
      </div>
    </FormModal>
  );
}
