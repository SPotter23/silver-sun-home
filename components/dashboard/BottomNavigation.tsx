'use client'

import { Home, Palette, Workflow, Boxes, Settings } from 'lucide-react'

interface NavItem {
  id: string
  name: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    id: 'home',
    name: 'Home',
    icon: <Home className="w-5 h-5" />
  },
  {
    id: 'themes',
    name: 'Themes',
    icon: <Palette className="w-5 h-5" />
  },
  {
    id: 'automations',
    name: 'Automations',
    icon: <Workflow className="w-5 h-5" />
  },
  {
    id: 'devices',
    name: 'Devices',
    icon: <Boxes className="w-5 h-5" />
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: <Settings className="w-5 h-5" />
  }
]

interface BottomNavigationProps {
  activeTab?: string
  onTabChange?: (tabId: string) => void
}

export function BottomNavigation({ activeTab = 'home', onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 safe-area-inset-bottom z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-white bg-blue-600'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className={isActive ? '' : 'group-hover:scale-110 transition-transform'}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium">{item.name}</span>
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
