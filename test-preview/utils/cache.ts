import { CACHE_CONFIG } from './constants';

interface CacheItem {
  url: string;
  screenshot: string; // base64 or URL
  timestamp: number;
  method: 'iframe' | 'screenshot';
}

interface CacheData {
  items: CacheItem[];
  lastCleanup: number;
}

export class PreviewCache {
  private storageKey = CACHE_CONFIG.STORAGE_KEY;

  private getCache(): CacheData {
    try {
      const cached = localStorage.getItem(this.storageKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('Failed to parse cache data:', error);
    }
    return { items: [], lastCleanup: Date.now() };
  }

  private saveCache(data: CacheData): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache data:', error);
      // If storage is full, clear old items and try again
      this.cleanup(true);
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } catch (retryError) {
        console.error('Failed to save cache data after cleanup:', retryError);
      }
    }
  }

  get(url: string): CacheItem | null {
    const cache = this.getCache();
    const item = cache.items.find(item => item.url === url);
    
    if (item) {
      // Check if item is expired
      const expiryTime = CACHE_CONFIG.EXPIRY_HOURS * 60 * 60 * 1000;
      if (Date.now() - item.timestamp > expiryTime) {
        this.remove(url);
        return null;
      }
      return item;
    }
    
    return null;
  }

  set(url: string, screenshot: string, method: 'iframe' | 'screenshot'): void {
    const cache = this.getCache();
    
    // Remove existing item if it exists
    cache.items = cache.items.filter(item => item.url !== url);
    
    // Add new item
    cache.items.push({
      url,
      screenshot,
      timestamp: Date.now(),
      method
    });

    // Cleanup if cache is too large
    if (cache.items.length > CACHE_CONFIG.MAX_CACHE_SIZE) {
      this.cleanup();
    }

    this.saveCache(cache);
  }

  remove(url: string): void {
    const cache = this.getCache();
    cache.items = cache.items.filter(item => item.url !== url);
    this.saveCache(cache);
  }

  cleanup(force = false): void {
    const cache = this.getCache();
    const now = Date.now();
    const expiryTime = CACHE_CONFIG.EXPIRY_HOURS * 60 * 60 * 1000;

    // Remove expired items
    cache.items = cache.items.filter(item => {
      return now - item.timestamp <= expiryTime;
    });

    // If still too many items or forced cleanup, remove oldest items
    if (force || cache.items.length > CACHE_CONFIG.MAX_CACHE_SIZE) {
      cache.items.sort((a, b) => b.timestamp - a.timestamp);
      cache.items = cache.items.slice(0, CACHE_CONFIG.MAX_CACHE_SIZE);
    }

    cache.lastCleanup = now;
    this.saveCache(cache);
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  getStats(): { count: number; size: string } {
    const cache = this.getCache();
    const sizeInBytes = new Blob([JSON.stringify(cache)]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    
    return {
      count: cache.items.length,
      size: `${sizeInKB} KB`
    };
  }
}

export const previewCache = new PreviewCache();
