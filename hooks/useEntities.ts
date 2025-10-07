/**
 * Custom hook for fetching and caching entities
 */

import { useEffect, useState, useCallback } from 'react'
import { HAEntity } from '@/types/home-assistant'
import { cache } from '@/lib/cache'
import { ENTITY_STALE_TIME } from '@/lib/constants'
import { trackAPICall } from '@/lib/performance'

const CACHE_KEY = 'entities'

interface UseEntitiesResult {
  entities: HAEntity[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEntities(autoRefresh = false, refreshInterval = 30000): UseEntitiesResult {
  const [entities, setEntities] = useState<HAEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntities = useCallback(async () => {
    try {
      // Check cache first
      const cached = cache.get<HAEntity[]>(CACHE_KEY, ENTITY_STALE_TIME)
      if (cached) {
        setEntities(cached)
        setLoading(false)
        return
      }

      setError(null)
      const { res, data } = await trackAPICall('fetch-entities', async () => {
        const response = await fetch('/api/ha/entities', { cache: 'no-store' })
        const json = await response.json()
        return { res: response, data: json }
      })

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load entities')
      }

      // Cache the response
      cache.set(CACHE_KEY, data)
      setEntities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchEntities()
  }, [fetchEntities])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchEntities()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchEntities])

  return {
    entities,
    loading,
    error,
    refetch: fetchEntities,
  }
}

/**
 * Invalidate entity cache (call after mutations)
 */
export function invalidateEntitiesCache() {
  cache.clear(CACHE_KEY)
}
