/**
 * Tile Cache Utility for OpenLayers Raster Tiles
 * Implements in-memory and IndexedDB caching for satellite imagery
 */

interface CacheEntry {
  url: string;
  data: Blob;
  timestamp: number;
  type: 'base' | 'classified';
}

class TileCache {
  private memoryCache: Map<string, CacheEntry>;
  private readonly maxMemoryCacheSize: number;
  private readonly maxAge: number; // milliseconds
  private dbName = 'serena-tile-cache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor(maxMemoryCacheSize = 100, maxAgeHours = 24) {
    this.memoryCache = new Map();
    this.maxMemoryCacheSize = maxMemoryCacheSize;
    this.maxAge = maxAgeHours * 60 * 60 * 1000;
    this.initDB();
  }

  /**
   * Initialize IndexedDB for persistent caching
   */
  private async initDB(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[TileCache] IndexedDB not available');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('[TileCache] IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[TileCache] IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains('tiles')) {
          const objectStore = db.createObjectStore('tiles', { keyPath: 'url' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          objectStore.createIndex('type', 'type', { unique: false });
          console.log('[TileCache] Object store created');
        }
      };
    });
  }

  /**
   * Generate cache key from tile URL
   */
  private getCacheKey(url: string): string {
    return url;
  }

  /**
   * Get tile from memory cache
   */
  private getFromMemory(url: string): CacheEntry | null {
    const entry = this.memoryCache.get(url);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.memoryCache.delete(url);
      return null;
    }

    return entry;
  }

  /**
   * Store tile in memory cache with LRU eviction
   */
  private storeInMemory(entry: CacheEntry): void {
    // If cache is full, remove oldest entry
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }

    this.memoryCache.set(entry.url, entry);
  }

  /**
   * Get tile from IndexedDB
   */
  private async getFromDB(url: string): Promise<CacheEntry | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(['tiles'], 'readonly');
        const store = transaction.objectStore('tiles');
        const request = store.get(url);

        request.onsuccess = () => {
          const entry = request.result as CacheEntry | undefined;
          
          if (!entry) {
            resolve(null);
            return;
          }

          // Check if expired
          if (Date.now() - entry.timestamp > this.maxAge) {
            this.deleteFromDB(url);
            resolve(null);
            return;
          }

          resolve(entry);
        };

        request.onerror = () => {
          console.error('[TileCache] Error reading from IndexedDB:', request.error);
          resolve(null);
        };
      } catch (error) {
        console.error('[TileCache] Transaction error:', error);
        resolve(null);
      }
    });
  }

  /**
   * Store tile in IndexedDB
   */
  private async storeInDB(entry: CacheEntry): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(['tiles'], 'readwrite');
        const store = transaction.objectStore('tiles');
        const request = store.put(entry);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('[TileCache] Error storing in IndexedDB:', request.error);
          resolve();
        };
      } catch (error) {
        console.error('[TileCache] Transaction error:', error);
        resolve();
      }
    });
  }

  /**
   * Delete tile from IndexedDB
   */
  private async deleteFromDB(url: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(['tiles'], 'readwrite');
        const store = transaction.objectStore('tiles');
        const request = store.delete(url);

        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      } catch (error) {
        resolve();
      }
    });
  }

  /**
   * Get tile from cache (memory first, then DB)
   */
  async get(url: string): Promise<Blob | null> {
    // Try memory cache first
    const memoryEntry = this.getFromMemory(url);
    if (memoryEntry) {
      return memoryEntry.data;
    }

    // Try IndexedDB
    const dbEntry = await this.getFromDB(url);
    if (dbEntry) {
      // Store in memory for faster access next time
      this.storeInMemory(dbEntry);
      return dbEntry.data;
    }

    return null;
  }

  /**
   * Store tile in cache
   */
  async set(url: string, data: Blob, type: 'base' | 'classified' = 'base'): Promise<void> {
    const entry: CacheEntry = {
      url,
      data,
      timestamp: Date.now(),
      type,
    };

    // Store in memory
    this.storeInMemory(entry);

    // Store in IndexedDB asynchronously
    this.storeInDB(entry).catch((error) => {
      console.error('[TileCache] Failed to store in DB:', error);
    });
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear IndexedDB
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(['tiles'], 'readwrite');
        const store = transaction.objectStore('tiles');
        const request = store.clear();

        request.onsuccess = () => {
          console.log('[TileCache] Cache cleared');
          resolve();
        };
        request.onerror = () => {
          console.error('[TileCache] Error clearing cache:', request.error);
          resolve();
        };
      } catch (error) {
        console.error('[TileCache] Transaction error:', error);
        resolve();
      }
    });
  }

  /**
   * Clear expired entries
   */
  async clearExpired(): Promise<void> {
    if (!this.db) return;

    // Clear expired from memory
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.memoryCache.delete(key);
      }
    }

    // Clear expired from IndexedDB
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction(['tiles'], 'readwrite');
        const store = transaction.objectStore('tiles');
        const index = store.index('timestamp');
        const cutoffTime = now - this.maxAge;

        const request = index.openCursor();

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const entry = cursor.value as CacheEntry;
            if (entry.timestamp < cutoffTime) {
              cursor.delete();
            }
            cursor.continue();
          } else {
            console.log('[TileCache] Expired entries cleared');
            resolve();
          }
        };

        request.onerror = () => {
          console.error('[TileCache] Error clearing expired:', request.error);
          resolve();
        };
      } catch (error) {
        console.error('[TileCache] Transaction error:', error);
        resolve();
      }
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): { memorySize: number; maxSize: number } {
    return {
      memorySize: this.memoryCache.size,
      maxSize: this.maxMemoryCacheSize,
    };
  }

  /**
   * Preload tiles for a given extent (optional optimization)
   */
  async preload(urls: string[], type: 'base' | 'classified' = 'base'): Promise<void> {
    const promises = urls.map(async (url) => {
      try {
        // Check if already cached
        const cached = await this.get(url);
        if (cached) return;

        // Fetch and cache
        const response = await fetch(url);
        if (response.ok) {
          const blob = await response.blob();
          await this.set(url, blob, type);
        }
      } catch (error) {
        // Silently fail for preloading
        console.debug('[TileCache] Preload failed for:', url);
      }
    });

    await Promise.allSettled(promises);
  }
}

// Singleton instance
let tileCache: TileCache | null = null;

export function getTileCache(): TileCache {
  if (!tileCache) {
    tileCache = new TileCache(200, 48); // 200 tiles in memory, 48 hours expiry
  }
  return tileCache;
}

export default getTileCache;
