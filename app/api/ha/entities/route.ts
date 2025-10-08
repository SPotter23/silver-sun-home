import { NextResponse } from 'next/server'
import { HAEntity } from '@/types/home-assistant'
import { env } from '@/lib/env'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from '@/lib/constants'
import { supabaseServer } from '@/lib/supabaseServer'

// Mark as dynamic route
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // Authentication guard
    const supabase = supabaseServer()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to access this endpoint.' },
        { status: 401 }
      )
    }

    // Rate limiting
    const identifier = getRequestIdentifier(req)
    const rateLimitResult = checkRateLimit(identifier, {
      maxRequests: RATE_LIMIT_MAX_REQUESTS,
      windowMs: RATE_LIMIT_WINDOW_MS,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
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

    const { HA_BASE_URL: base, HA_TOKEN: token } = env

    const res = await fetch(`${base}/api/states`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('HA API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch entities from Home Assistant' },
        { status: 500 }
      )
    }

    const raw = await res.json()

    // Enrich with domain for convenience
    const items: HAEntity[] = raw.map((r: any) => ({
      ...r,
      domain: r.entity_id.split('.')[0]
    }))

    return NextResponse.json(items, {
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching HA entities:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
