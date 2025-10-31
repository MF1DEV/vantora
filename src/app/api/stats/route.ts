import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get total users count
    const { count: usersCount, error: usersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (usersError) throw usersError

    // Get total links count
    const { count: linksCount, error: linksError } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })

    if (linksError) throw linksError

    // Get total clicks count
    const { data: clicksData, error: clicksError } = await supabase
      .from('links')
      .select('click_count')

    if (clicksError) throw clicksError

    const totalClicks = clicksData?.reduce((sum: number, link: any) => sum + (link.click_count || 0), 0) || 0

    // Get active links (visible and not expired)
    const { count: activeLinksCount, error: activeLinksError } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (activeLinksError) throw activeLinksError

    return NextResponse.json({
      users: usersCount || 0,
      links: linksCount || 0,
      clicks: totalClicks,
      activeLinks: activeLinksCount || 0,
      updatedAt: new Date().toISOString()
    })
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
