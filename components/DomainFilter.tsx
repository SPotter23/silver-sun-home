'use client'

interface DomainFilterProps {
  selected: string
  onChange: (domain: string) => void
  domains: string[]
}

export function DomainFilter({ selected, onChange, domains }: DomainFilterProps) {
  const sortedDomains = ['all', ...domains.sort()]

  return (
    <div className="flex flex-wrap gap-2">
      {sortedDomains.map((domain) => (
        <button
          key={domain}
          onClick={() => onChange(domain)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors touch-manipulation active:scale-95 min-h-[36px] ${
            selected === domain
              ? 'bg-blue-600 text-white'
              : 'bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800'
          }`}
        >
          {domain === 'all' ? 'All' : domain.replace('_', ' ')}
        </button>
      ))}
    </div>
  )
}
