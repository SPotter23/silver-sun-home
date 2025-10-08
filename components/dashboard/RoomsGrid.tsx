'use client'

import Link from 'next/link'
import { Sofa, UtensilsCrossed, Bed, Bath, Users, Home, Briefcase, Lightbulb } from 'lucide-react'

interface Room {
  id: string
  name: string
  icon: React.ReactNode
  devicesOn: number
  totalDevices: number
  temperature?: number
}

const rooms: Room[] = [
  {
    id: 'master-bedroom',
    name: 'Master Bedroom',
    icon: <Bed className="w-6 h-6" />,
    devicesOn: 2,
    totalDevices: 6,
    temperature: 68
  },
  {
    id: 'master-bathroom',
    name: 'Master Bathroom',
    icon: <Bath className="w-6 h-6" />,
    devicesOn: 1,
    totalDevices: 4,
    temperature: 70
  },
  {
    id: 'guest-room-1',
    name: 'Guest Room 1',
    icon: <Users className="w-6 h-6" />,
    devicesOn: 0,
    totalDevices: 4,
    temperature: 71
  },
  {
    id: 'guest-room-2',
    name: 'Guest Room 2',
    icon: <Users className="w-6 h-6" />,
    devicesOn: 0,
    totalDevices: 4,
    temperature: 71
  },
  {
    id: 'casita',
    name: 'Casita',
    icon: <Home className="w-6 h-6" />,
    devicesOn: 0,
    totalDevices: 8,
    temperature: 72
  },
  {
    id: 'living-room',
    name: 'Living Room',
    icon: <Sofa className="w-6 h-6" />,
    devicesOn: 3,
    totalDevices: 8,
    temperature: 72
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    icon: <UtensilsCrossed className="w-6 h-6" />,
    devicesOn: 2,
    totalDevices: 5,
    temperature: 71
  },
  {
    id: 'office',
    name: 'Office',
    icon: <Briefcase className="w-6 h-6" />,
    devicesOn: 1,
    totalDevices: 5,
    temperature: 70
  }
]

export function RoomsGrid() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white">Rooms</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {rooms.map((room) => {
          const hasActiveDevices = room.devicesOn > 0

          return (
            <Link
              key={room.id}
              href={`/rooms/${room.id}`}
              className={`group relative overflow-hidden rounded-2xl p-4 transition-all hover:scale-[1.02] border block ${
                hasActiveDevices
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500/50'
                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
              </div>

              <div className="relative z-10 space-y-3">
                {/* Icon & Name */}
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${
                    hasActiveDevices
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-700/50 text-gray-300'
                  }`}>
                    {room.icon}
                  </div>
                  {hasActiveDevices && (
                    <Lightbulb className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  )}
                </div>

                {/* Room name */}
                <div className="text-left">
                  <h3 className={`font-semibold ${
                    hasActiveDevices ? 'text-white' : 'text-gray-200'
                  }`}>
                    {room.name}
                  </h3>
                  <p className={`text-xs ${
                    hasActiveDevices ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {room.devicesOn} of {room.totalDevices} on
                  </p>
                </div>

                {/* Temperature */}
                {room.temperature && (
                  <div className={`text-sm font-medium ${
                    hasActiveDevices ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {room.temperature}°F
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
