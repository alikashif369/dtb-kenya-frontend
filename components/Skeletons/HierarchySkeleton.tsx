"use client";

export function HierarchySkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-5 w-24 bg-gray-200 rounded"></div>
      
      {/* Organization Row */}
      <div className="space-y-2">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
      </div>

      {/* Region Row */}
      <div className="space-y-2">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
      </div>

      {/* Category Row */}
      <div className="space-y-2">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
      </div>

      {/* SubCategory Row */}
      <div className="space-y-2">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
      </div>

      {/* Site Row */}
      <div className="space-y-2">
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );
}
