"use client";

export function MapSkeleton() {
  return (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center relative">
      <div className="text-center space-y-2">
        <div className="h-6 w-32 bg-gray-300 rounded mx-auto"></div>
        <div className="h-4 w-40 bg-gray-200 rounded mx-auto"></div>
      </div>

      {/* Simulate map controls */}
      <div className="absolute top-3 right-3 space-y-2">
        <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
        <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
        <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
        <div className="h-10 w-10 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  );
}
