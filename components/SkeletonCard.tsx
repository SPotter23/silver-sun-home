/**
 * Skeleton loading placeholder for entity cards
 */

export function SkeletonCard() {
  return (
    <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon skeleton */}
          <div className="w-6 h-6 bg-gray-800 rounded-full" />

          <div className="flex-1 space-y-2">
            {/* Entity ID skeleton */}
            <div className="h-3 bg-gray-800 rounded w-32" />
            {/* Friendly name skeleton */}
            <div className="h-4 bg-gray-800 rounded w-40" />
          </div>
        </div>

        {/* Button skeleton */}
        <div className="h-8 w-20 bg-gray-800 rounded-xl" />
      </div>

      {/* State badge skeleton */}
      <div className="mt-3 h-6 bg-gray-800 rounded-md w-16" />
    </div>
  )
}

/**
 * Grid of skeleton cards
 */
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
