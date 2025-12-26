"use client";

import { Construction } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminLayout';

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={title}
        description={description || `${title} management will be available soon.`}
      />

      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-yellow-100 rounded-full mb-4">
            <Construction className="w-12 h-12 text-yellow-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 max-w-md">
            This feature is currently under development. Check back soon for updates.
          </p>
        </div>
      </div>
    </div>
  );
}
