import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Parse query parameters for date range
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('range') || '7d'
    
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '24h':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case 'all':
        startDate = new Date(0) // Beginning of time
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Fetch analytics data with link information
    const { data: analytics, error } = await supabase
      .from('analytics')
      .select(`
        id,
        created_at,
        event_type,
        device_type,
        browser,
        os,
        country,
        city,
        referrer,
        ip_address,
        links:link_id (
          title,
          url
        )
      `)
      .eq('user_id', profile.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    // Generate CSV content
    const headers = [
      'Date',
      'Time',
      'Event Type',
      'Link Title',
      'Link URL',
      'Device Type',
      'Browser',
      'Operating System',
      'Country',
      'City',
      'Referrer',
      'IP Address'
    ]

    const csvRows = [
      headers.join(','), // Header row
      ...analytics.map(row => {
        const date = new Date(row.created_at)
        const link = Array.isArray(row.links) ? row.links[0] : row.links
        const linkTitle = link?.title || 'Profile View'
        const linkUrl = link?.url || '-'
        
        return [
          date.toLocaleDateString('en-US'),
          date.toLocaleTimeString('en-US'),
          row.event_type || '-',
          `"${linkTitle}"`, // Quote to handle commas in titles
          `"${linkUrl}"`, // Quote to handle commas in URLs
          row.device_type || '-',
          row.browser || '-',
          row.os || '-',
          row.country || '-',
          row.city || '-',
          row.referrer || '-',
          row.ip_address || '-'
        ].join(',')
      })
    ]

    const csvContent = csvRows.join('\n')

    // Generate filename with timestamp
    const timestamp = now.toISOString().split('T')[0]
    const filename = `vantora-analytics-${timestamp}.csv`

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    )
  }
}
