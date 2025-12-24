"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { HierarchySite } from "./types";
import { handleApiError, formatErrorMessage } from "../../lib/utils/errorHandler";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

type SiteContext = { categoryId: number | null; subCategoryId: number | null };

type Props = {
  open: boolean;
  context: SiteContext;
  onClose: () => void;
  onCreated: (site: HierarchySite) => void;
};

export function CreateSiteModal({ open, context, onClose, onCreated }: Props) {
  const [form, setForm] = useState({ 
    name: "", 
    slug: "",
    city: "", 
    district: "", 
    area: "",
    siteType: "PLANTATION",
    infrastructure: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-generate unique slug from name with timestamp suffix
  const generateSlug = (name: string) => {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const timestamp = Date.now().toString().slice(-5); // Last 5 digits of timestamp
    return `${baseSlug}-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      setError("Name is required");
      return;
    }
    if (!form.slug) {
      setError("Slug is required");
      return;
    }
    if (!context.categoryId) {
      setError("Select a category first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        name: form.name,
        slug: form.slug,
        district: form.district || undefined,
        city: form.city || undefined,
        area: form.area ? Number(form.area) : undefined,
        categoryId: context.categoryId,
        subCategoryId: context.subCategoryId || undefined,
        siteType: form.siteType,
        infrastructure: form.infrastructure || undefined,
      };
      const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
      const res = await fetch(`${API_BASE}/sites`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorDetails = await handleApiError(res, "Create Site");
        setError(errorDetails.userMessage);
        return;
      }
      const newSite = await res.json();
      console.log("[SITE_CREATION] Site created successfully:", newSite);
      onCreated({
        id: newSite.id,
        name: newSite.name,
        slug: newSite.slug,
        siteType: newSite.siteType,
        area: newSite.area,
        district: newSite.district,
        city: newSite.city,
        category: newSite.category,
        subCategory: newSite.subCategory,
      });
      console.log("[SITE_CREATION] Callback triggered with site ID:", newSite.id);
    } catch (err: any) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create New Site</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                const newName = e.target.value;
                setForm({ 
                  ...form, 
                  name: newName,
                  slug: newName ? generateSlug(newName) : "" // Auto-generate slug
                });
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={loading}
              placeholder="e.g., Ranga Plantation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={loading}
              placeholder="e.g., ranga-plantation"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-generated from name (edit if needed)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Type *</label>
            <select
              value={form.siteType}
              onChange={(e) => setForm({ ...form, siteType: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={loading}
            >
              <option value="PLANTATION">Plantation</option>
              <option value="HOTEL">Hotel</option>
              <option value="SOLAR_INSTALLATION">Solar Installation</option>
              <option value="COMMUNITY_INITIATIVE">Community Initiative</option>
              <option value="WASTE_FACILITY">Waste Facility</option>
              <option value="SEWAGE_PLANT">Sewage Plant</option>
              <option value="CONSERVATION">Conservation</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area (hectares)</label>
            <input
              type="number"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={loading}
              step="0.1"
              placeholder="150.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Infrastructure</label>
            <textarea
              value={form.infrastructure}
              onChange={(e) => setForm({ ...form, infrastructure: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={loading}
              rows={2}
              placeholder="Solar panels, water management system"
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-800">{error}</div>
          )}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-green-900 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />} Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
