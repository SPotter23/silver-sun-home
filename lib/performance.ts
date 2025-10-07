/**
 * Performance monitoring utilities
 */

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private timers = new Map<string, number>()

  /**
   * Start timing an operation
   */
  start(name: string): void {
    this.timers.set(name, performance.now())
  }

  /**
   * End timing and record metric
   */
  end(name: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(name)
    if (!startTime) {
      console.warn(`Performance timer "${name}" was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.timers.delete(name)

    this.recordMetric(name, duration, metadata)
    return duration
  }

  /**
   * Record a metric directly
   */
  recordMetric(name: string, duration: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    }

    this.metrics.push(metric)

    // Log slow operations in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, metadata)
    }

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics.shift()
    }
  }

  /**
   * Get metrics by name
   */
  getMetrics(name?: string): PerformanceMetric[] {
    if (!name) return this.metrics

    return this.metrics.filter(m => m.name === name)
  }

  /**
   * Get average duration for a metric
   */
  getAverage(name: string): number {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return 0

    const sum = metrics.reduce((acc, m) => acc + m.duration, 0)
    return sum / metrics.length
  }

  /**
   * Get percentile for a metric
   */
  getPercentile(name: string, percentile: number): number {
    const metrics = this.getMetrics(name).sort((a, b) => a.duration - b.duration)
    if (metrics.length === 0) return 0

    const index = Math.ceil((percentile / 100) * metrics.length) - 1
    return metrics[index]?.duration || 0
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avg: number; p95: number; p99: number }> {
    const summary: Record<string, any> = {}
    const uniqueNames = new Set(this.metrics.map(m => m.name))

    for (const name of uniqueNames) {
      summary[name] = {
        count: this.getMetrics(name).length,
        avg: this.getAverage(name),
        p95: this.getPercentile(name, 95),
        p99: this.getPercentile(name, 99),
      }
    }

    return summary
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
    this.timers.clear()
  }
}

export const perfMonitor = new PerformanceMonitor()

/**
 * Measure Web Vitals
 */
export function measureWebVitals(): void {
  if (typeof window === 'undefined') return

  // Use the Web Vitals API if available
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        perfMonitor.recordMetric('LCP', lastEntry.renderTime || lastEntry.loadTime)
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (e) {
      // LCP not supported
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          perfMonitor.recordMetric('FID', entry.processingStart - entry.startTime)
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })
    } catch (e) {
      // FID not supported
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            perfMonitor.recordMetric('CLS', clsValue)
          }
        })
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      // CLS not supported
    }
  }

  // Time to First Byte
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing
    const ttfb = timing.responseStart - timing.requestStart
    if (ttfb > 0) {
      perfMonitor.recordMetric('TTFB', ttfb)
    }
  }
}

/**
 * Track API call performance
 */
export async function trackAPICall<T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> {
  perfMonitor.start(name)

  try {
    const result = await apiCall()
    perfMonitor.end(name, { success: true })
    return result
  } catch (error) {
    perfMonitor.end(name, { success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    throw error
  }
}
