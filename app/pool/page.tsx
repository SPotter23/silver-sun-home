'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Waves, Droplets, Lightbulb, Flame, Zap, Thermometer, Wind, Gauge } from 'lucide-react'

export default function PoolPage() {
  const [poolTemp, setPoolTemp] = useState(78)
  const [spaTemp, setSpaTemp] = useState(99)
  const [poolLights, setPoolLights] = useState(false)
  const [spaLights, setSpaLights] = useState(true)
  const [poolHeater, setPoolHeater] = useState<'off' | 'auto' | 'on'>('auto')
  const [spaHeater, setSpaHeater] = useState<'off' | 'auto' | 'on'>('on')
  const [poolPump, setPoolPump] = useState(true)
  const [spaPump, setSpaPump] = useState(false)
  const [poolCleaner, setPoolCleaner] = useState(false)
  const [waterfall, setWaterfall] = useState(false)
  const [isBoostActive, setIsBoostActive] = useState(false)

  const handleBoost = () => {
    setIsBoostActive(true)
    setTimeout(() => setIsBoostActive(false), 5000)
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
          <h1 className="text-2xl font-bold text-white">Pool & Spa</h1>
        </div>

        {/* Temperature Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pool Temperature */}
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-6 shadow-xl border border-cyan-500/30">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Waves className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Pool</h2>
              </div>

              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-sm text-cyan-100 mb-2">Temperature</p>
                  <p className="text-5xl font-bold text-white">{poolTemp}°F</p>
                </div>
              </div>
            </div>
          </div>

          {/* Spa Temperature */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-xl border border-orange-500/30">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Droplets className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Spa</h2>
              </div>

              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-sm text-orange-100 mb-2">Temperature</p>
                  <p className="text-5xl font-bold text-white">{spaTemp}°F</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lights Controls */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Lights
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-gray-700/50 rounded-xl p-4">
              <span className="text-white">Pool Lights</span>
              <button
                onClick={() => setPoolLights(!poolLights)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  poolLights ? 'bg-cyan-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    poolLights ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between bg-gray-700/50 rounded-xl p-4">
              <span className="text-white">Spa Lights</span>
              <button
                onClick={() => setSpaLights(!spaLights)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  spaLights ? 'bg-orange-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    spaLights ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Heater Controls */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5" />
            Heaters
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pool Heater */}
            <div className="space-y-3">
              <p className="text-sm text-gray-300">Pool Heater</p>
              <div className="grid grid-cols-3 gap-2">
                {(['off', 'auto', 'on'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPoolHeater(mode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      poolHeater === mode
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Spa Heater */}
            <div className="space-y-3">
              <p className="text-sm text-gray-300">Spa Heater</p>
              <div className="grid grid-cols-3 gap-2">
                {(['off', 'auto', 'on'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSpaHeater(mode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      spaHeater === mode
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Heat Boost Button */}
          <div className="mt-4">
            <button
              onClick={handleBoost}
              disabled={isBoostActive}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
                isBoostActive
                  ? 'bg-orange-500 text-white'
                  : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500'
              }`}
            >
              <Zap className={`w-5 h-5 ${isBoostActive ? 'fill-white' : ''}`} />
              {isBoostActive ? 'Boost Active (30m)' : 'Heat Boost 30m'}
            </button>
          </div>
        </div>

        {/* Pumps & Equipment */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5" />
            Pumps & Equipment
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span className="text-white">Pool Pump</span>
              </div>
              <button
                onClick={() => setPoolPump(!poolPump)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  poolPump ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    poolPump ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-orange-400" />
                <span className="text-white">Spa Pump</span>
              </div>
              <button
                onClick={() => setSpaPump(!spaPump)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  spaPump ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    spaPump ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-blue-400" />
                <span className="text-white">Pool Cleaner</span>
              </div>
              <button
                onClick={() => setPoolCleaner(!poolCleaner)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  poolCleaner ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    poolCleaner ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span className="text-white">Waterfall</span>
              </div>
              <button
                onClick={() => setWaterfall(!waterfall)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  waterfall ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    waterfall ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
