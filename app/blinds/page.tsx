'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Blinds, Plus, Minus } from 'lucide-react'

interface BlindControl {
  id: string
  room: string
  name: string
  position: number
}

export default function BlindsPage() {
  const [blinds, setBlinds] = useState<BlindControl[]>([
    { id: 'master-bedroom-1', room: 'Master Bedroom', name: 'Blinds 1', position: 50 },
    { id: 'master-bedroom-2', room: 'Master Bedroom', name: 'Blinds 2', position: 50 },
    { id: 'master-bathroom-1', room: 'Master Bathroom', name: 'Blinds 1', position: 30 },
    { id: 'master-bathroom-2', room: 'Master Bathroom', name: 'Blinds 2', position: 30 },
    { id: 'guest-room-1', room: 'Guest Room 1', name: 'Blinds', position: 0 },
    { id: 'guest-room-2', room: 'Guest Room 2', name: 'Blinds', position: 0 },
    { id: 'casita-1', room: 'Casita', name: 'Blinds 1', position: 75 },
    { id: 'casita-2', room: 'Casita', name: 'Blinds 2', position: 75 },
    { id: 'living-room-1', room: 'Living Room', name: 'Blinds 1', position: 60 },
    { id: 'living-room-2', room: 'Living Room', name: 'Blinds 2', position: 60 },
    { id: 'kitchen-1', room: 'Kitchen', name: 'Blinds 1', position: 40 },
    { id: 'kitchen-2', room: 'Kitchen', name: 'Blinds 2', position: 40 },
    { id: 'office-1', room: 'Office', name: 'Blinds 1', position: 80 },
    { id: 'office-2', room: 'Office', name: 'Blinds 2', position: 80 },
  ])

  const adjustBlinds = (id: string, delta: number) => {
    setBlinds(prev => prev.map(blind =>
      blind.id === id
        ? { ...blind, position: Math.max(0, Math.min(100, blind.position + delta)) }
        : blind
    ))
  }

  const setPosition = (id: string, position: number) => {
    setBlinds(prev => prev.map(blind =>
      blind.id === id ? { ...blind, position } : blind
    ))
  }

  const setAllBlinds = (position: number) => {
    setBlinds(prev => prev.map(blind => ({ ...blind, position })))
  }

  // Group blinds by room
  const blindsByRoom = blinds.reduce((acc, blind) => {
    if (!acc[blind.room]) {
      acc[blind.room] = []
    }
    acc[blind.room].push(blind)
    return acc
  }, {} as Record<string, BlindControl[]>)

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
          <h1 className="text-2xl font-bold text-white">All Blinds</h1>
        </div>

        {/* Global Controls */}
        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Control All Blinds</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setAllBlinds(0)}
              className="px-4 py-3 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-xl text-white font-medium transition-colors border border-gray-600"
            >
              Close All
            </button>
            <button
              onClick={() => setAllBlinds(50)}
              className="px-4 py-3 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl text-white font-medium transition-colors"
            >
              Half Open
            </button>
            <button
              onClick={() => setAllBlinds(100)}
              className="px-4 py-3 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 rounded-xl text-white font-medium transition-colors"
            >
              Open All
            </button>
          </div>
        </div>

        {/* Blinds by Room */}
        {Object.entries(blindsByRoom).map(([room, roomBlinds]) => (
          <div key={room} className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">{room}</h3>
            <div className="space-y-4">
              {roomBlinds.map((blind) => (
                <div key={blind.id} className="bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Blinds className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">{blind.name}</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{blind.position}%</span>
                  </div>

                  {/* Visual Indicator */}
                  <div className="w-full bg-gray-600 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${blind.position}%` }}
                    />
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => adjustBlinds(blind.id, -10)}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>

                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPosition(blind.id, 0)}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-xs font-medium text-white transition-colors"
                      >
                        Closed
                      </button>
                      <button
                        onClick={() => setPosition(blind.id, 50)}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-xs font-medium text-white transition-colors"
                      >
                        Half
                      </button>
                      <button
                        onClick={() => setPosition(blind.id, 100)}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-xs font-medium text-white transition-colors"
                      >
                        Open
                      </button>
                    </div>

                    <button
                      onClick={() => adjustBlinds(blind.id, 10)}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
