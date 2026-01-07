/**
 * Tile Cache Manager Component
 * Provides UI for viewing and managing tile cache
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw, HardDrive } from 'lucide-react';
import { getCacheStats, clearTileCache, clearExpiredCache } from '@/lib/utils/cachedTileLoader';

export default function TileCacheManager() {
  const [stats, setStats] = useState({ memorySize: 0, maxSize: 0 });
  const [isClearing, setIsClearing] = useState(false);
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    updateStats();
    
    // Auto-clear expired entries on mount
    clearExpiredCache().catch(console.error);
    
    // Update stats every 10 seconds
    const interval = setInterval(updateStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateStats = () => {
    const newStats = getCacheStats();
    setStats(newStats);
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached tiles? This will require re-downloading imagery.')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearTileCache();
      updateStats();
      alert('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache');
    } finally {
      setIsClearing(false);
    }
  };

  const handleClearExpired = async () => {
    setIsClearing(true);
    try {
      await clearExpiredCache();
      updateStats();
    } catch (error) {
      console.error('Failed to clear expired:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const cachePercentage = (stats.memorySize / stats.maxSize) * 100;

  if (!showManager) {
    return (
      <button
        onClick={() => setShowManager(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-stone-200 hover:bg-white transition-colors text-sm"
        title="Tile Cache Manager"
      >
        <Database className="w-4 h-4 text-stone-600" />
        <span className="text-stone-700 font-medium">{stats.memorySize}</span>
      </button>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 p-4 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-stone-800">Tile Cache</h3>
        </div>
        <button
          onClick={() => setShowManager(false)}
          className="text-stone-400 hover:text-stone-600 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Memory Cache Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-600">Memory Cache</span>
          <span className="font-medium text-stone-800">
            {stats.memorySize} / {stats.maxSize} tiles
          </span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
            style={{ width: `${Math.min(cachePercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-stone-500">
          {cachePercentage.toFixed(1)}% capacity
        </p>
      </div>

      {/* Cache Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <div className="flex items-start gap-2">
          <HardDrive className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-blue-900 font-medium mb-1">
              Persistent Storage
            </p>
            <p className="text-xs text-blue-700">
              Tiles are cached in IndexedDB and persist across sessions
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={handleClearExpired}
          disabled={isClearing}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${isClearing ? 'animate-spin' : ''}`} />
          Clear Expired
        </button>
        <button
          onClick={handleClearCache}
          disabled={isClearing}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Clear All Cache
        </button>
      </div>

      <p className="text-xs text-stone-500 mt-3 text-center">
        Cache expires after 48 hours
      </p>
    </div>
  );
}
