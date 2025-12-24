"use client";

import { useState } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/ToastContext';
import TabNavigation from '@/components/admin/shared/TabNavigation';
import RasterUploadTab from '@/components/admin/RasterUpload/RasterUploadTab';
import AggregateMetricsTab from '@/components/admin/AggregateMetrics/AggregateMetricsTab';
import CategorySummariesTab from '@/components/admin/CategorySummaries/CategorySummariesTab';
import { Upload, BarChart3, FileText } from 'lucide-react';

export default function AdminPage() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AdminPageInner />
      </ToastProvider>
    </ErrorBoundary>
  );
}

function AdminPageInner() {
  const [activeTab, setActiveTab] = useState<'rasters' | 'metrics' | 'summaries'>('rasters');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage rasters, aggregate metrics, and category summaries
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as 'rasters' | 'metrics' | 'summaries')}
        tabs={[
          { id: 'rasters', label: 'Raster Upload', icon: <Upload className="w-4 h-4" /> },
          { id: 'metrics', label: 'Aggregate Metrics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'summaries', label: 'Category Summaries', icon: <FileText className="w-4 h-4" /> },
        ]}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'rasters' && <RasterUploadTab />}
        {activeTab === 'metrics' && <AggregateMetricsTab />}
        {activeTab === 'summaries' && <CategorySummariesTab />}
      </main>
    </div>
  );
}
