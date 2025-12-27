"use client";

import { ReactNode, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  loading?: boolean;
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export default function FormModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg',
  loading = false,
}: FormModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8">
      <div
        className={`bg-white rounded-lg shadow-xl ${SIZE_CLASSES[size]} w-full mx-4 my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition disabled:opacity-50"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Common form footer with cancel/submit buttons
interface FormModalFooterProps {
  onCancel: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  submitVariant?: 'primary' | 'danger';
}

export function FormModalFooter({
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  disabled = false,
  submitVariant = 'primary',
}: FormModalFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
      >
        {cancelLabel}
      </button>
      {onSubmit && (
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || disabled}
          className={`
            rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 inline-flex items-center gap-2
            ${submitVariant === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-900 hover:bg-green-800'
            }
          `}
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      )}
    </div>
  );
}

// Form field wrapper for consistent styling
interface FormFieldProps {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

// Common input styles
export const inputClassName = `
  w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
  focus:ring-2 focus:ring-green-900 focus:border-transparent
  disabled:bg-gray-100 disabled:text-gray-500
  placeholder:text-gray-400
`;

export const selectClassName = `
  w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
  focus:ring-2 focus:ring-green-900 focus:border-transparent
  disabled:bg-gray-100 disabled:text-gray-500
`;

export const textareaClassName = `
  w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
  focus:ring-2 focus:ring-green-900 focus:border-transparent
  disabled:bg-gray-100 disabled:text-gray-500
  placeholder:text-gray-400 resize-none
`;
