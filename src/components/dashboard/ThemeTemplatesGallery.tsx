'use client'

import { useState } from 'react'
import { Palette, Check } from 'lucide-react'

interface ThemeTemplate {
  id: string
  name: string
  description: string
  preview: string
  colors: {
    accent: string
    button: string
    buttonText: string
    primaryText: string
    secondaryText: string
  }
  fonts: {
    heading: string
    body: string
  }
  background: {
    type: 'gradient' | 'solid'
    gradient?: string
    color?: string
    angle?: number
  }
  buttonStyle: string
}

const templates: ThemeTemplate[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean and corporate look',
    preview: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
    colors: {
      accent: '#3b82f6',
      button: '#3b82f6',
      buttonText: '#ffffff',
      primaryText: '#ffffff',
      secondaryText: '#94a3b8',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
      angle: 135,
    },
    buttonStyle: 'rounded',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Bold and artistic',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    colors: {
      accent: '#a855f7',
      button: '#a855f7',
      buttonText: '#ffffff',
      primaryText: '#ffffff',
      secondaryText: '#e9d5ff',
    },
    fonts: {
      heading: 'Poppins',
      body: 'Poppins',
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      angle: 135,
    },
    buttonStyle: 'pill',
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Vibrant cyberpunk aesthetic',
    preview: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    colors: {
      accent: '#00ff88',
      button: '#00ff88',
      buttonText: '#000000',
      primaryText: '#00ff88',
      secondaryText: '#00d9ff',
    },
    fonts: {
      heading: 'Orbitron',
      body: 'Roboto',
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      angle: 135,
    },
    buttonStyle: 'neon',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant',
    preview: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    colors: {
      accent: '#000000',
      button: '#000000',
      buttonText: '#ffffff',
      primaryText: '#000000',
      secondaryText: '#64748b',
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    background: {
      type: 'solid',
      color: '#ffffff',
    },
    buttonStyle: 'square',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm and inviting',
    preview: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    colors: {
      accent: '#f59e0b',
      button: '#f59e0b',
      buttonText: '#ffffff',
      primaryText: '#ffffff',
      secondaryText: '#fef3c7',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lora',
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      angle: 135,
    },
    buttonStyle: 'soft',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool and calming',
    preview: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)',
    colors: {
      accent: '#06b6d4',
      button: '#06b6d4',
      buttonText: '#ffffff',
      primaryText: '#ffffff',
      secondaryText: '#cffafe',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Open Sans',
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #2e3192 0%, #1bffff 100%)',
      angle: 135,
    },
    buttonStyle: 'rounded',
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural and earthy',
    preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    colors: {
      accent: '#10b981',
      button: '#10b981',
      buttonText: '#ffffff',
      primaryText: '#ffffff',
      secondaryText: '#d1fae5',
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Merriweather',
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      angle: 135,
    },
    buttonStyle: 'soft',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark and mysterious',
    preview: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
    colors: {
      accent: '#8b5cf6',
      button: '#8b5cf6',
      buttonText: '#ffffff',
      primaryText: '#ffffff',
      secondaryText: '#a1a1aa',
    },
    fonts: {
      heading: 'Raleway',
      body: 'Raleway',
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
      angle: 135,
    },
    buttonStyle: 'glass',
  },
  {
    id: 'candy',
    name: 'Candy',
    description: 'Sweet and playful',
    preview: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
    colors: {
      accent: '#ec4899',
      button: '#ec4899',
      buttonText: '#ffffff',
      primaryText: '#ffffff',
      secondaryText: '#fce7f3',
    },
    fonts: {
      heading: 'Quicksand',
      body: 'Quicksand',
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
      angle: 135,
    },
    buttonStyle: 'pill',
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'Luxurious and premium',
    preview: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)',
    colors: {
      accent: '#eab308',
      button: '#eab308',
      buttonText: '#000000',
      primaryText: '#ffffff',
      secondaryText: '#fef9c3',
    },
    fonts: {
      heading: 'Cinzel',
      body: 'Lato',
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)',
      angle: 135,
    },
    buttonStyle: 'gradient',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Classic black and white',
    preview: 'linear-gradient(135deg, #ffffff 0%, #000000 100%)',
    colors: {
      accent: '#ffffff',
      button: '#ffffff',
      buttonText: '#000000',
      primaryText: '#ffffff',
      secondaryText: '#d4d4d8',
    },
    fonts: {
      heading: 'Space Mono',
      body: 'Roboto Mono',
    },
    background: {
      type: 'solid',
      color: '#000000',
    },
    buttonStyle: 'outlined',
  },
  {
    id: 'retro',
    name: 'Retro',
    description: 'Vintage 80s vibes',
    preview: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
    colors: {
      accent: '#ff6b6b',
      button: '#ff6b6b',
      buttonText: '#ffffff',
      primaryText: '#ffffff',
      secondaryText: '#ffe66d',
    },
    fonts: {
      heading: 'Righteous',
      body: 'Roboto',
    },
    background: {
      type: 'gradient',
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
      angle: 135,
    },
    buttonStyle: 'soft',
  },
]

interface ThemeTemplatesGalleryProps {
  onApplyTemplate: (template: ThemeTemplate) => void
}

export default function ThemeTemplatesGallery({ onApplyTemplate }: ThemeTemplatesGalleryProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleApply = (template: ThemeTemplate) => {
    setSelectedTemplate(template.id)
    onApplyTemplate(template)
    setTimeout(() => setSelectedTemplate(null), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Theme Templates</h3>
      </div>

      <p className="text-sm text-slate-400">
        Choose a pre-made theme and customize it further to match your style
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="group relative overflow-hidden bg-slate-900/50 border border-slate-700 hover:border-slate-600 rounded-xl transition"
          >
            {/* Preview */}
            <div
              className="h-32 relative"
              style={{ background: template.preview }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h4 className="font-semibold text-white">{template.name}</h4>
                <p className="text-xs text-slate-300">{template.description}</p>
              </div>
            </div>

            {/* Details */}
            <div className="p-4 space-y-3">
              {/* Color Palette */}
              <div className="flex gap-1.5">
                {Object.values(template.colors).slice(0, 5).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full border-2 border-slate-700"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Fonts */}
              <div className="text-xs text-slate-400">
                <span className="font-medium">Fonts:</span> {template.fonts.heading} / {template.fonts.body}
              </div>

              {/* Apply Button */}
              <button
                onClick={() => handleApply(template)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
              >
                {selectedTemplate === template.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Applied!</span>
                  </>
                ) : (
                  <span>Apply Theme</span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
