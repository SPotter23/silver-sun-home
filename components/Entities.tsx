'use client'
import { useState } from 'react'
import { HAEntity } from '@/types/home-assistant'
import { GRID_COLUMNS } from '@/lib/constants'
import { getEntityIcon } from '@/lib/icons'
import { useEntities, invalidateEntitiesCache } from '@/hooks/useEntities'
import { SkeletonGrid } from './SkeletonCard'

interface EntitiesProps {
  autoRefresh?: boolean
  searchQuery?: string
}

export function Entities({ autoRefresh = false, searchQuery = '' }: EntitiesProps) {
  const { entities: allEntities, loading, error, refetch } = useEntities(autoRefresh, 30000)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)

  // Filter entities based on search query
  const entities = allEntities.filter(e => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      e.entity_id.toLowerCase().includes(query) ||
      e.attributes.friendly_name?.toLowerCase().includes(query) ||
      e.domain.toLowerCase().includes(query)
    )
  })

  const toggle = async (entity: HAEntity) => {
    const { entity_id, domain, state } = entity
    const service = (domain === 'light' || domain === 'switch')
      ? (state === 'on' ? 'turn_off' : 'turn_on')
      : null

    if (!service) return

    setToggleLoading(entity_id)

    try {
      const res = await fetch('/api/ha/call_service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, service, entity_id })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to toggle device')
      }

      // Invalidate cache and refresh
      invalidateEntitiesCache()
      await refetch()
    } catch (err) {
      console.error('Toggle error:', err)
    } finally {
      setToggleLoading(null)
    }
  }

  if (loading) return <SkeletonGrid count={6} />

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-900/20 border border-red-800 text-red-300">
        <p className="font-medium">Connection Error</p>
        <p className="text-sm mt-1">{error}</p>
        <div className="mt-3 text-xs text-red-200 space-y-1">
          <p className="font-medium">Troubleshooting:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1">
            <li>Verify HA_BASE_URL is correct and reachable</li>
            <li>Check if your Home Assistant token is valid</li>
            <li>Ensure Home Assistant is running and accessible</li>
          </ul>
        </div>
        <button
          onClick={refetch}
          className="mt-3 px-3 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-sm"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  if (entities.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 text-gray-300">
        <p className="font-medium">No Entities Found</p>
        <p className="text-sm mt-1 text-gray-400">
          Your Home Assistant instance doesn't have any entities, or they couldn't be loaded.
        </p>
        <div className="mt-3 text-xs text-gray-400 space-y-1">
          <p className="font-medium text-gray-300">Check:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1">
            <li>Home Assistant has devices/integrations configured</li>
            <li>Your access token has permission to read states</li>
            <li>The connection to Home Assistant is working</li>
          </ul>
        </div>
        <button
          onClick={refetch}
          className="mt-3 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm"
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className={`grid md:grid-cols-${GRID_COLUMNS} gap-3`}>
      {entities.map((e, index) => {
        const Icon = getEntityIcon(e.domain)
        const isOn = e.state === 'on'
        const isOff = e.state === 'off'
        const isUnavailable = e.state === 'unavailable' || e.state === 'unknown'

        return (
          <div
            key={e.entity_id}
            className="p-4 rounded-2xl bg-gray-900 border border-gray-800 relative animate-fadeIn transition-smooth hover:border-gray-700"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* State indicator dot */}
            {!isUnavailable && (
              <div className="absolute top-3 right-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    isOn ? 'bg-green-500' : isOff ? 'bg-gray-600' : 'bg-blue-500'
                  }`}
                  title={`State: ${e.state}`}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1 pr-4">
                <Icon className="text-2xl mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-gray-400 truncate">{e.entity_id}</div>
                  <div className="text-base font-medium truncate">{e.attributes.friendly_name || e.entity_id}</div>
                </div>
              </div>
              {(e.domain === 'light' || e.domain === 'switch') && (
                <button
                  onClick={() => toggle(e)}
                  disabled={toggleLoading === e.entity_id}
                  className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] min-h-[36px] touch-manipulation transition-all duration-200"
                >
                  {toggleLoading === e.entity_id ? 'Loading…' : (e.state === 'on' ? 'Turn off' : 'Turn on')}
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md ${
                  isOn
                    ? 'bg-green-900/30 text-green-300'
                    : isOff
                    ? 'bg-gray-800 text-gray-400'
                    : isUnavailable
                    ? 'bg-red-900/30 text-red-300'
                    : 'bg-blue-900/30 text-blue-300'
                }`}
              >
                {!isUnavailable && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isOn ? 'bg-green-500' : isOff ? 'bg-gray-500' : 'bg-blue-500'
                    }`}
                  />
                )}
                {e.state}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
