'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Thermometer, Blinds, Plus, Minus } from 'lucide-react'

const roomNames: Record<string, string> = {
  'master-bedroom': 'Master Bedroom',
  'master-bathroom': 'Master Bathroom',
  'guest-room-1': 'Guest Room 1',
  'guest-room-2': 'Guest Room 2',
  'casita': 'Casita',
  'living-room': 'Living Room',
  'kitchen': 'Kitchen',
  'office': 'Office'
}

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const roomName = roomNames[roomId] || 'Room'

  const [temperature, setTemperature] = useState(68)
  const [targetTemp, setTargetTemp] = useState(70)
  const [blindsPosition, setBlindsPosition] = useState(50)
  const [blinds2Position, setBlinds2Position] = useState(50)
  const [mode, setMode] = useState<'heat' | 'cool' | 'auto'>('auto')

  const adjustTargetTemp = (delta: number) => {
    setTargetTemp(prev => Math.max(60, Math.min(85, prev + delta)))
  }

  const adjustBlinds = (delta: number) => {
    setBlindsPosition(prev => Math.max(0, Math.min(100, prev + delta)))
  }

  const adjustBlinds2 = (delta: number) => {
    setBlinds2Position(prev => Math.max(0, Math.min(100, prev + delta)))
  }

  // Rooms with only blinds controls (no temperature control)
  const isBlindsOnly = ['master-bathroom', 'guest-room-1', 'guest-room-2'].includes(roomId)

  // Rooms with 2 blinds
  const hasTwoBlinds = ['kitchen', 'office', 'living-room'].includes(roomId)

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
          <h1 className="text-2xl font-bold text-white">{roomName}</h1>
        </div>

        {/* Temperature Control Card - Not shown for blinds-only rooms */}
        {!isBlindsOnly && (
          <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-6 shadow-xl border border-orange-500/30">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Thermometer className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Temperature</h2>
            </div>

            {/* Current & Target Temperature */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm text-orange-100 mb-1">Current</p>
                <p className="text-4xl font-bold text-white">{temperature}°</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-sm text-orange-100 mb-1">Target</p>
                <p className="text-4xl font-bold text-white">{targetTemp}°</p>
              </div>
            </div>

            {/* Temperature Controls */}
            <div className="flex items-center justify-center gap-4 py-4">
              <button
                onClick={() => adjustTargetTemp(-1)}
                className="p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <Minus className="w-6 h-6 text-white" />
              </button>
              <div className="text-center min-w-[100px]">
                <p className="text-sm text-orange-100">Adjust Target</p>
              </div>
              <button
                onClick={() => adjustTargetTemp(1)}
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
                    onClick={() => setMode(modeOption)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      mode === modeOption
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
        )}

        {/* Blinds Control Card(s) */}
        {hasTwoBlinds ? (
          // Two Blinds Layout for Kitchen and Office
          <div className="grid md:grid-cols-2 gap-6">
            {/* Blinds 1 */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl border border-blue-500/30">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Blinds className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Blinds 1</h2>
                </div>

                {/* Position Display */}
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-sm text-blue-100 mb-2">Position</p>
                    <p className="text-5xl font-bold text-white mb-4">{blindsPosition}%</p>

                    {/* Visual Indicator */}
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-white h-full transition-all duration-300 rounded-full"
                        style={{ width: `${blindsPosition}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Blinds Controls */}
                <div className="flex items-center justify-center gap-4 py-2">
                  <button
                    onClick={() => adjustBlinds(-10)}
                    className="p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <Minus className="w-6 h-6 text-white" />
                  </button>
                  <div className="text-center min-w-[100px]">
                    <p className="text-sm text-blue-100">Adjust Position</p>
                  </div>
                  <button
                    onClick={() => adjustBlinds(10)}
                    className="p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setBlindsPosition(0)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Closed
                  </button>
                  <button
                    onClick={() => setBlindsPosition(50)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Half
                  </button>
                  <button
                    onClick={() => setBlindsPosition(100)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>

            {/* Blinds 2 */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-xl border border-purple-500/30">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Blinds className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Blinds 2</h2>
                </div>

                {/* Position Display */}
                <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                  <div className="text-center">
                    <p className="text-sm text-purple-100 mb-2">Position</p>
                    <p className="text-5xl font-bold text-white mb-4">{blinds2Position}%</p>

                    {/* Visual Indicator */}
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-white h-full transition-all duration-300 rounded-full"
                        style={{ width: `${blinds2Position}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Blinds Controls */}
                <div className="flex items-center justify-center gap-4 py-2">
                  <button
                    onClick={() => adjustBlinds2(-10)}
                    className="p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <Minus className="w-6 h-6 text-white" />
                  </button>
                  <div className="text-center min-w-[100px]">
                    <p className="text-sm text-purple-100">Adjust Position</p>
                  </div>
                  <button
                    onClick={() => adjustBlinds2(10)}
                    className="p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setBlinds2Position(0)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Closed
                  </button>
                  <button
                    onClick={() => setBlinds2Position(50)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Half
                  </button>
                  <button
                    onClick={() => setBlinds2Position(100)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Single Blinds Layout
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl border border-blue-500/30">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Blinds className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Blinds</h2>
              </div>

            {/* Position Display */}
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-center">
                <p className="text-sm text-blue-100 mb-2">Position</p>
                <p className="text-5xl font-bold text-white mb-4">{blindsPosition}%</p>

                {/* Visual Indicator */}
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-300 rounded-full"
                    style={{ width: `${blindsPosition}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Blinds Controls */}
            <div className="flex items-center justify-center gap-4 py-2">
              <button
                onClick={() => adjustBlinds(-10)}
                className="p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <Minus className="w-6 h-6 text-white" />
              </button>
              <div className="text-center min-w-[100px]">
                <p className="text-sm text-blue-100">Adjust Position</p>
              </div>
              <button
                onClick={() => adjustBlinds(10)}
                className="p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <Plus className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setBlindsPosition(0)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
              >
                Closed
              </button>
              <button
                onClick={() => setBlindsPosition(50)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
              >
                Half
              </button>
              <button
                onClick={() => setBlindsPosition(100)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
              >
                Open
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </main>
  )
}
