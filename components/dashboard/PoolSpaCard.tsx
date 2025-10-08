'use client'

import { useState } from 'react'
import { Waves, Droplets, Lightbulb, Flame, Zap } from 'lucide-react'

interface PoolSpaCardProps {
  poolTemp?: number
  spaTemp?: number
  poolLightsOn?: boolean
  spaLightsOn?: boolean
  heaterMode?: 'off' | 'auto' | 'on'
  onPoolLightsToggle?: () => void
  onSpaLightsToggle?: () => void
  onHeaterModeChange?: (mode: 'off' | 'auto' | 'on') => void
  onBoost?: () => void
}

export function PoolSpaCard({
  poolTemp = 78,
  spaTemp = 99,
  poolLightsOn = false,
  spaLightsOn = true,
  heaterMode = 'auto',
  onPoolLightsToggle,
  onSpaLightsToggle,
  onHeaterModeChange,
  onBoost
}: PoolSpaCardProps) {
  const [isBoostActive, setIsBoostActive] = useState(false)

  const handleBoost = () => {
    setIsBoostActive(true)
    onBoost?.()
    // Reset after 30 minutes (for demo, we'll show for a few seconds)
    setTimeout(() => setIsBoostActive(false), 5000)
  }

  return (
    <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-6 shadow-xl border border-cyan-500/30">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Pool & Spa</h3>
        </div>

        {/* Temperature Display */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Waves className="w-4 h-4 text-cyan-200" />
              <span className="text-sm text-cyan-100">Pool</span>
            </div>
            <p className="text-3xl font-bold text-white">{poolTemp}°F</p>
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-orange-200" />
              <span className="text-sm text-orange-100">Spa</span>
            </div>
            <p className="text-3xl font-bold text-white">{spaTemp}°F</p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          {/* Lights */}
          <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Lightbulb className={`w-4 h-4 ${poolLightsOn ? 'text-yellow-300 fill-yellow-300' : 'text-gray-300'}`} />
              <span className="text-sm text-white">Pool Lights</span>
            </div>
            <button
              onClick={onPoolLightsToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                poolLightsOn ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  poolLightsOn ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Lightbulb className={`w-4 h-4 ${spaLightsOn ? 'text-yellow-300 fill-yellow-300' : 'text-gray-300'}`} />
              <span className="text-sm text-white">Spa Lights</span>
            </div>
            <button
              onClick={onSpaLightsToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                spaLightsOn ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  spaLightsOn ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Heater Mode */}
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-orange-300" />
              <span className="text-sm text-white">Heater Mode</span>
            </div>
            <div className="flex gap-2">
              {(['off', 'auto', 'on'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onHeaterModeChange?.(mode)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    heaterMode === mode
                      ? 'bg-white text-blue-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Boost Button */}
        <button
          onClick={handleBoost}
          disabled={isBoostActive}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
            isBoostActive
              ? 'bg-orange-500 text-white'
              : 'bg-white text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Zap className={`w-5 h-5 ${isBoostActive ? 'fill-white' : ''}`} />
          {isBoostActive ? 'Boost Active (30m)' : 'Heat Boost 30m'}
        </button>
      </div>
    </div>
  )
}
