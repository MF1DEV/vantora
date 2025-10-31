import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not set')
      return NextResponse.json({ error: 'Supabase URL not configured' }, { status: 500 })
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }

    console.log('Creating Supabase client with service role...')
    
    // Use service role key to bypass RLS and get all stats
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Fetching profiles count...')
    
    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    console.log('Users count:', usersCount, 'Error:', usersError)
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw usersError
    }

    // Get total links count
    const { count: linksCount, error: linksError } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })

    console.log('Links count:', linksCount, 'Error:', linksError)
    
    if (linksError) {
      console.error('Error fetching links:', linksError)
      throw linksError
    }

    // Get total clicks count from analytics table instead of click_count column
    const { count: totalClicks, error: clicksError } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'click')

    console.log('Total clicks count:', totalClicks, 'Error:', clicksError)
    
    if (clicksError) {
      console.error('Error fetching clicks:', clicksError)
      // Don't throw - just use 0 if analytics table doesn't exist yet
    }

    // Get active links (visible and not expired)
    const { count: activeLinksCount, error: activeLinksError } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    console.log('Active links count:', activeLinksCount, 'Error:', activeLinksError)
    
    if (activeLinksError) {
      console.error('Error fetching active links:', activeLinksError)
      throw activeLinksError
    }

    const result = {
      users: usersCount || 0,
      links: linksCount || 0,
      clicks: totalClicks || 0,
      activeLinks: activeLinksCount || 0,
      updatedAt: new Date().toISOString()
    }
    
    console.log('Final stats result:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

// Cache for 30 seconds
export const revalidate = 30
