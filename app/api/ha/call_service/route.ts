import { NextResponse } from 'next/server'
import { HAServiceCall } from '@/types/home-assistant'
import { env } from '@/lib/env'
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit'
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_SERVICE_CALLS } from '@/lib/constants'
import {
  isValidEntityId,
  isValidDomain,
  isValidService,
  isValidServiceData,
} from '@/lib/validation'

// Mark as dynamic route
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    // Rate limiting (stricter for service calls)
    const identifier = getRequestIdentifier(req)
    const rateLimitResult = checkRateLimit(identifier, {
      maxRequests: RATE_LIMIT_MAX_SERVICE_CALLS,
      windowMs: RATE_LIMIT_WINDOW_MS,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many service calls. Please try again later.' },
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

    const body: HAServiceCall = await req.json()
    const { domain, service, entity_id, data } = body

    // Validate required fields
    if (!domain || !service || !entity_id) {
      return NextResponse.json(
        { error: 'Missing required fields: domain, service, or entity_id' },
        { status: 400 }
      )
    }

    // Validate entity_id format
    if (!isValidEntityId(entity_id)) {
      return NextResponse.json(
        { error: 'Invalid entity_id format. Must be: domain.object_id' },
        { status: 400 }
      )
    }

    // Validate domain
    if (!isValidDomain(domain)) {
      return NextResponse.json(
        { error: 'Invalid or unsupported domain' },
        { status: 400 }
      )
    }

    // Validate service name
    if (!isValidService(service)) {
      return NextResponse.json(
        { error: 'Invalid service name format' },
        { status: 400 }
      )
    }

    // Validate service data if provided
    if (data && !isValidServiceData(data)) {
      return NextResponse.json(
        { error: 'Invalid service data format' },
        { status: 400 }
      )
    }

    const res = await fetch(`${base}/api/services/${domain}/${service}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ entity_id, ...(data || {}) })
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('HA service call error:', errorText)
      return NextResponse.json(
        { error: 'Failed to call Home Assistant service' },
        { status: 500 }
      )
    }

    const json = await res.json().catch(() => ({}))
    return NextResponse.json(json, {
      status: 200,
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
      },
    })
  } catch (error) {
    console.error('Error calling HA service:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
