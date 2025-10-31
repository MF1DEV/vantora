'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart3, Eye, MousePointerClick, TrendingUp, Download } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { AnalyticsSkeleton } from '@/components/ui/Skeleton'
import { DeviceBreakdown, GeographicBreakdown, HourlyClickPattern, LinkCTRStats } from '@/components/dashboard/AnalyticsComponents'

interface AnalyticsData {
  totalViews: number
  totalClicks: number
  linkStats: Array<{
    link_id: string
    title: string
    clicks: number
  }>
  dailyViews: Array<{
    date: string
    count: number
  }>
  topReferrers: Array<{
    referrer: string
    count: number
  }>
  deviceStats: Array<{
    device_type: string
    visits: number
    clicks: number
    percentage: number
  }>
  geoStats: Array<{
    country: string
    city: string
    visits: number
    clicks: number
  }>
  hourlyPattern: Array<{
    hour_of_day: number
    clicks: number
    views: number
  }>
  linkCTR: Array<{
    link_id: string
    title: string
    total_clicks: number
    ctr_percentage: number
  }>
}

export default function AnalyticsPage() {
  const supabase = createClient()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    linkStats: [],
    dailyViews: [],
    topReferrers: [],
    deviceStats: [],
    geoStats: [],
    hourlyPattern: [],
    linkCTR: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(7) // days

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const startDate = subDays(new Date(), timeRange)

    // Get total views
    const { count: viewCount } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', 'view')
      .gte('created_at', startDate.toISOString())

    // Get total clicks
    const { count: clickCount } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', 'click')
      .gte('created_at', startDate.toISOString())

    // Get clicks per link
    const { data: links } = await supabase
      .from('links')
      .select('id, title')
      .eq('user_id', user.id)

    const linkStatsPromises = links?.map(async (link) => {
      const { count } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('link_id', link.id)
        .eq('event_type', 'click')
        .gte('created_at', startDate.toISOString())

      return {
        link_id: link.id,
        title: link.title,
        clicks: count || 0,
      }
    }) || []

    const linkStats = await Promise.all(linkStatsPromises)

    // Get daily views for chart
    const { data: dailyData } = await supabase
      .from('analytics')
      .select('created_at')
      .eq('user_id', user.id)
      .eq('event_type', 'view')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Group by day
    const dailyViewsMap = new Map<string, number>()
    for (let i = 0; i < timeRange; i++) {
      const date = format(subDays(new Date(), timeRange - i - 1), 'MMM dd')
      dailyViewsMap.set(date, 0)
    }

    dailyData?.forEach((item) => {
      const date = format(new Date(item.created_at), 'MMM dd')
      dailyViewsMap.set(date, (dailyViewsMap.get(date) || 0) + 1)
    })

    const dailyViews = Array.from(dailyViewsMap.entries()).map(([date, count]) => ({
      date,
      count,
    }))

    // Get top referrers
    const { data: referrerData } = await supabase
      .from('analytics')
      .select('referrer')
      .eq('user_id', user.id)
      .eq('event_type', 'view')
      .gte('created_at', startDate.toISOString())
      .not('referrer', 'is', null)
      .not('referrer', 'eq', '')

    const referrerMap = new Map<string, number>()
    referrerData?.forEach((item) => {
      const referrer = item.referrer
      if (referrer && referrer !== 'direct' && referrer !== '') {
        // Extract domain from URL
        try {
          const url = new URL(referrer)
          const domain = url.hostname.replace('www.', '')
          referrerMap.set(domain, (referrerMap.get(domain) || 0) + 1)
        } catch {
          // If not a valid URL, use as is
          referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1)
        }
      }
    })

    const topReferrers = Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Get device stats
    const { data: deviceData } = await supabase
      .rpc('get_device_stats', { user_uuid: user.id, days_back: timeRange })

    // Get geographic stats
    const { data: geoData } = await supabase
      .rpc('get_geographic_stats', { user_uuid: user.id, days_back: timeRange })

    // Get hourly pattern
    const { data: hourlyData } = await supabase
      .rpc('get_hourly_click_pattern', { user_uuid: user.id, days_back: timeRange })

    // Get link CTR stats from view
    const { data: ctrData } = await supabase
      .from('link_ctr_stats')
      .select('*')
      .eq('user_id', user.id)

    setAnalytics({
      totalViews: viewCount || 0,
      totalClicks: clickCount || 0,
      linkStats: linkStats.sort((a, b) => b.clicks - a.clicks),
      dailyViews,
      topReferrers,
      deviceStats: deviceData || [],
      geoStats: (geoData || []).slice(0, 10),
      hourlyPattern: hourlyData || [],
      linkCTR: ctrData || [],
    })

    setLoading(false)
  }

  const maxClicks = Math.max(...analytics.linkStats.map(l => l.clicks), 1)

  if (loading) {
    return <AnalyticsSkeleton />
  }

  const maxViews = Math.max(...analytics.dailyViews.map(d => d.count), 1)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-slate-400">Track your profile performance</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="backdrop-blur-sm border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{analytics.totalViews}</div>
          <div className="text-sm text-slate-400">Profile Views</div>
        </div>

        <div className="backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <MousePointerClick className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{analytics.totalClicks}</div>
          <div className="text-sm text-slate-400">Link Clicks</div>
        </div>

        <div className="backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {analytics.totalViews > 0 
              ? ((analytics.totalClicks / analytics.totalViews) * 100).toFixed(1)
              : 0}%
          </div>
          <div className="text-sm text-slate-400">Click Rate</div>
        </div>
      </div>

      {/* Line Chart for Views Over Time */}
      <div className="backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">Profile Views Over Time</h2>
        <div className="relative h-64">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-500">
            <span>{maxViews}</span>
            <span>{Math.floor(maxViews * 0.75)}</span>
            <span>{Math.floor(maxViews * 0.5)}</span>
            <span>{Math.floor(maxViews * 0.25)}</span>
            <span>0</span>
          </div>

          {/* Chart area */}
          <div className="ml-8 h-full pb-8">
            <svg viewBox="0 0 1000 200" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="0" x2="1000" y2="0" stroke="#334155" strokeWidth="1" />
              <line x1="0" y1="50" x2="1000" y2="50" stroke="#334155" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="1000" y2="100" stroke="#334155" strokeWidth="0.5" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke="#334155" strokeWidth="0.5" />
              <line x1="0" y1="200" x2="1000" y2="200" stroke="#334155" strokeWidth="1" />

              {/* Line path */}
              {analytics.dailyViews.length > 1 && (
                <>
                  {/* Gradient fill */}
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${analytics.dailyViews.map((day, i) => {
                      const x = (i / (analytics.dailyViews.length - 1)) * 1000
                      const y = 200 - (day.count / maxViews) * 200
                      return `${i === 0 ? 'M' : 'L'} ${x},${y}`
                    }).join(' ')} L 1000,200 L 0,200 Z`}
                    fill="url(#lineGradient)"
                  />
                  <path
                    d={analytics.dailyViews.map((day, i) => {
                      const x = (i / (analytics.dailyViews.length - 1)) * 1000
                      const y = 200 - (day.count / maxViews) * 200
                      return `${i === 0 ? 'M' : 'L'} ${x},${y}`
                    }).join(' ')}
                    stroke="#3b82f6"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points */}
                  {analytics.dailyViews.map((day, i) => {
                    const x = (i / (analytics.dailyViews.length - 1)) * 1000
                    const y = 200 - (day.count / maxViews) * 200
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#3b82f6"
                        className="hover:r-6 transition-all cursor-pointer"
                      >
                        <title>{day.date}: {day.count} views</title>
                      </circle>
                    )
                  })}
                </>
              )}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 px-1">
              {analytics.dailyViews.map((day, i) => {
                // Show fewer labels for longer time ranges
                const showLabel = timeRange === 7 
                  ? true 
                  : timeRange === 30 
                    ? i % 3 === 0 
                    : i % 10 === 0
                
                return (
                  <span 
                    key={i} 
                    className="text-xs text-slate-500"
                    style={{ visibility: showLabel ? 'visible' : 'hidden' }}
                  >
                    {day.date}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Link Performance */}
      <div className="backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-6">Link Performance</h2>
        {analytics.linkStats.length > 0 ? (
          <div className="space-y-4">
            {analytics.linkStats.map((link) => (
              <div key={link.link_id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white font-medium">{link.title}</span>
                  <span className="text-slate-400">{link.clicks} clicks</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(link.clicks / maxClicks) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No link clicks yet</p>
            <p className="text-slate-500 text-sm mt-2">Share your profile to start getting clicks!</p>
          </div>
        )}
      </div>

      {/* Top Referrers */}
      <div className="backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Top Referrers</h2>
        {analytics.topReferrers.length > 0 ? (
          <div className="space-y-3">
            {analytics.topReferrers.map((referrer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-white font-medium">{referrer.referrer}</span>
                </div>
                <span className="text-slate-400">{referrer.count} views</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No referrer data yet</p>
            <p className="text-slate-500 text-sm mt-2">Share your profile link to see where your visitors come from!</p>
          </div>
        )}
      </div>

      {/* New Advanced Analytics Section */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <DeviceBreakdown data={analytics.deviceStats} />

        {/* Link CTR Stats */}
        <LinkCTRStats data={analytics.linkCTR} />
      </div>

      {/* Geographic Breakdown - Full Width */}
      <div className="mt-6">
        <GeographicBreakdown data={analytics.geoStats} />
      </div>

      {/* Hourly Pattern - Full Width */}
      <div className="mt-6">
        <HourlyClickPattern data={analytics.hourlyPattern} />
      </div>
    </div>
  )
}