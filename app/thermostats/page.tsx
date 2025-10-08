'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Thermometer, Plus, Minus } from 'lucide-react'

interface ThermostatState {
  id: string
  name: string
  currentTemp: number
  targetTemp: number
  mode: 'heat' | 'cool' | 'auto'
}

export default function ThermostatsPage() {
  const [thermostats, setThermostats] = useState<ThermostatState[]>([
    {
      id: 'main-house',
      name: 'Main House',
      currentTemp: 72,
      targetTemp: 70,
      mode: 'auto'
    },
    {
      id: 'master-bedroom',
      name: 'Master Bedroom',
      currentTemp: 68,
      targetTemp: 70,
      mode: 'auto'
    },
    {
      id: 'casita',
      name: 'Casita',
      currentTemp: 72,
      targetTemp: 72,
      mode: 'auto'
    }
  ])

  const adjustTargetTemp = (id: string, delta: number) => {
    setThermostats(prev => prev.map(t =>
      t.id === id
        ? { ...t, targetTemp: Math.max(60, Math.min(85, t.targetTemp + delta)) }
        : t
    ))
  }

  const setMode = (id: string, mode: 'heat' | 'cool' | 'auto') => {
    setThermostats(prev => prev.map(t =>
      t.id === id ? { ...t, mode } : t
    ))
  }

  return (
    <main className="min-h-screen bg-gray-950 pb-24">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <ChevronLeft className="w-6 h-6 text-gray-300" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Thermostats</h1>
        </div>

        {/* Thermostat Cards */}
        <div className="space-y-6">
          {thermostats.map((thermostat) => (
            <div
              key={thermostat.id}
              className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 shadow-xl border border-orange-500/30"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Thermometer className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{thermostat.name}</h2>
                </div>

                {/* Current & Target Temperature */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm text-orange-100 mb-1">Current</p>
                    <p className="text-4xl font-bold text-white">{thermostat.currentTemp}°</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-sm text-orange-100 mb-1">Target</p>
                    <p className="text-4xl font-bold text-white">{thermostat.targetTemp}°</p>
                  </div>
                </div>

                {/* Temperature Controls */}
                <div className="flex items-center justify-center gap-4 py-4">
                  <button
                    onClick={() => adjustTargetTemp(thermostat.id, -1)}
                    className="p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <Minus className="w-6 h-6 text-white" />
                  </button>
                  <div className="text-center min-w-[100px]">
                    <p className="text-sm text-orange-100">Adjust Target</p>
                  </div>
                  <button
                    onClick={() => adjustTargetTemp(thermostat.id, 1)}
                    className="p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Mode Selection */}
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-sm text-white mb-3">Mode</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['heat', 'cool', 'auto'] as const).map((modeOption) => (
                      <button
                        key={modeOption}
                        onClick={() => setMode(thermostat.id, modeOption)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          thermostat.mode === modeOption
                            ? 'bg-white text-orange-600'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {modeOption.charAt(0).toUpperCase() + modeOption.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
