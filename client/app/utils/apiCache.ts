/**
 * API Cache Utility for Performance Optimization
 * Reduces redundant API calls and improves response times
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Remove specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
export const apiCache = new APICache();

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Enhanced fetch function with caching
 */
export async function fetchWithCache<T>(
  url: string,
  options: RequestInit = {},
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  
  // Try to get from cache first
  const cached = apiCache.get<T>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache the result
  apiCache.set(cacheKey, data, ttl);
  
  return data;
}

/**
 * Cache keys for different API endpoints
 */
export const CACHE_KEYS = {
  PROJECTS: 'projects',
  PROJECT: (id: string) => `project:${id}`,
  PROJECT_STEPS: (id: string) => `project:${id}:steps`,
  PROJECT_BILLS: (id: string) => `project:${id}:bills`,
  STEP_BILLS: (stepId: string) => `step:${stepId}:bills`,
  INVOICES: 'invoices',
  EQUIPMENTS: 'equipments',
  SUPERVISORS: 'supervisors',
  USER_PROFILE: 'user:profile',
  RENTALS: 'rentals',
} as const;

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCache(pattern: string): void {
  const stats = apiCache.getStats();
  stats.keys.forEach(key => {
    if (key.includes(pattern)) {
      apiCache.delete(key);
    }
  });
}

/**
 * Preload critical data
 */
export async function preloadCriticalData(token: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
  
  try {
    // Preload user profile
    await fetchWithCache(
      `${baseUrl}/userAccounts/profile/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      10 * 60 * 1000 // 10 minutes
    );

    // Preload projects list
    await fetchWithCache(
      `${baseUrl}/projects/`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
      2 * 60 * 1000 // 2 minutes
    );
  } catch (error) {
    console.warn('Failed to preload critical data:', error);
  }
}
