'use client'

import { Tag } from 'lucide-react'

interface LinkBadgeSelectorProps {
  badge: string
  badgeColor: string
  onBadgeChange: (badge: string, color: string) => void
}

const BADGE_PRESETS = [
  { label: 'NEW', color: '#10b981' }, // Green
  { label: 'HOT', color: '#ef4444' }, // Red
  { label: 'SALE', color: '#f59e0b' }, // Amber
  { label: 'LIMITED', color: '#8b5cf6' }, // Purple
  { label: 'POPULAR', color: '#3b82f6' }, // Blue
  { label: 'EXCLUSIVE', color: '#ec4899' }, // Pink
  { label: 'FREE', color: '#06b6d4' }, // Cyan
  { label: 'PRO', color: '#6366f1' }, // Indigo
]

export default function LinkBadgeSelector({ badge, badgeColor, onBadgeChange }: LinkBadgeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <Tag className="w-4 h-4" />
        Link Badge
      </label>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={badge}
          onChange={(e) => onBadgeChange(e.target.value.toUpperCase(), badgeColor)}
          placeholder="Badge text"
          maxLength={10}
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-blue-500 transition"
        />
        <input
          type="color"
          value={badgeColor}
          onChange={(e) => onBadgeChange(badge, e.target.value)}
          className="w-12 h-10 rounded-lg cursor-pointer border-2 border-slate-600 hover:border-slate-500 transition"
        />
      </div>

      {/* Badge Presets */}
      <div className="grid grid-cols-4 gap-2">
        {BADGE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onBadgeChange(preset.label, preset.color)}
            className={`px-2 py-1.5 rounded-md text-xs font-bold text-white transition hover:scale-105 ${
              badge === preset.label && badgeColor === preset.color
                ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                : ''
            }`}
            style={{ backgroundColor: preset.color }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Preview */}
      {badge && (
        <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <span className="text-sm text-slate-400">Preview:</span>
          <span
            className="px-2 py-1 rounded-md text-xs font-bold text-white"
            style={{ backgroundColor: badgeColor }}
          >
            {badge}
          </span>
        </div>
      )}
    </div>
  )
}
