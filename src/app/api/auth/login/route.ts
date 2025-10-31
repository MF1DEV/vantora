import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { loginSchema, validateRequest } from '@/lib/utils/validation'
import { logAuditEvent, getClientIp, getUserAgent } from '@/lib/utils/audit'
import { rateLimit, getRateLimitIdentifier, RateLimitConfig } from '@/lib/utils/rateLimit'
import { requireCsrfToken } from '@/lib/utils/csrf'

export const dynamic = 'force-dynamic'

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-csrf-token',
    },
  })
}

export async function POST(request: NextRequest) {
  console.log('=== Login API Called ===')
  try {
    const requestUrl = new URL(request.url)
    const supabase = await createClient()

    // Validate CSRF token
    try {
      await requireCsrfToken(request)
      console.log('CSRF validation passed')
    } catch (error) {
      console.error('CSRF validation failed:', error)
      return NextResponse.json(
        { error: 'Invalid CSRF token. Please refresh the page and try again.' },
        { status: 403 }
      )
    }

    // Apply rate limiting
    const ip = getClientIp(request)
    const identifier = getRateLimitIdentifier(ip)
    const rateLimitResult = await rateLimit(identifier, RateLimitConfig.auth.login)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          },
        }
      )
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json()
    } catch (error) {
      console.error('JSON parse error:', error)
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    const validation = await validateRequest(loginSchema, body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { email, password } = validation.data

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Log failed login attempt
      await logAuditEvent({
        eventType: 'failed_login',
        eventData: { email, reason: error.message },
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      })
      
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Log successful login
    if (authData.user) {
      await logAuditEvent({
        userId: authData.user.id,
        eventType: 'login',
        eventData: { email },
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      })
    }

    return NextResponse.json({
      message: 'Logged in successfully',
    }, {
      status: 200,
      headers: {
        'Location': requestUrl.origin
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
