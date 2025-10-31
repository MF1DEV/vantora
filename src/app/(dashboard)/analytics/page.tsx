'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Eye, MousePointerClick, TrendingUp, Users, ArrowLeft } from 'lucide-react'
import { format, subDays } from 'date-fns'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/Loading'
import { MetricCard, DeviceBreakdownChart, GeographicHeatmap } from '@/components/dashboard/AdvancedAnalytics'
import { DateRangeSelector, AnalyticsExporter, ComparisonView } from '@/components/dashboard/AnalyticsExport'
import AnalyticsChart from '@/components/dashboard/AnalyticsChart'

interface AnalyticsData {
  totalViews: number
  totalClicks: number
  uniqueVisitors: number
  ctr: number
  linkStats: Array<{
    link_id: string
    title: string
    clicks: number
  }>
  dailyViews: Array<{
    date: string
    count: number
  }>
  deviceStats: Array<{
    device: string
    visits: number
    clicks: number
    percentage: number
  }>
  geoStats: Array<{
    country: string
    countryCode: string
    visits: number
    clicks: number
  }>
}

export default function AnalyticsPage() {
  const supabase = createClient()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    uniqueVisitors: 0,
    ctr: 0,
    linkStats: [],
    dailyViews: [],
    deviceStats: [],
    geoStats: [],
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(7)

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

    // Get unique visitors
    const { data: uniqueData } = await supabase
      .from('analytics')
      .select('ip_address')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())

    const uniqueVisitors = new Set(uniqueData?.map(d => d.ip_address)).size

    // Calculate CTR
    const ctr = viewCount && viewCount > 0 ? ((clickCount || 0) / viewCount * 100).toFixed(1) : '0'

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
        clicks: count || 0
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

    const dailyCounts: { [key: string]: number } = {}
    for (let i = 0; i < timeRange; i++) {
      const date = format(subDays(new Date(), i), 'MMM d')
      dailyCounts[date] = 0
    }

    dailyData?.forEach(item => {
      const date = format(new Date(item.created_at), 'MMM d')
      if (dailyCounts[date] !== undefined) {
        dailyCounts[date]++
      }
    })

    const dailyViews = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .reverse()

    // Get device breakdown
    const { data: deviceData } = await supabase
      .from('analytics')
      .select('device_type')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())

    const deviceCounts: { [key: string]: number } = {}
    deviceData?.forEach(item => {
      deviceCounts[item.device_type] = (deviceCounts[item.device_type] || 0) + 1
    })

    const total = Object.values(deviceCounts).reduce((a, b) => a + b, 0)
    const deviceStats = Object.entries(deviceCounts).map(([device, visits]) => ({
      device: device.charAt(0).toUpperCase() + device.slice(1),
      visits,
      clicks: 0,
      percentage: total > 0 ? Math.round((visits / total) * 100) : 0
    }))

    // Get geographic data
    const { data: geoData } = await supabase
      .from('analytics')
      .select('country')
      .eq('user_id', user.id)
      .gte('created_at', startDate.toISOString())

    const countryCounts: { [key: string]: number } = {}
    geoData?.forEach(item => {
      if (item.country) {
        countryCounts[item.country] = (countryCounts[item.country] || 0) + 1
      }
    })

    const geoStats = Object.entries(countryCounts)
      .map(([country, visits]) => ({
        country,
        countryCode: '🌍', // You can add a country code mapping here
        visits,
        clicks: 0
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10)

    setAnalytics({
      totalViews: viewCount || 0,
      totalClicks: clickCount || 0,
      uniqueVisitors,
      ctr: parseFloat(ctr),
      linkStats: linkStats.sort((a, b) => b.clicks - a.clicks),
      dailyViews,
      deviceStats,
      geoStats
    })

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-slate-400">Track your profile performance and audience insights</p>
        </div>

        {/* Date Range Selector */}
        <div className="mb-8">
          <div className="flex gap-2">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeRange === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Last {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Views"
            value={analytics.totalViews.toLocaleString()}
            change={15}
            changeLabel="vs last period"
            icon={<Eye className="w-6 h-6" />}
            trend="up"
          />
          <MetricCard
            title="Total Clicks"
            value={analytics.totalClicks.toLocaleString()}
            change={22}
            changeLabel="vs last period"
            icon={<MousePointerClick className="w-6 h-6" />}
            trend="up"
          />
          <MetricCard
            title="Unique Visitors"
            value={analytics.uniqueVisitors.toLocaleString()}
            change={8}
            changeLabel="vs last period"
            icon={<Users className="w-6 h-6" />}
            trend="up"
          />
          <MetricCard
            title="Click-through Rate"
            value={`${analytics.ctr}%`}
            change={-3}
            changeLabel="vs last period"
            icon={<TrendingUp className="w-6 h-6" />}
            trend="down"
          />
        </div>

        {/* Views Over Time */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Views Over Time</h2>
          <AnalyticsChart data={analytics.dailyViews} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Device Breakdown */}
          {analytics.deviceStats.length > 0 && (
            <DeviceBreakdownChart data={analytics.deviceStats} />
          )}

          {/* Top Links */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Top Performing Links</h2>
            <div className="space-y-4">
              {analytics.linkStats.slice(0, 5).map((link, index) => (
                <div key={link.link_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center text-sm font-semibold text-blue-400">
                      {index + 1}
                    </div>
                    <span className="text-white font-medium truncate">{link.title}</span>
                  </div>
                  <span className="text-slate-400 font-semibold">{link.clicks} clicks</span>
                </div>
              ))}
              {analytics.linkStats.length === 0 && (
                <p className="text-center py-8 text-slate-400">No link data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        {analytics.geoStats.length > 0 && (
          <div className="mb-8">
            <GeographicHeatmap data={analytics.geoStats} />
          </div>
        )}

        {/* Export Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnalyticsExporter
            data={{
              totalViews: analytics.totalViews,
              totalClicks: analytics.totalClicks,
              ctr: analytics.ctr,
              topLinks: analytics.linkStats.slice(0, 10),
              deviceBreakdown: analytics.deviceStats,
              topCountries: analytics.geoStats.slice(0, 10).map(g => ({ country: g.country, visits: g.visits }))
            }}
          />
        </div>
      </div>
    </div>
  )
}
