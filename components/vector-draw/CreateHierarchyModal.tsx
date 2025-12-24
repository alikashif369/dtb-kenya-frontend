"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { handleApiError, formatErrorMessage } from "../../lib/utils/errorHandler";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

type CreateLevel = "org" | "region" | "category" | "subCategory";

type Props = {
  level: CreateLevel | null;
  context: { orgId: number | null; regionId: number | null; categoryId: number | null };
  onClose: () => void;
  onCreated: (payload: { level: CreateLevel; id: number; name: string }) => void;
};

export function CreateHierarchyModal({ level, context, onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: "", slug: "", description: "", type: "PLANTATION" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const titleMap: Record<CreateLevel, string> = {
    org: "Organization",
    region: "Region",
    category: "Category",
    subCategory: "Sub-category",
  };

  if (!level) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.slug.trim()) {
      setError("Slug is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let url = "";
      const body: Record<string, any> = { 
        name: form.name.trim(),
        slug: form.slug.trim(),
      };
      
      if (level === "org") {
        url = `${API_BASE}/organizations`;
        if (form.description) body.description = form.description;
      }
      if (level === "region") {
        url = `${API_BASE}/regions`;
        body.organizationId = context.orgId;
      }
      if (level === "category") {
        url = `${API_BASE}/categories`;
        body.regionId = context.regionId;
        body.type = form.type;
      }
      if (level === "subCategory") {
        url = `${API_BASE}/sub-categories`;
        body.categoryId = context.categoryId;
      }

      const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
      const res = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errorDetails = await handleApiError(res, `Create ${level}`);
        setError(errorDetails.userMessage);
        return;
      }
      const created = await res.json();
      onCreated({ level, id: created.id, name: form.name.trim() });
    } catch (err: any) {
      setError(formatErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add {titleMap[level]}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
              disabled={loading}
              placeholder="e.g., Serena Hotels Group"
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
              placeholder="e.g., serena-hotels-group"
            />
            <p className="text-xs text-gray-500 mt-1">URL-friendly identifier (lowercase, hyphens)</p>
          </div>
          {level === "org" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                disabled={loading}
                rows={2}
                placeholder="Organization description"
              />
            </div>
          )}
          {level === "category" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-900 focus:border-transparent"
                disabled={loading}
              >
                <option value="PLANTATION">Plantation</option>
                <option value="SOLAR">Solar</option>
                <option value="COMMUNITY">Community</option>
                <option value="WASTE">Waste</option>
                <option value="SEWAGE">Sewage</option>
                <option value="RESTORATION">Restoration</option>
              </select>
            </div>
          )}
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
