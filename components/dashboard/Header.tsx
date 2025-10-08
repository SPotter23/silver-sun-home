'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, Sun, CloudSnow } from 'lucide-react'

interface HeaderProps {
  location?: string
  weatherTemp?: number
  weatherCondition?: 'sunny' | 'cloudy' | 'rainy' | 'snowy'
}

export function Header({
  location = 'Silver Sun Home',
  weatherTemp,
  weatherCondition = 'sunny'
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

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700/50">
      <div className="flex items-start justify-between">
        {/* Left: Location & Time */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">{location}</h1>
          <p className="text-sm text-gray-400">{formatDate(currentTime)}</p>
          <p className="text-3xl font-light text-gray-200 tabular-nums">
            {formatTime(currentTime)}
          </p>
        </div>

        {/* Right: Weather */}
        {weatherTemp !== undefined && (
          <div className="flex items-center gap-3 bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700/30">
            <WeatherIcon />
            <div className="text-right">
              <p className="text-2xl font-semibold text-white">{weatherTemp}°</p>
              <p className="text-xs text-gray-400 capitalize">{weatherCondition}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
