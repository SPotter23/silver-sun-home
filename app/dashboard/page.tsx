'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { ThemesCarousel } from '@/components/dashboard/ThemesCarousel'
import { RoomsGrid } from '@/components/dashboard/RoomsGrid'
import { PoolSpaCard } from '@/components/dashboard/PoolSpaCard'
import { QuickControls } from '@/components/dashboard/QuickControls'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { BottomNavigation } from '@/components/dashboard/BottomNavigation'

export default function DashboardPage() {
  const [activeTheme, setActiveTheme] = useState<string>()
  const [activeTab, setActiveTab] = useState('home')
  const [poolLights, setPoolLights] = useState(false)
  const [spaLights, setSpaLights] = useState(true)
  const [heaterMode, setHeaterMode] = useState<'off' | 'auto' | 'on'>('auto')

  const handleThemeSelect = (themeId: string) => {
    setActiveTheme(themeId)
    console.log('Theme selected:', themeId)
  }

  const handleControlClick = (controlId: string) => {
    console.log('Control clicked:', controlId)
  }

  const handleActionClick = (actionId: string) => {
    console.log('Action clicked:', actionId)
  }

  const handleBoost = () => {
    console.log('Pool heat boost activated')
  }

  return (
    <>
      <main className="min-h-screen bg-gray-950 pb-24">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <Header
            location="Silver Sun Home"
            weatherTemp={75}
            weatherCondition="sunny"
            forecastHigh={82}
            forecastLow={68}
            uvIndex={7}
          />

          {/* Themes Carousel */}
          <ThemesCarousel
            activeTheme={activeTheme}
            onThemeSelect={handleThemeSelect}
          />

          {/* Rooms Grid */}
          <RoomsGrid />

          {/* Pool/Spa Card */}
          <PoolSpaCard
            poolTemp={78}
            spaTemp={99}
            poolLightsOn={poolLights}
            spaLightsOn={spaLights}
            heaterMode={heaterMode}
            onPoolLightsToggle={() => setPoolLights(!poolLights)}
            onSpaLightsToggle={() => setSpaLights(!spaLights)}
            onHeaterModeChange={setHeaterMode}
            onBoost={handleBoost}
          />

          {/* Quick Controls */}
          <QuickControls onControlClick={handleControlClick} />

          {/* Quick Actions */}
          <QuickActions onActionClick={handleActionClick} />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  )
}
