import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { loginSchema, validateRequest } from '@/lib/utils/validation'
import { logAuditEvent, getClientIp, getUserAgent } from '@/lib/utils/audit'

export async function POST(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const supabase = await createClient()

    // Parse and validate request body
    const body = await request.json()
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
