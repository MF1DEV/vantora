'use client'

import { useMemo } from 'react'

interface DataPoint {
  date: string
  count: number
}

interface AnalyticsChartProps {
  data: DataPoint[]
  height?: number
}

const AnalyticsChart = ({ data, height = 200 }: AnalyticsChartProps) => {
  // Memoize the max value calculation
  const maxValue = useMemo(() => Math.max(...data.map(d => d.count), 1), [data])

  // Memoize the path generation
  const { linePath, areaPath } = useMemo(() => {
    const points = data.map((point, i) => {
      const x = (i / (data.length - 1)) * 1000
      const y = height - (point.count / maxValue) * height
      return { x, y }
    })

    const linePath = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
    ).join(' ')

    const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L 0,${height} Z`

    return { linePath, areaPath }
  }, [data, height, maxValue])

  return (
    <div className="relative h-64">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-500">
        <span>{maxValue}</span>
        <span>{Math.floor(maxValue * 0.75)}</span>
        <span>{Math.floor(maxValue * 0.5)}</span>
        <span>{Math.floor(maxValue * 0.25)}</span>
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

          {/* Area fill */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={areaPath}
            fill="url(#areaGradient)"
          />

          {/* Line */}
          <path
            d={linePath}
            stroke="#3b82f6"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {data.map((point, i) => {
            const x = (i / (data.length - 1)) * 1000
            const y = height - (point.count / maxValue) * height
            return (
              <g key={i} className="group">
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                  className="transition-all duration-200 hover:r-6 cursor-pointer"
                >
                  <title>{`${point.date}: ${point.count} views`}</title>
                </circle>
                {/* Hover tooltip */}
                <g 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  transform={`translate(${x}, ${y - 20})`}
                >
                  <rect
                    x="-40"
                    y="-20"
                    width="80"
                    height="20"
                    rx="4"
                    fill="#1e293b"
                  />
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                  >
                    {point.count} views
                  </text>
                </g>
              </g>
            )
          })}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 px-1">
        {data.map((point, i) => (
          <span 
            key={i}
            className="text-xs text-slate-500"
          >
            {point.date}
          </span>
        ))}
      </div>
    </div>
  )
}

// Memoize the entire component
export default AnalyticsChart
