"use client";

import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';
import {
  Building2,
  Globe,
  MapPin,
  TrendingUp,
  Trees,
  Sun,
  Leaf,
  Image,
  Upload,
  BarChart3,
  FileText,
  ArrowRight,
} from 'lucide-react';

interface QuickLinkProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  count?: number;
}

function QuickLink({ href, icon, title, description, count }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition group"
    >
      <div className="p-3 bg-green-50 rounded-lg text-green-700 group-hover:bg-green-100 transition">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {count !== undefined && (
            <span className="text-sm text-gray-500">{count} items</span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition" />
    </Link>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Admin Dashboard"
        description="Welcome to SerenaGreen 2.0 Admin Panel. Manage your data from the sidebar or use the quick links below."
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-900">--</div>
          <div className="text-sm text-gray-600">Total Sites</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-blue-600">--</div>
          <div className="text-sm text-gray-600">Rasters Uploaded</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-purple-600">--</div>
          <div className="text-sm text-gray-600">Species Catalogued</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-2xl font-bold text-orange-600">--</div>
          <div className="text-sm text-gray-600">Photos</div>
        </div>
      </div>

      {/* Quick Links - Hierarchy */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hierarchy Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink
            href="/admin/organizations"
            icon={<Building2 className="w-6 h-6" />}
            title="Organizations"
            description="Manage top-level organizations"
          />
          <QuickLink
            href="/admin/regions"
            icon={<Globe className="w-6 h-6" />}
            title="Regions"
            description="Manage geographic regions"
          />
          <QuickLink
            href="/admin/sites"
            icon={<MapPin className="w-6 h-6" />}
            title="Sites"
            description="Manage individual sites"
          />
        </div>
      </div>

      {/* Quick Links - Site Data */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Site Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink
            href="/admin/yearly-metrics"
            icon={<TrendingUp className="w-6 h-6" />}
            title="Yearly Metrics"
            description="Land cover percentages per site per year"
          />
          <QuickLink
            href="/admin/plantation-data"
            icon={<Trees className="w-6 h-6" />}
            title="Plantation Data"
            description="Plant counts and species per site"
          />
          <QuickLink
            href="/admin/solar-data"
            icon={<Sun className="w-6 h-6" />}
            title="Solar Data"
            description="Solar capacity and quarterly production"
          />
        </div>
      </div>

      {/* Quick Links - Reference & Spatial */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reference & Spatial Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink
            href="/admin/species"
            icon={<Leaf className="w-6 h-6" />}
            title="Species Catalog"
            description="Manage tree/plant species"
          />
          <QuickLink
            href="/admin/photos"
            icon={<Image className="w-6 h-6" />}
            title="Photo Management"
            description="Upload and manage site photos"
          />
          <QuickLink
            href="/admin/rasters"
            icon={<Upload className="w-6 h-6" />}
            title="Raster Upload"
            description="Upload GeoTIFF satellite imagery"
          />
        </div>
      </div>

      {/* Quick Links - System */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickLink
            href="/admin/aggregate-metrics"
            icon={<BarChart3 className="w-6 h-6" />}
            title="Aggregate Metrics"
            description="Organization/region-level metrics"
          />
          <QuickLink
            href="/admin/category-summaries"
            icon={<FileText className="w-6 h-6" />}
            title="Category Summaries"
            description="Dashboard text content"
          />
        </div>
      </div>
    </div>
  );
}
