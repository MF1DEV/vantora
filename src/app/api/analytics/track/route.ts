import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Parse user agent for device type, browser, and OS
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()
  
  // Device type detection
  let deviceType = 'desktop'
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    deviceType = 'tablet'
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    deviceType = 'mobile'
  }

  // Browser detection
  let browser = 'unknown'
  if (ua.includes('edg/')) browser = 'Edge'
  else if (ua.includes('chrome/')) browser = 'Chrome'
  else if (ua.includes('safari/') && !ua.includes('chrome')) browser = 'Safari'
  else if (ua.includes('firefox/')) browser = 'Firefox'
  else if (ua.includes('opera/') || ua.includes('opr/')) browser = 'Opera'
  else if (ua.includes('trident/')) browser = 'IE'

  // OS detection
  let os = 'unknown'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac os x')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'

  return { deviceType, browser, os }
}

// Extract clean referrer domain
function extractReferrerDomain(referrer: string): string {
  if (!referrer) return ''
  try {
    const url = new URL(referrer)
    return url.hostname.replace('www.', '')
  } catch {
    return ''
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    let body;
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    const { user_id, link_id, event_type } = body

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwardedFor ? forwardedFor.split(',')[0] : (realIp || 'unknown')

    // Parse user agent data
    const { deviceType, browser, os } = parseUserAgent(userAgent)
    const referrerDomain = extractReferrerDomain(referrer)

    // Insert analytics event with detailed data
    const { error } = await supabase.from('analytics').insert({
      user_id,
      link_id: link_id || null,
      event_type,
      ip_address: ip !== 'unknown' ? ip : null,
      user_agent: userAgent || null,
      referrer: referrerDomain || null,
      device_type: deviceType,
      browser: browser,
      os: os,
    })

    if (error) throw error

    // If it's a profile view, increment the view counter
    if (event_type === 'view' && !link_id) {
      await supabase.rpc('increment_profile_views', { profile_user_id: user_id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    )
  }
}