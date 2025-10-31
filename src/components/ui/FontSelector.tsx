'use client'

import { Type } from 'lucide-react'

interface FontSelectorProps {
  label: string
  value: string
  onChange: (font: string) => void
}

const GOOGLE_FONTS = [
  { name: 'Inter', category: 'Sans Serif' },
  { name: 'Poppins', category: 'Sans Serif' },
  { name: 'Roboto', category: 'Sans Serif' },
  { name: 'Montserrat', category: 'Sans Serif' },
  { name: 'Open Sans', category: 'Sans Serif' },
  { name: 'Lato', category: 'Sans Serif' },
  { name: 'Raleway', category: 'Sans Serif' },
  { name: 'Nunito', category: 'Sans Serif' },
  { name: 'Playfair Display', category: 'Serif' },
  { name: 'Merriweather', category: 'Serif' },
  { name: 'Lora', category: 'Serif' },
  { name: 'PT Serif', category: 'Serif' },
  { name: 'Fira Code', category: 'Monospace' },
  { name: 'Source Code Pro', category: 'Monospace' },
  { name: 'Dancing Script', category: 'Handwriting' },
  { name: 'Pacifico', category: 'Handwriting' },
  { name: 'Caveat', category: 'Handwriting' },
  { name: 'Bebas Neue', category: 'Display' },
  { name: 'Righteous', category: 'Display' },
  { name: 'Archivo Black', category: 'Display' },
]

export default function FontSelector({ label, value, onChange }: FontSelectorProps) {
  // Load Google Fonts dynamically
  const loadFont = (fontName: string) => {
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@400;600;700&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  const handleChange = (fontName: string) => {
    onChange(fontName)
    loadFont(fontName)
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <Type className="w-4 h-4" />
        {label}
      </label>
      
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500 transition"
        style={{ fontFamily: value }}
      >
        {GOOGLE_FONTS.map((font) => (
          <option key={font.name} value={font.name} style={{ fontFamily: font.name }}>
            {font.name} — {font.category}
          </option>
        ))}
      </select>

      {/* Preview */}
      <div 
        className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
        style={{ fontFamily: value }}
      >
        <p className="text-white text-lg mb-1">The quick brown fox jumps</p>
        <p className="text-slate-400 text-sm">AaBbCc 123456</p>
      </div>
    </div>
  )
}
