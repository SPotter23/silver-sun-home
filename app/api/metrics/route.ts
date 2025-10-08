import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

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
  // Authentication guard
  const supabase = supabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to access metrics.' },
      { status: 401 }
    )
  }
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
  // Authentication guard
  const supabase = supabaseServer()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to reset metrics.' },
      { status: 401 }
    )
  }

  metrics.apiCalls.entities = { count: 0, totalTime: 0, errors: 0 }
  metrics.apiCalls.serviceCall = { count: 0, totalTime: 0, errors: 0 }
  metrics.lastReset = Date.now()

  return NextResponse.json({ message: 'Metrics reset successfully' })
}
