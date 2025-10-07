import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Simple in-memory metrics storage
const metrics = {
  apiCalls: {
    entities: { count: 0, totalTime: 0, errors: 0 },
    serviceCall: { count: 0, totalTime: 0, errors: 0 },
  },
  lastReset: Date.now(),
}

/**
 * Get metrics endpoint
 */
export async function GET() {
  const uptime = Date.now() - metrics.lastReset

  const summary = {
    uptime,
    endpoints: {
      entities: {
        calls: metrics.apiCalls.entities.count,
        avgResponseTime:
          metrics.apiCalls.entities.count > 0
            ? metrics.apiCalls.entities.totalTime / metrics.apiCalls.entities.count
            : 0,
        errors: metrics.apiCalls.entities.errors,
        errorRate:
          metrics.apiCalls.entities.count > 0
            ? (metrics.apiCalls.entities.errors / metrics.apiCalls.entities.count) * 100
            : 0,
      },
      serviceCall: {
        calls: metrics.apiCalls.serviceCall.count,
        avgResponseTime:
          metrics.apiCalls.serviceCall.count > 0
            ? metrics.apiCalls.serviceCall.totalTime / metrics.apiCalls.serviceCall.count
            : 0,
        errors: metrics.apiCalls.serviceCall.errors,
        errorRate:
          metrics.apiCalls.serviceCall.count > 0
            ? (metrics.apiCalls.serviceCall.errors / metrics.apiCalls.serviceCall.count) * 100
            : 0,
      },
    },
  }

  return NextResponse.json(summary)
}

/**
 * Reset metrics endpoint
 */
export async function DELETE() {
  metrics.apiCalls.entities = { count: 0, totalTime: 0, errors: 0 }
  metrics.apiCalls.serviceCall = { count: 0, totalTime: 0, errors: 0 }
  metrics.lastReset = Date.now()

  return NextResponse.json({ message: 'Metrics reset successfully' })
}
