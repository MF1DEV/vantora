import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { logAuditEvent, getClientIp, getUserAgent } from '@/lib/utils/audit'
import { rateLimit, getRateLimitIdentifier, RateLimitConfig } from '@/lib/utils/rateLimit'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Apply rate limiting (stricter for data export)
    const ip = getClientIp(request)
    const identifier = getRateLimitIdentifier(ip, user.id)
    const rateLimitResult = await rateLimit(identifier, RateLimitConfig.api.export)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many export requests. You can export your data 3 times per hour.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 3600),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          },
        }
      )
    }

    // Fetch all user data
    const [profileResult, linksResult, analyticsResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('links').select('*').eq('user_id', user.id),
      supabase
        .from('analytics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1000), // Limit to last 1000 analytics events
    ])

    // Compile all data
    const userData = {
      exported_at: new Date().toISOString(),
      account: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
      },
      profile: profileResult.data || null,
      links: linksResult.data || [],
      analytics: {
        events: analyticsResult.data || [],
        total_events: analyticsResult.data?.length || 0,
      },
      metadata: {
        export_version: '1.0',
        data_format: 'JSON',
        gdpr_compliant: true,
      },
    }

    // Log data export
    await logAuditEvent({
      userId: user.id,
      eventType: 'data_export',
      eventData: { 
        total_links: linksResult.data?.length || 0,
        total_analytics: analyticsResult.data?.length || 0,
      },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    })

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(userData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="vantora-data-${user.id}-${Date.now()}.json"`,
      },
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
