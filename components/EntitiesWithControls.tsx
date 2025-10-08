'use client'

import { useState, useMemo } from 'react'
import { Entities } from './Entities'
import { EntityGroup } from './EntityGroup'
import { SearchBar } from './SearchBar'
import { DomainFilter } from './DomainFilter'
import { useEntities, invalidateEntitiesCache } from '@/hooks/useEntities'
import { useRealtimeEntities } from '@/hooks/useRealtimeEntities'
import { HAEntity } from '@/types/home-assistant'

interface EntitiesWithControlsProps {
  defaultAutoRefresh?: boolean
  defaultRealtime?: boolean
}

export function EntitiesWithControls({
  defaultAutoRefresh = false,
  defaultRealtime = true
}: EntitiesWithControlsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(defaultAutoRefresh)
  const [realtimeEnabled, setRealtimeEnabled] = useState(defaultRealtime)
  const [groupByDomain, setGroupByDomain] = useState(false)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)

  // Fetch initial entities (with optional polling)
  const { entities: polledEntities, refetch } = useEntities(autoRefresh, 30000)

  // Real-time updates via SSE
  const { entities: realtimeEntities, isConnected } = useRealtimeEntities(polledEntities, {
    enabled: realtimeEnabled,
  })

  // Use real-time entities if enabled, otherwise use polled entities
  const entities = realtimeEnabled ? realtimeEntities : polledEntities

  // Get unique domains from entities
  const domains = useMemo(() => {
    const domainSet = new Set(entities.map(e => e.domain))
    return Array.from(domainSet)
  }, [entities])

  // Filter entities by domain
  const filteredByDomain = selectedDomain === 'all'
    ? entities
    : entities.filter(e => e.domain === selectedDomain)

  // Apply search to filtered entities
  const filteredEntities = filteredByDomain.filter(e => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      e.entity_id.toLowerCase().includes(query) ||
      e.attributes.friendly_name?.toLowerCase().includes(query)
    )
  })

  const resultCount = filteredEntities.length
  const totalCount = entities.length

  // Group entities by domain
  const groupedEntities = useMemo(() => {
    const groups: Record<string, HAEntity[]> = {}
    filteredEntities.forEach(entity => {
      if (!groups[entity.domain]) {
        groups[entity.domain] = []
      }
      groups[entity.domain].push(entity)
    })
    return groups
  }, [filteredEntities])

  const handleToggle = async (entity: HAEntity) => {
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

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or entity ID..."
          />
          <div className="flex gap-2">
            <button
              onClick={() => setGroupByDomain(!groupByDomain)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm transition-colors touch-manipulation active:scale-95 min-h-[44px] ${
                groupByDomain
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800'
              }`}
              title={groupByDomain ? 'Grouped view' : 'List view'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span className="hidden sm:inline">{groupByDomain ? 'Grouped' : 'List'}</span>
            </button>
            <button
              onClick={() => setRealtimeEnabled(!realtimeEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm transition-colors touch-manipulation active:scale-95 min-h-[44px] ${
                realtimeEnabled && isConnected
                  ? 'bg-green-900/30 text-green-300 border border-green-800'
                  : realtimeEnabled && !isConnected
                  ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800'
              }`}
              title={
                realtimeEnabled && isConnected
                  ? 'Real-time updates active'
                  : realtimeEnabled && !isConnected
                  ? 'Connecting to real-time updates...'
                  : 'Real-time updates disabled'
              }
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="hidden sm:inline">
                {realtimeEnabled && isConnected
                  ? 'Real-time'
                  : realtimeEnabled
                  ? 'Connecting...'
                  : 'Real-time Off'}
              </span>
              {realtimeEnabled && isConnected && (
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap text-sm transition-colors touch-manipulation active:scale-95 min-h-[44px] ${
                autoRefresh
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800'
              }`}
              title={autoRefresh ? 'Polling enabled (30s)' : 'Polling disabled'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">{autoRefresh ? 'Polling On' : 'Polling Off'}</span>
            </button>
          </div>
        </div>
        {!groupByDomain && (
          <DomainFilter
            selected={selectedDomain}
            onChange={setSelectedDomain}
            domains={domains}
          />
        )}
        {(searchQuery || selectedDomain !== 'all') && (
          <p className="text-xs text-gray-400">
            Showing {resultCount} of {totalCount} entities
          </p>
        )}
      </div>

      {groupByDomain ? (
        <div className="space-y-2">
          {Object.entries(groupedEntities)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([domain, domainEntities]) => (
              <EntityGroup
                key={domain}
                title={domain.replace('_', ' ').toUpperCase()}
                entities={domainEntities}
                onToggle={handleToggle}
                toggleLoading={toggleLoading}
              />
            ))}
        </div>
      ) : (
        <Entities autoRefresh={autoRefresh} searchQuery={searchQuery} />
      )}
    </div>
  )
}
