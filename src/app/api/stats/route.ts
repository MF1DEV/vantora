import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
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

    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    console.log('Users count:', usersCount, 'Error:', usersError)
    
    if (usersError) throw usersError

    // Get total links count
    const { count: linksCount, error: linksError } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })

    console.log('Links count:', linksCount, 'Error:', linksError)
    
    if (linksError) throw linksError

    // Get total clicks count
    const { data: clicksData, error: clicksError } = await supabase
      .from('links')
      .select('click_count')

    console.log('Clicks data:', clicksData, 'Error:', clicksError)
    
    if (clicksError) throw clicksError

    const totalClicks = clicksData?.reduce((sum: number, link: any) => sum + (link.click_count || 0), 0) || 0

    // Get active links (visible and not expired)
    const { count: activeLinksCount, error: activeLinksError } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    console.log('Active links count:', activeLinksCount, 'Error:', activeLinksError)
    
    if (activeLinksError) throw activeLinksError

    const result = {
      users: usersCount || 0,
      links: linksCount || 0,
      clicks: totalClicks,
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
