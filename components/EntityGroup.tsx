'use client'

import { useState } from 'react'
import { HAEntity } from '@/types/home-assistant'
import { getEntityIcon } from '@/lib/icons'

interface EntityGroupProps {
  title: string
  entities: HAEntity[]
  defaultExpanded?: boolean
  onToggle: (entity: HAEntity) => void
  toggleLoading: string | null
}

export function EntityGroup({
  title,
  entities,
  defaultExpanded = true,
  onToggle,
  toggleLoading,
}: EntityGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  if (entities.length === 0) return null

  return (
    <div className="animate-fadeIn">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-900/50 border border-gray-800 hover:bg-gray-800/50 transition-colors mb-3"
      >
        <div className="flex items-center gap-2">
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h3 className="font-medium">{title}</h3>
          <span className="text-sm text-gray-500">({entities.length})</span>
        </div>
      </button>

      {isExpanded && (
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          {entities.map((e, index) => {
            const Icon = getEntityIcon(e.domain)
            const isOn = e.state === 'on'
            const isOff = e.state === 'off'
            const isUnavailable = e.state === 'unavailable' || e.state === 'unknown'

            return (
              <div
                key={e.entity_id}
                className="p-4 rounded-2xl bg-gray-900 border border-gray-800 relative animate-slideUp transition-smooth hover:border-gray-700"
                style={{ animationDelay: `${index * 0.03}s` }}
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
                      <div className="text-base font-medium truncate">
                        {e.attributes.friendly_name || e.entity_id}
                      </div>
                    </div>
                  </div>
                  {(e.domain === 'light' || e.domain === 'switch') && (
                    <button
                      onClick={() => onToggle(e)}
                      disabled={toggleLoading === e.entity_id}
                      className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] min-h-[36px] touch-manipulation transition-all duration-200"
                    >
                      {toggleLoading === e.entity_id
                        ? 'Loading…'
                        : e.state === 'on'
                        ? 'Turn off'
                        : 'Turn on'}
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
      )}
    </div>
  )
}
