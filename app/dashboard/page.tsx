'use client'

import { useState } from 'react'
import { Header } from '@/components/dashboard/Header'
import { ThemesCarousel } from '@/components/dashboard/ThemesCarousel'
import { RoomsGrid } from '@/components/dashboard/RoomsGrid'
import { PoolSpaCard } from '@/components/dashboard/PoolSpaCard'
import { SaunaCard } from '@/components/dashboard/SaunaCard'
import { QuickControls } from '@/components/dashboard/QuickControls'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { BottomNavigation } from '@/components/dashboard/BottomNavigation'

export default function DashboardPage() {
  const [activeTheme, setActiveTheme] = useState<string>()
  const [activeTab, setActiveTab] = useState('home')
  const [poolLights, setPoolLights] = useState(false)
  const [spaLights, setSpaLights] = useState(true)
  const [heaterMode, setHeaterMode] = useState<'off' | 'auto' | 'on'>('auto')
  const [saunaRunning, setSaunaRunning] = useState(false)
  const [saunaPreset, setSaunaPreset] = useState<'recovery' | 'gentle' | 'intense'>('recovery')

  const handleThemeSelect = (themeId: string) => {
    setActiveTheme(themeId)
    console.log('Theme selected:', themeId)
  }

  const handleRoomSelect = (roomId: string) => {
    console.log('Room selected:', roomId)
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
          />

          {/* Themes Carousel */}
          <ThemesCarousel
            activeTheme={activeTheme}
            onThemeSelect={handleThemeSelect}
          />

          {/* Rooms Grid */}
          <RoomsGrid onRoomSelect={handleRoomSelect} />

          {/* Pool/Spa & Sauna Cards */}
          <div className="grid md:grid-cols-2 gap-6">
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

            <SaunaCard
              temperature={175}
              targetTemp={180}
              isRunning={saunaRunning}
              timeRemaining={20}
              preset={saunaPreset}
              onStart={() => setSaunaRunning(true)}
              onStop={() => setSaunaRunning(false)}
              onPresetChange={setSaunaPreset}
            />
          </div>

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
