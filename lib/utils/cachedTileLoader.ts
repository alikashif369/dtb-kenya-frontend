/**
 * Cached Tile Loader for OpenLayers
 * Implements caching strategy for XYZ tile loading
 */

import { getTileCache } from './tileCache';
import type { LoadFunction } from 'ol/Tile';
import type { ImageTile } from 'ol';

/**
 * Create a cached tile load function for OpenLayers XYZ source
 */
export function createCachedTileLoader(type: 'base' | 'classified' = 'base'): LoadFunction {
  const cache = getTileCache();

  return function(tile: any, src: string) {
    const img = tile.getImage() as HTMLImageElement;

    // Try to load from cache first
    cache.get(src).then((cachedBlob) => {
      if (cachedBlob) {
        // Load from cache
        const objectUrl = URL.createObjectURL(cachedBlob);
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
      } else {
        // Fetch from network and cache
        fetch(src)
          .then((response) => {
            if (!response.ok) {
              // 404s are normal for tiles - some don't exist at certain zoom levels
              // Don't throw error, just skip caching and let OpenLayers handle it
              img.src = src;
              return null;
            }
            return response.blob();
          })
          .then((blob) => {
            if (!blob) return; // Skip if fetch failed
            
            // Cache the tile
            cache.set(src, blob, type).catch(() => {
              // Silently fail cache writes - not critical
            });

            // Display the tile
            const objectUrl = URL.createObjectURL(blob);
            img.onload = () => {
              URL.revokeObjectURL(objectUrl);
            };
            img.onerror = () => {
              URL.revokeObjectURL(objectUrl);
            };
            img.src = objectUrl;
          })
          .catch(() => {
            // Silently fail and fallback to direct loading
            // Tile errors are normal and shouldn't clutter console
            img.src = src;
          });
      }
    }).catch(() => {
      // Cache read error - fallback to direct loading
      img.src = src;
    });
  };
}

/**
 * Clear tile cache
 */
export async function clearTileCache(): Promise<void> {
  const cache = getTileCache();
  await cache.clear();
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  const cache = getTileCache();
  await cache.clearExpired();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const cache = getTileCache();
  return cache.getStats();
}
