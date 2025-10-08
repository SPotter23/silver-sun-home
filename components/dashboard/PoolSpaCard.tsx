'use client'

import { Waves, Droplets, Lightbulb, Flame } from 'lucide-react'

interface PoolSpaCardProps {
  poolTemp?: number
  spaTemp?: number
  poolLightsOn?: boolean
  spaLightsOn?: boolean
  heaterMode?: 'off' | 'auto' | 'on'
}

export function PoolSpaCard({
  poolTemp = 78,
  spaTemp = 99,
  poolLightsOn = false,
  spaLightsOn = true,
  heaterMode = 'auto'
}: PoolSpaCardProps) {

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

        {/* Status Display */}
        <div className="space-y-2">
          {/* Lights Status */}
          <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Lightbulb className={`w-4 h-4 ${poolLightsOn ? 'text-yellow-300 fill-yellow-300' : 'text-gray-300'}`} />
              <span className="text-sm text-white">Pool Lights</span>
            </div>
            <span className="text-sm font-medium text-white">{poolLightsOn ? 'On' : 'Off'}</span>
          </div>

          <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Lightbulb className={`w-4 h-4 ${spaLightsOn ? 'text-yellow-300 fill-yellow-300' : 'text-gray-300'}`} />
              <span className="text-sm text-white">Spa Lights</span>
            </div>
            <span className="text-sm font-medium text-white">{spaLightsOn ? 'On' : 'Off'}</span>
          </div>

          {/* Heater Status */}
          <div className="flex items-center justify-between bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-300" />
              <span className="text-sm text-white">Heater</span>
            </div>
            <span className="text-sm font-medium text-white capitalize">{heaterMode}</span>
          </div>
        </div>

        {/* Click to view more */}
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm text-center">
          <p className="text-sm text-white/70">Click for full controls</p>
        </div>
      </div>
    </div>
  )
}
