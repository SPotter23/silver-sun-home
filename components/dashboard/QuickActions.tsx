'use client'

import { Sunrise, Home, Film, Flame } from 'lucide-react'

interface QuickAction {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  description: string
}

const actions: QuickAction[] = [
  {
    id: 'good-morning',
    name: 'Good Morning',
    icon: <Sunrise className="w-5 h-5" />,
    color: 'from-amber-500 to-orange-500',
    description: 'Lights on, blinds open'
  },
  {
    id: 'away',
    name: 'Away',
    icon: <Home className="w-5 h-5" />,
    color: 'from-gray-600 to-gray-700',
    description: 'Lock doors, lights off'
  },
  {
    id: 'movie-night',
    name: 'Movie Night',
    icon: <Film className="w-5 h-5" />,
    color: 'from-purple-600 to-indigo-600',
    description: 'Dim lights, close blinds'
  },
  {
    id: 'pool-heat-boost',
    name: 'Pool Heat Boost',
    icon: <Flame className="w-5 h-5" />,
    color: 'from-cyan-500 to-blue-600',
    description: 'Heater on for 30min'
  }
]

interface QuickActionsProps {
  onActionClick?: (actionId: string) => void
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Quick Actions</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick?.(action.id)}
            className="group relative overflow-hidden rounded-xl p-4 transition-all hover:scale-[1.02] bg-gray-800 border border-gray-700 hover:border-gray-600"
          >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

            <div className="relative z-10 space-y-3">
              {/* Icon */}
              <div className={`inline-flex p-3 bg-gradient-to-br ${action.color} rounded-xl text-white shadow-lg`}>
                {action.icon}
              </div>

              {/* Content */}
              <div className="text-left">
                <h3 className="text-sm font-semibold text-white mb-1">
                  {action.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
