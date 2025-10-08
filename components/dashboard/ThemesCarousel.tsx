'use client'

import { useState } from 'react'
import { Moon, Sun, Home, PartyPopper, ChevronLeft, ChevronRight } from 'lucide-react'

interface Theme {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  description: string
}

const themes: Theme[] = [
  {
    id: 'cozy-evening',
    name: 'Cozy Evening',
    icon: <Moon className="w-5 h-5" />,
    color: 'from-purple-600 to-indigo-600',
    description: 'Dim lights, warm ambiance'
  },
  {
    id: 'morning-boost',
    name: 'Morning Boost',
    icon: <Sun className="w-5 h-5" />,
    color: 'from-orange-500 to-yellow-500',
    description: 'Bright lights, energizing'
  },
  {
    id: 'away',
    name: 'Away',
    icon: <Home className="w-5 h-5" />,
    color: 'from-gray-600 to-gray-700',
    description: 'Security mode, minimal power'
  },
  {
    id: 'pool-party',
    name: 'Pool Party',
    icon: <PartyPopper className="w-5 h-5" />,
    color: 'from-cyan-500 to-blue-600',
    description: 'Outdoor lights, music ready'
  }
]

interface ThemesCarouselProps {
  onThemeSelect?: (themeId: string) => void
  activeTheme?: string
}

export function ThemesCarousel({ onThemeSelect, activeTheme }: ThemesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTheme = () => {
    setCurrentIndex((prev) => (prev + 1) % themes.length)
  }

  const prevTheme = () => {
    setCurrentIndex((prev) => (prev - 1 + themes.length) % themes.length)
  }

  const handleThemeClick = (themeId: string) => {
    onThemeSelect?.(themeId)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Themes</h2>
        <div className="flex gap-2">
          <button
            onClick={prevTheme}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
            aria-label="Previous theme"
          >
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>
          <button
            onClick={nextTheme}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700"
            aria-label="Next theme"
          >
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out gap-4"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`
          }}
        >
          {themes.map((theme) => (
            <div
              key={theme.id}
              className="min-w-full"
            >
              <button
                onClick={() => handleThemeClick(theme.id)}
                className={`w-full group relative overflow-hidden rounded-2xl p-6 transition-all hover:scale-[1.02] ${
                  activeTheme === theme.id
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900'
                    : ''
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.color} opacity-90 group-hover:opacity-100 transition-opacity`} />

                <div className="relative z-10 flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {theme.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-xl font-bold text-white mb-1">{theme.name}</h3>
                    <p className="text-sm text-white/80">{theme.description}</p>
                  </div>
                  {activeTheme === theme.id && (
                    <div className="w-3 h-3 rounded-full bg-white shadow-lg" />
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2">
        {themes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-1.5 bg-gray-600 hover:bg-gray-500'
            }`}
            aria-label={`Go to theme ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
