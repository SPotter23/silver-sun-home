import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  // Rate limiting to prevent health check abuse
  const identifier = getRequestIdentifier(req)
  const rateLimitResult = checkRateLimit(identifier, {
    maxRequests: 10, // 10 requests per minute for health checks
    windowMs: 60000,
  })

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many health check requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }

  const startTime = Date.now()
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      homeAssistant: { status: 'unknown', latency: 0, error: null as string | null },
      supabase: { status: 'unknown', latency: 0, error: null as string | null },
    },
  }

  // Check Home Assistant
  try {
    const haStart = Date.now()
    const res = await fetch(`${env.HA_BASE_URL}/api/`, {
      headers: { Authorization: `Bearer ${env.HA_TOKEN}` },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    checks.checks.homeAssistant.latency = Date.now() - haStart

    if (res.ok) {
      checks.checks.homeAssistant.status = 'healthy'
    } else {
      checks.checks.homeAssistant.status = 'unhealthy'
      checks.checks.homeAssistant.error = `HTTP ${res.status}`
    }
  } catch (error) {
    checks.checks.homeAssistant.status = 'unhealthy'
    checks.checks.homeAssistant.error =
      error instanceof Error ? error.message : 'Connection failed'
  }

  // Check Supabase (basic connectivity check)
  try {
    const supabaseStart = Date.now()
    const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
      signal: AbortSignal.timeout(5000),
    })

    checks.checks.supabase.latency = Date.now() - supabaseStart

    if (res.status === 200 || res.status === 404) {
      // 404 is expected without a table, just checking connectivity
      checks.checks.supabase.status = 'healthy'
    } else {
      checks.checks.supabase.status = 'unhealthy'
      checks.checks.supabase.error = `HTTP ${res.status}`
    }
  } catch (error) {
    checks.checks.supabase.status = 'unhealthy'
    checks.checks.supabase.error =
      error instanceof Error ? error.message : 'Connection failed'
  }

  // Overall status
  const allHealthy = Object.values(checks.checks).every(check => check.status === 'healthy')
  checks.status = allHealthy ? 'healthy' : 'degraded'

  const responseTime = Date.now() - startTime
  const statusCode = allHealthy ? 200 : 503

  return NextResponse.json(
    {
      ...checks,
      responseTime,
    },
    {
      status: statusCode,
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
      },
    }
  )
}
