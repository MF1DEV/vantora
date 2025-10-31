'use client'

import { Smartphone, Monitor, Tablet, Globe, Clock, TrendingUp } from 'lucide-react'

interface DeviceStatsProps {
  data: Array<{
    device_type: string
    visits: number
    clicks: number
    percentage: number
  }>
}

export function DeviceBreakdown({ data }: DeviceStatsProps) {
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />
      case 'tablet':
        return <Tablet className="w-5 h-5" />
      default:
        return <Monitor className="w-5 h-5" />
    }
  }

  const getDeviceColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return 'bg-blue-500'
      case 'tablet':
        return 'bg-purple-500'
      default:
        return 'bg-green-500'
    }
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Monitor className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-semibold text-white">Device Breakdown</h3>
      </div>
      <div className="space-y-4">
        {data.map((device) => (
          <div key={device.device_type} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-slate-400">
                  {getDeviceIcon(device.device_type)}
                </div>
                <div>
                  <p className="text-white font-medium capitalize">{device.device_type}</p>
                  <p className="text-xs text-slate-500">
                    {device.visits} visits, {device.clicks} clicks
                  </p>
                </div>
              </div>
              <span className="text-slate-300 font-semibold">{device.percentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${getDeviceColor(device.device_type)} transition-all duration-500`}
                style={{ width: `${device.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface GeographicStatsProps {
  data: Array<{
    country: string
    city: string
    visits: number
    clicks: number
  }>
}

export function GeographicBreakdown({ data }: GeographicStatsProps) {
  const maxVisits = Math.max(...data.map(d => d.visits), 1)
  
  // Country code to flag emoji
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return '🌍'
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-semibold text-white">Geographic Breakdown</h3>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            No geographic data available yet
          </p>
        ) : (
          data.map((location, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-2xl flex-shrink-0">{getFlagEmoji(location.country)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {location.city || location.country}
                  </p>
                  <p className="text-xs text-slate-500">
                    {location.visits} visits • {location.clicks} clicks
                  </p>
                </div>
              </div>
              <div className="w-24 bg-slate-700 rounded-full h-1.5 ml-4 flex-shrink-0">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(location.visits / maxVisits) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface HourlyPatternProps {
  data: Array<{
    hour_of_day: number
    clicks: number
    views: number
  }>
}

export function HourlyClickPattern({ data }: HourlyPatternProps) {
  const maxActivity = Math.max(...data.map(d => d.clicks + d.views), 1)
  
  const getTimeLabel = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour < 12) return `${hour} AM`
    if (hour === 12) return '12 PM'
    return `${hour - 12} PM`
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-semibold text-white">Activity by Hour</h3>
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
        {Array.from({ length: 24 }, (_, i) => {
          const hourData = data.find(d => d.hour_of_day === i)
          const activity = hourData ? hourData.clicks + hourData.views : 0
          const intensity = (activity / maxActivity) * 100
          
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="relative group">
                <div
                  className="w-full h-16 bg-slate-700 rounded hover:bg-slate-600 transition-all cursor-pointer"
                  style={{
                    background: intensity > 0
                      ? `linear-gradient(to top, rgb(59, 130, 246) ${intensity}%, rgb(51, 65, 85) ${intensity}%)`
                      : 'rgb(51, 65, 85)'
                  }}
                />
                {activity > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {activity} {activity === 1 ? 'event' : 'events'}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500">{i}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span>High activity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-700 rounded" />
          <span>Low activity</span>
        </div>
      </div>
    </div>
  )
}

interface LinkCTRProps {
  data: Array<{
    link_id: string
    title: string
    total_clicks: number
    ctr_percentage: number
  }>
}

export function LinkCTRStats({ data }: LinkCTRProps) {
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-semibold text-white">Link Performance (CTR)</h3>
      </div>
      <div className="space-y-3">
        {data.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            No link data available yet
          </p>
        ) : (
          data.slice(0, 10).map((link) => (
            <div key={link.link_id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition">
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{link.title}</p>
                <p className="text-xs text-slate-500">{link.total_clicks} clicks</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className={`text-sm font-semibold ${
                  link.ctr_percentage > 10 ? 'text-green-400' :
                  link.ctr_percentage > 5 ? 'text-yellow-400' :
                  'text-slate-400'
                }`}>
                  {link.ctr_percentage || 0}%
                </span>
                <div className="text-xs text-slate-500">CTR</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
