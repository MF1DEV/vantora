'use client'

import { useState } from 'react'
import { Download, FileText, Mail, Calendar, Filter } from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

interface ExportData {
  totalViews: number
  totalClicks: number
  ctr: number
  topLinks: Array<{ title: string; clicks: number }>
  deviceBreakdown: Array<{ device: string; percentage: number }>
  topCountries: Array<{ country: string; visits: number }>
}

interface DateRange {
  start: Date
  end: Date
  label: string
}

export function AnalyticsExporter({ data }: { data: ExportData }) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv')
  const [isExporting, setIsExporting] = useState(false)

  const exportToCSV = () => {
    setIsExporting(true)
    
    // Create CSV content
    const headers = ['Metric', 'Value']
    const rows = [
      ['Total Views', data.totalViews],
      ['Total Clicks', data.totalClicks],
      ['Click-through Rate', `${data.ctr}%`],
      [''],
      ['Top Links'],
      ['Link Title', 'Clicks'],
      ...data.topLinks.map(link => [link.title, link.clicks]),
      [''],
      ['Device Breakdown'],
      ['Device', 'Percentage'],
      ...data.deviceBreakdown.map(device => [device.device, `${device.percentage}%`]),
      [''],
      ['Top Countries'],
      ['Country', 'Visits'],
      ...data.topCountries.map(country => [country.country, country.visits])
    ]

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    setTimeout(() => setIsExporting(false), 1000)
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    
    // In production, you'd use a library like jsPDF or call an API
    // For now, we'll create a simple HTML representation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
            h2 { color: #334155; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f1f5f9; font-weight: 600; }
            .metric { display: inline-block; padding: 20px; margin: 10px; background: #f8fafc; border-radius: 8px; min-width: 200px; }
            .metric-value { font-size: 32px; font-weight: bold; color: #3b82f6; }
            .metric-label { color: #64748b; margin-top: 5px; }
          </style>
        </head>
        <body>
          <h1>Analytics Report</h1>
          <p>Generated on ${format(new Date(), 'MMMM dd, yyyy')}</p>
          
          <h2>Overview</h2>
          <div>
            <div class="metric">
              <div class="metric-value">${data.totalViews.toLocaleString()}</div>
              <div class="metric-label">Total Views</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.totalClicks.toLocaleString()}</div>
              <div class="metric-label">Total Clicks</div>
            </div>
            <div class="metric">
              <div class="metric-value">${data.ctr}%</div>
              <div class="metric-label">CTR</div>
            </div>
          </div>

          <h2>Top Performing Links</h2>
          <table>
            <thead>
              <tr>
                <th>Link Title</th>
                <th>Clicks</th>
              </tr>
            </thead>
            <tbody>
              ${data.topLinks.map(link => `
                <tr>
                  <td>${link.title}</td>
                  <td>${link.clicks}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Device Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${data.deviceBreakdown.map(device => `
                <tr>
                  <td>${device.device}</td>
                  <td>${device.percentage}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>Top Countries</h2>
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Visits</th>
              </tr>
            </thead>
            <tbody>
              ${data.topCountries.map(country => `
                <tr>
                  <td>${country.country}</td>
                  <td>${country.visits}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    // Open in new window for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.print()
    }

    setTimeout(() => setIsExporting(false), 1000)
  }

  const handleExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV()
    } else {
      exportToPDF()
    }
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Export Analytics</h3>
        </div>
      </div>

      <div className="space-y-4">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Export Format</label>
          <div className="flex gap-3">
            <button
              onClick={() => setExportFormat('csv')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                exportFormat === 'csv'
                  ? 'bg-blue-500/10 border-blue-400 text-blue-400'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => setExportFormat('pdf')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition ${
                exportFormat === 'pdf'
                  ? 'bg-blue-500/10 border-blue-400 text-blue-400'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium rounded-lg transition"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download {exportFormat.toUpperCase()}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export function DateRangeSelector({ 
  onRangeChange 
}: { 
  onRangeChange: (range: DateRange) => void 
}) {
  const [selectedRange, setSelectedRange] = useState<string>('7d')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const predefinedRanges = [
    { value: '7d', label: 'Last 7 Days', start: subDays(new Date(), 7), end: new Date() },
    { value: '30d', label: 'Last 30 Days', start: subDays(new Date(), 30), end: new Date() },
    { value: 'this_week', label: 'This Week', start: startOfWeek(new Date()), end: endOfWeek(new Date()) },
    { value: 'this_month', label: 'This Month', start: startOfMonth(new Date()), end: endOfMonth(new Date()) },
    { value: 'last_month', label: 'Last Month', start: startOfMonth(subDays(new Date(), 30)), end: endOfMonth(subDays(new Date(), 30)) }
  ]

  const handleRangeSelect = (rangeValue: string) => {
    setSelectedRange(rangeValue)
    const range = predefinedRanges.find(r => r.value === rangeValue)
    if (range) {
      onRangeChange({ start: range.start, end: range.end, label: range.label })
    }
  }

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      const start = new Date(customStart)
      const end = new Date(customEnd)
      onRangeChange({
        start,
        end,
        label: `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
      })
    }
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Date Range</h3>
      </div>

      {/* Predefined Ranges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {predefinedRanges.map(range => (
          <button
            key={range.value}
            onClick={() => handleRangeSelect(range.value)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              selectedRange === range.value
                ? 'bg-blue-500/10 border-blue-400 text-blue-400'
                : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Custom Range */}
      <div className="pt-4 border-t border-slate-700">
        <label className="block text-sm font-medium text-slate-400 mb-2">Custom Range</label>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleCustomRange}
          disabled={!customStart || !customEnd}
          className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition"
        >
          Apply Custom Range
        </button>
      </div>
    </div>
  )
}

export function ComparisonView({
  current,
  previous,
  metric
}: {
  current: number
  previous: number
  metric: string
}) {
  const change = current - previous
  const percentChange = previous !== 0 ? ((change / previous) * 100).toFixed(1) : '0'
  const isPositive = change >= 0

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4">{metric} Comparison</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Current Period</p>
          <p className="text-2xl font-bold text-white">{current.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Previous Period</p>
          <p className="text-2xl font-bold text-slate-400">{previous.toLocaleString()}</p>
        </div>
      </div>

      <div className={`flex items-center gap-2 p-3 rounded-lg ${
        isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
      }`}>
        <span className="text-2xl">{isPositive ? '↗' : '↘'}</span>
        <div>
          <p className="font-semibold">{isPositive ? '+' : ''}{change.toLocaleString()}</p>
          <p className="text-sm">{isPositive ? '+' : ''}{percentChange}% vs previous period</p>
        </div>
      </div>
    </div>
  )
}

export function ScheduledReports() {
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [email, setEmail] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Scheduled Email Reports</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Frequency</label>
          <div className="grid grid-cols-3 gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map(freq => (
              <button
                key={freq}
                onClick={() => setFrequency(freq)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition ${
                  frequency === freq
                    ? 'bg-blue-500/10 border-blue-400 text-blue-400'
                    : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
          <span className="text-sm text-white">Enable scheduled reports</span>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`relative w-12 h-6 rounded-full transition ${
              isEnabled ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <button
          disabled={!email || !isEnabled}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium rounded-lg transition"
        >
          Save Report Settings
        </button>
      </div>
    </div>
  )
}
