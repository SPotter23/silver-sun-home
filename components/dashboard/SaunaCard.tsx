'use client'

import { useState, useEffect } from 'react'
import { Thermometer, Clock, Play, Square, Heart, Wind } from 'lucide-react'

interface SaunaCardProps {
  temperature?: number
  targetTemp?: number
  isRunning?: boolean
  timeRemaining?: number
  preset?: 'recovery' | 'gentle' | 'intense'
  onStart?: () => void
  onStop?: () => void
  onPresetChange?: (preset: 'recovery' | 'gentle' | 'intense') => void
}

export function SaunaCard({
  temperature = 175,
  targetTemp = 180,
  isRunning = false,
  timeRemaining = 20,
  preset = 'recovery',
  onStart,
  onStop,
  onPresetChange
}: SaunaCardProps) {
  const [currentTime, setCurrentTime] = useState(timeRemaining)

  useEffect(() => {
    if (isRunning && currentTime > 0) {
      const timer = setInterval(() => {
        setCurrentTime((prev) => Math.max(0, prev - 1))
      }, 60000) // Decrease every minute

      return () => clearInterval(timer)
    }
  }, [isRunning, currentTime])

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m`
    }
    return `${mins}m`
  }

  const presetConfig = {
    recovery: {
      icon: <Heart className="w-4 h-4" />,
      label: 'Recovery',
      temp: 165,
      time: 20,
      color: 'from-green-600 to-emerald-600'
    },
    gentle: {
      icon: <Wind className="w-4 h-4" />,
      label: 'Gentle',
      temp: 150,
      time: 30,
      color: 'from-blue-600 to-cyan-600'
    },
    intense: {
      icon: <Thermometer className="w-4 h-4" />,
      label: 'Intense',
      temp: 185,
      time: 15,
      color: 'from-orange-600 to-red-600'
    }
  }

  return (
    <div className={`bg-gradient-to-br ${presetConfig[preset].color} rounded-2xl p-6 shadow-xl border border-orange-500/30`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Thermometer className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Sauna</h3>
          </div>
          {isRunning && (
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-white">Running</span>
            </div>
          )}
        </div>

        {/* Temperature & Timer */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-4 h-4 text-orange-200" />
              <span className="text-sm text-orange-100">Temp</span>
            </div>
            <p className="text-3xl font-bold text-white">{temperature}°F</p>
            {isRunning && (
              <p className="text-xs text-orange-100 mt-1">Target: {targetTemp}°F</p>
            )}
          </div>

          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-200" />
              <span className="text-sm text-orange-100">Timer</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatTime(currentTime)}</p>
            {!isRunning && (
              <p className="text-xs text-orange-100 mt-1">Ready</p>
            )}
          </div>
        </div>

        {/* Preset Modes */}
        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
          <span className="text-sm text-white block mb-2">Preset Mode</span>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(presetConfig) as Array<keyof typeof presetConfig>).map((presetKey) => {
              const config = presetConfig[presetKey]
              return (
                <button
                  key={presetKey}
                  onClick={() => onPresetChange?.(presetKey)}
                  disabled={isRunning}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    preset === presetKey
                      ? 'bg-white text-orange-600'
                      : 'bg-white/20 text-white hover:bg-white/30 disabled:opacity-50'
                  }`}
                >
                  {config.icon}
                  <span>{config.label}</span>
                  <span className="text-xs opacity-80">{config.temp}°F</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Control Button */}
        <button
          onClick={isRunning ? onStop : onStart}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
            isRunning
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-white text-orange-600 hover:bg-orange-50'
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-5 h-5" />
              Stop Session
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Session
            </>
          )}
        </button>
      </div>
    </div>
  )
}
