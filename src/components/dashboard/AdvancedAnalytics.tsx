'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Users, MousePointerClick, Eye, DollarSign, Globe, Smartphone } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function MetricCard({ title, value, change, changeLabel, icon, trend = 'neutral' }: MetricCardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-slate-400'
  }

  const trendBg = {
    up: 'bg-green-500/10',
    down: 'bg-red-500/10',
    neutral: 'bg-slate-500/10'
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${trendBg[trend]}`}>
          <div className={trendColors[trend]}>{icon}</div>
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColors[trend]}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-slate-400 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      {changeLabel && <p className="text-xs text-slate-500">{changeLabel}</p>}
    </div>
  )
}

interface ConversionFunnelProps {
  steps: Array<{
    name: string
    count: number
    percentage: number
  }>
}

export function ConversionFunnel({ steps }: ConversionFunnelProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Conversion Funnel</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const dropoff = index > 0 ? steps[index - 1].percentage - step.percentage : 0
          return (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400 flex items-center justify-center text-sm font-semibold text-blue-400">
                    {index + 1}
                  </div>
                  <span className="font-medium text-white">{step.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  {dropoff > 0 && (
                    <span className="text-sm text-red-400">-{dropoff.toFixed(1)}%</span>
                  )}
                  <span className="text-sm font-semibold text-white">{step.count.toLocaleString()}</span>
                  <span className="text-sm text-slate-400">{step.percentage}%</span>
                </div>
              </div>
              <div className="relative h-12 bg-slate-900/50 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                  style={{ width: `${step.percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface RetentionCohortProps {
  cohorts: Array<{
    cohort: string
    week0: number
    week1: number
    week2: number
    week3: number
    week4: number
  }>
}

export function RetentionCohort({ cohorts }: RetentionCohortProps) {
  const getHeatmapColor = (value: number) => {
    if (value >= 80) return 'bg-green-500'
    if (value >= 60) return 'bg-green-400'
    if (value >= 40) return 'bg-yellow-400'
    if (value >= 20) return 'bg-orange-400'
    return 'bg-red-400'
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold text-white mb-6">User Retention Cohorts</h3>
      <div className="min-w-[600px]">
        <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-medium text-slate-400">
          <div>Cohort</div>
          <div>Week 0</div>
          <div>Week 1</div>
          <div>Week 2</div>
          <div>Week 3</div>
          <div>Week 4</div>
          <div>Total</div>
        </div>
        {cohorts.map((cohort, index) => (
          <div key={index} className="grid grid-cols-7 gap-2 mb-2">
            <div className="text-sm font-medium text-white">{cohort.cohort}</div>
            {[cohort.week0, cohort.week1, cohort.week2, cohort.week3, cohort.week4].map((value, i) => (
              <div
                key={i}
                className={`h-10 rounded flex items-center justify-center text-sm font-semibold text-white ${getHeatmapColor(value)}`}
              >
                {value}%
              </div>
            ))}
            <div className="flex items-center justify-center text-sm font-semibold text-slate-400">
              {Math.round((cohort.week0 + cohort.week1 + cohort.week2 + cohort.week3 + cohort.week4) / 5)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface GeographicHeatmapProps {
  data: Array<{
    country: string
    countryCode: string
    visits: number
    clicks: number
    revenue?: number
  }>
}

export function GeographicHeatmap({ data }: GeographicHeatmapProps) {
  const maxVisits = Math.max(...data.map(d => d.visits))

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Geographic Distribution</h3>
        <Globe className="w-5 h-5 text-blue-400" />
      </div>
      <div className="space-y-3">
        {data.slice(0, 10).map((country, index) => {
          const percentage = (country.visits / maxVisits) * 100
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{country.countryCode}</span>
                  <span className="font-medium text-white">{country.country}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>{country.visits.toLocaleString()} visits</span>
                  <span>{country.clicks.toLocaleString()} clicks</span>
                  {country.revenue && (
                    <span className="text-green-400">${country.revenue.toFixed(2)}</span>
                  )}
                </div>
              </div>
              <div className="relative h-2 bg-slate-900/50 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface DeviceBreakdownChartProps {
  data: Array<{
    device: string
    visits: number
    clicks: number
    percentage: number
  }>
}

export function DeviceBreakdownChart({ data }: DeviceBreakdownChartProps) {
  const colors = {
    desktop: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-400' },
    mobile: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-400' },
    tablet: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-400' }
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Device Breakdown</h3>
        <Smartphone className="w-5 h-5 text-blue-400" />
      </div>
      
      {/* Donut Chart */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.reduce((acc, device, index) => {
              const color = colors[device.device.toLowerCase() as keyof typeof colors]?.bg.replace('bg-', '')
              const startAngle = acc.angle
              const angle = (device.percentage / 100) * 360
              const endAngle = startAngle + angle
              
              const startRad = (startAngle * Math.PI) / 180
              const endRad = (endAngle * Math.PI) / 180
              
              const x1 = 50 + 40 * Math.cos(startRad)
              const y1 = 50 + 40 * Math.sin(startRad)
              const x2 = 50 + 40 * Math.cos(endRad)
              const y2 = 50 + 40 * Math.sin(endRad)
              
              const largeArc = angle > 180 ? 1 : 0
              
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ')

              acc.paths.push(
                <path
                  key={index}
                  d={pathData}
                  fill={`var(--${color}-500)`}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <title>{`${device.device}: ${device.percentage}%`}</title>
                </path>
              )
              
              acc.angle = endAngle
              return acc
            }, { angle: 0, paths: [] as React.ReactNode[] }).paths}
            
            {/* Center hole */}
            <circle cx="50" cy="50" r="25" fill="rgb(15 23 42)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {data.reduce((sum, d) => sum + d.visits, 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">Total Visits</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((device, index) => {
          const color = colors[device.device.toLowerCase() as keyof typeof colors] || colors.desktop
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                <span className="text-sm font-medium text-white">{device.device}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">{device.visits.toLocaleString()} visits</span>
                <span className={`font-semibold ${color.text}`}>{device.percentage}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface UTMCampaignProps {
  campaigns: Array<{
    campaign: string
    source: string
    medium: string
    visits: number
    clicks: number
    conversions: number
    revenue?: number
  }>
}

export function UTMCampaignTracker({ campaigns }: UTMCampaignProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">UTM Campaign Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700 text-left">
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase">Campaign</th>
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase">Source</th>
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase">Medium</th>
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase text-right">Visits</th>
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase text-right">Clicks</th>
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase text-right">Conv.</th>
              <th className="pb-3 text-xs font-medium text-slate-400 uppercase text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {campaigns.map((campaign, index) => {
              const ctr = ((campaign.clicks / campaign.visits) * 100).toFixed(1)
              const convRate = ((campaign.conversions / campaign.visits) * 100).toFixed(1)
              
              return (
                <tr key={index} className="hover:bg-slate-800/50 transition">
                  <td className="py-3 text-sm font-medium text-white">{campaign.campaign}</td>
                  <td className="py-3 text-sm text-slate-400">{campaign.source}</td>
                  <td className="py-3 text-sm text-slate-400">{campaign.medium}</td>
                  <td className="py-3 text-sm text-white text-right">{campaign.visits.toLocaleString()}</td>
                  <td className="py-3 text-sm text-white text-right">
                    {campaign.clicks.toLocaleString()}
                    <span className="ml-2 text-xs text-slate-400">({ctr}%)</span>
                  </td>
                  <td className="py-3 text-sm text-white text-right">
                    {campaign.conversions}
                    <span className="ml-2 text-xs text-slate-400">({convRate}%)</span>
                  </td>
                  <td className="py-3 text-sm font-semibold text-green-400 text-right">
                    {campaign.revenue ? `$${campaign.revenue.toFixed(2)}` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
