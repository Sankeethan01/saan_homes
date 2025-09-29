/**
 * Optimized API Hook for Performance
 * Reduces redundant API calls and provides better state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCache, fetchWithCache, CACHE_KEYS, invalidateCache } from '@/app/utils/apiCache';

interface UseAPIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseAPIOptions {
  ttl?: number; // Cache TTL in milliseconds
  enabled?: boolean; // Whether to fetch immediately
  refetchOnMount?: boolean; // Whether to refetch when component mounts
  cacheKey?: string; // Custom cache key
}

/**
 * Optimized API hook with caching and deduplication
 */
export function useOptimizedAPI<T>(
  url: string | null,
  options: RequestInit = {},
  hookOptions: UseAPIOptions = {}
): UseAPIState<T> {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    refetchOnMount = true,
    cacheKey,
  } = hookOptions;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!url || !enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const finalCacheKey = cacheKey || url;
      
      // Try cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = apiCache.get<T>(finalCacheKey);
        if (cached) {
          if (isMountedRef.current) {
            setData(cached);
            setLoading(false);
          }
          return;
        }
      }

      // Fetch from API
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Cache the result
      apiCache.set(finalCacheKey, result, ttl);

      // Update state if component is still mounted
      if (isMountedRef.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, don't update state
          return;
        }
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    }
  }, [url, JSON.stringify(options), ttl, enabled, cacheKey]);

  // Initial fetch
  useEffect(() => {
    if (refetchOnMount) {
      fetchData();
    }
  }, [fetchData, refetchOnMount]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook for fetching projects with optimized caching
 */
export function useProjects() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  return useOptimizedAPI(
    token ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/` : null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      ttl: 2 * 60 * 1000, // 2 minutes
      cacheKey: CACHE_KEYS.PROJECTS,
    }
  );
}

/**
 * Hook for fetching a specific project
 */
export function useProject(projectId: string | null) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  return useOptimizedAPI(
    projectId && token ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${projectId}/` : null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      ttl: 5 * 60 * 1000, // 5 minutes
      cacheKey: projectId ? CACHE_KEYS.PROJECT(projectId) : undefined,
    }
  );
}

/**
 * Hook for fetching project bills
 */
export function useProjectBills(projectId: string | null) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  return useOptimizedAPI(
    projectId && token ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/bills/?project=${projectId}` : null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      ttl: 1 * 60 * 1000, // 1 minute (bills change frequently)
      cacheKey: projectId ? CACHE_KEYS.PROJECT_BILLS(projectId) : undefined,
    }
  );
}

/**
 * Hook for fetching user profile
 */
export function useUserProfile() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  return useOptimizedAPI(
    token ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/userAccounts/profile/` : null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    {
      ttl: 10 * 60 * 1000, // 10 minutes
      cacheKey: CACHE_KEYS.USER_PROFILE,
    }
  );
}

/**
 * Hook for invalidating cache when data changes
 */
export function useCacheInvalidation() {
  const invalidateProject = useCallback((projectId: string) => {
    invalidateCache(`project:${projectId}`);
    invalidateCache('projects');
  }, []);

  const invalidateBills = useCallback((projectId: string) => {
    invalidateCache(`project:${projectId}:bills`);
    invalidateCache('bills');
  }, []);

  const invalidateAll = useCallback(() => {
    apiCache.clear();
  }, []);

  return {
    invalidateProject,
    invalidateBills,
    invalidateAll,
  };
}
