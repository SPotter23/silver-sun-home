'use client'

import { Thermometer, Blinds, Waves } from 'lucide-react'

interface QuickControl {
  id: string
  name: string
  icon: React.ReactNode
  value: string
  status: 'active' | 'inactive' | 'warning'
}

const controls: QuickControl[] = [
  {
    id: 'thermostat',
    name: 'Thermostat',
    icon: <Thermometer className="w-5 h-5" />,
    value: '72°F',
    status: 'active'
  },
  {
    id: 'blinds',
    name: 'Blinds',
    icon: <Blinds className="w-5 h-5" />,
    value: '50%',
    status: 'inactive'
  },
  {
    id: 'pool',
    name: 'Pool',
    icon: <Waves className="w-5 h-5" />,
    value: '78°F',
    status: 'active'
  }
]

interface QuickControlsProps {
  onControlClick?: (controlId: string) => void
}

export function QuickControls({ onControlClick }: QuickControlsProps) {
  const getStatusColor = (status: QuickControl['status']) => {
    switch (status) {
      case 'active':
        return 'from-blue-600 to-blue-700 border-blue-500/50'
      case 'warning':
        return 'from-orange-600 to-orange-700 border-orange-500/50'
      case 'inactive':
        return 'from-gray-700 to-gray-800 border-gray-600/50'
    }
  }

  const getTextColor = (status: QuickControl['status']) => {
    switch (status) {
      case 'active':
        return 'text-blue-100'
      case 'warning':
        return 'text-orange-100'
      case 'inactive':
        return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Quick Controls</h2>

      <div className="grid grid-cols-3 gap-3">
        {controls.map((control) => (
          <button
            key={control.id}
            onClick={() => onControlClick?.(control.id)}
            className={`group relative overflow-hidden rounded-xl p-4 transition-all hover:scale-[1.02] bg-gradient-to-br border ${getStatusColor(control.status)}`}
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
            </div>

            <div className="relative z-10 space-y-2">
              {/* Icon */}
              <div className="flex items-center justify-between">
                <div className="p-2 bg-white/20 rounded-lg text-white">
                  {control.icon}
                </div>
                {control.status === 'active' && (
                  <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50" />
                )}
                {control.status === 'warning' && (
                  <div className="w-2 h-2 bg-orange-400 rounded-full shadow-lg shadow-orange-400/50 animate-pulse" />
                )}
              </div>

              {/* Content */}
              <div className="text-left">
                <h3 className="text-sm font-medium text-white mb-0.5">
                  {control.name}
                </h3>
                <p className={`text-lg font-bold ${
                  control.status === 'inactive' ? 'text-gray-400' : 'text-white'
                }`}>
                  {control.value}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
