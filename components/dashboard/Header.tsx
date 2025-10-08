'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow, TrendingUp, TrendingDown } from 'lucide-react'

interface HeaderProps {
  location?: string
  weatherTemp?: number
  weatherCondition?: 'sunny' | 'cloudy' | 'rainy' | 'snowy'
  forecastHigh?: number
  forecastLow?: number
  uvIndex?: number
}

export function Header({
  location = 'Silver Sun Home',
  weatherTemp,
  weatherCondition = 'sunny',
  forecastHigh,
  forecastLow,
  uvIndex
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const WeatherIcon = () => {
    switch (weatherCondition) {
      case 'sunny':
        return <Sun className="w-6 h-6 text-yellow-400" />
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-gray-400" />
      case 'rainy':
        return <CloudRain className="w-6 h-6 text-blue-400" />
      case 'snowy':
        return <CloudSnow className="w-6 h-6 text-blue-200" />
      default:
        return <Sun className="w-6 h-6 text-yellow-400" />
    }
  }

  const getUVLevel = (uv: number) => {
    if (uv <= 2) return { level: 'Low', color: 'text-green-400' }
    if (uv <= 5) return { level: 'Moderate', color: 'text-yellow-400' }
    if (uv <= 7) return { level: 'High', color: 'text-orange-400' }
    if (uv <= 10) return { level: 'Very High', color: 'text-red-400' }
    return { level: 'Extreme', color: 'text-purple-400' }
  }

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700/50">
      <div className="flex items-start justify-between gap-6">
        {/* Left: Location & Time */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">{location}</h1>
          <p className="text-sm text-gray-400">{formatDate(currentTime)}</p>
          <p className="text-3xl font-light text-gray-200 tabular-nums">
            {formatTime(currentTime)}
          </p>
        </div>

        {/* Right: Weather Card */}
        {weatherTemp !== undefined && (
          <div className="bg-gray-800/50 rounded-xl px-5 py-4 border border-gray-700/30 min-w-[240px]">
            <div className="space-y-3">
              {/* Current Weather */}
              <div className="flex items-center gap-3">
                <WeatherIcon />
                <div>
                  <p className="text-3xl font-bold text-white">{weatherTemp}°</p>
                  <p className="text-xs text-gray-400 capitalize">{weatherCondition}</p>
                </div>
              </div>

              {/* Forecast High/Low */}
              {(forecastHigh !== undefined || forecastLow !== undefined) && (
                <div className="flex items-center gap-4 text-sm">
                  {forecastHigh !== undefined && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">{forecastHigh}°</span>
                    </div>
                  )}
                  {forecastLow !== undefined && (
                    <div className="flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">{forecastLow}°</span>
                    </div>
                  )}
                </div>
              )}

              {/* UV Index */}
              {uvIndex !== undefined && (
                <div className="pt-2 border-t border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-gray-400">UV Index</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{uvIndex}</p>
                      <p className={`text-xs font-medium ${getUVLevel(uvIndex).color}`}>
                        {getUVLevel(uvIndex).level}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
