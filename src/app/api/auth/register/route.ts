import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { registerSchema, validateRequest, isDisposableEmail } from '@/lib/utils/validation'
import { logAuditEvent, getClientIp, getUserAgent } from '@/lib/utils/audit'
import { rateLimit, getRateLimitIdentifier, RateLimitConfig } from '@/lib/utils/rateLimit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const supabase = await createClient()

    // Apply rate limiting
    const ip = getClientIp(request)
    const identifier = getRateLimitIdentifier(ip)
    const rateLimitResult = await rateLimit(identifier, RateLimitConfig.auth.register)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many registration attempts. Please try again later.',
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
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    const validation = await validateRequest(registerSchema, body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { email, password, username } = validation.data

    // Optional: Block disposable email domains
    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: 'Disposable email addresses are not allowed' },
        { status: 400 }
      )
    }

    // Check if username is already taken
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Create user account
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${requestUrl.origin}/auth/callback`,
        data: {
          username,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create profile with username
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          display_name: username,
          email,
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Don't return error to user as auth account was created
      }

      // Log successful registration
      await logAuditEvent({
        userId: authData.user.id,
        eventType: 'register',
        eventData: { email, username },
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      })
    }

    return NextResponse.json({
      message: 'Check your email to confirm your account',
    }, { status: 200 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
