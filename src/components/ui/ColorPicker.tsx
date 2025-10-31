'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  presets?: string[]
}

export default function ColorPicker({ label, value, onChange, presets }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false)

  const defaultPresets = presets || [
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f59e0b', // Amber
    '#10b981', // Green
    '#06b6d4', // Cyan
    '#6366f1', // Indigo
    '#f43f5e', // Rose
    '#84cc16', // Lime
    '#f97316', // Orange
    '#14b8a6', // Teal
  ]

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      
      <div className="flex items-center gap-3">
        {/* Color preview button */}
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-12 h-12 rounded-lg border-2 border-slate-600 hover:border-slate-500 transition relative overflow-hidden group"
          style={{ backgroundColor: value }}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
            <Palette className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" />
          </div>
        </button>

        {/* Hex input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-blue-500 transition font-mono"
          maxLength={7}
        />

        {/* Native color picker */}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-600 hover:border-slate-500 transition"
        />
      </div>

      {/* Preset colors */}
      {showPicker && (
        <div className="grid grid-cols-6 gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          {defaultPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                onChange(preset)
                setShowPicker(false)
              }}
              className="w-10 h-10 rounded-lg border-2 border-slate-600 hover:border-white hover:scale-110 transition relative group"
              style={{ backgroundColor: preset }}
            >
              {value === preset && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
