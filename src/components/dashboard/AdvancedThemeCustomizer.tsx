'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ColorPicker from '@/components/ui/ColorPicker'
import FontSelector from '@/components/ui/FontSelector'
import { Palette, Type, Image, Sparkles, Save, Loader2 } from 'lucide-react'
import Button from '@/components/ui/Button'

interface AdvancedThemeCustomizerProps {
  userId: string
  initialData: any
  onSave: () => void
}

export default function AdvancedThemeCustomizer({ userId, initialData, onSave }: AdvancedThemeCustomizerProps) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'background' | 'buttons'>('colors')

  const [customColors, setCustomColors] = useState(initialData?.custom_colors || {
    accent: '#3b82f6',
    button: '#3b82f6',
    buttonText: '#ffffff',
    text: '#ffffff',
    textSecondary: '#94a3b8',
  })

  const [fonts, setFonts] = useState({
    heading: initialData?.font_heading || 'Inter',
    body: initialData?.font_body || 'Inter',
  })

  // Parse background_gradient if it's a string from the database
  const parseBackgroundGradient = (data: any) => {
    if (!data) {
      return {
        type: 'linear',
        angle: 135,
        colors: ['#0f172a', '#1e293b'],
      }
    }
    
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        // Validate the parsed data has required fields
        if (parsed && Array.isArray(parsed.colors) && parsed.colors.length > 0) {
          return parsed
        }
      } catch (e) {
        console.warn('Failed to parse background_gradient:', e)
      }
    } else if (data && Array.isArray(data.colors) && data.colors.length > 0) {
      return data
    }
    
    // Return default if parsing failed or invalid
    return {
      type: 'linear',
      angle: 135,
      colors: ['#0f172a', '#1e293b'],
    }
  }

  const [backgroundType, setBackgroundType] = useState(initialData?.background_type || 'gradient')
  const [backgroundColor, setBackgroundColor] = useState(initialData?.background_color || '#0f172a')
  const [backgroundGradient, setBackgroundGradient] = useState(parseBackgroundGradient(initialData?.background_gradient))
  const [enableParticles, setEnableParticles] = useState(initialData?.enable_particles || false)

  const [buttonStyle, setButtonStyle] = useState(initialData?.button_style || 'rounded')

  const buttonStyles = [
    { value: 'rounded', label: 'Rounded', preview: 'rounded-lg' },
    { value: 'pill', label: 'Pill', preview: 'rounded-full' },
    { value: 'square', label: 'Square', preview: 'rounded-none' },
    { value: 'soft', label: 'Soft', preview: 'rounded-2xl' },
    { value: 'outlined', label: 'Outlined', preview: 'rounded-lg border-2' },
    { value: 'gradient', label: 'Gradient', preview: 'rounded-lg bg-gradient-to-r' },
    { value: 'neon', label: 'Neon', preview: 'rounded-lg shadow-lg shadow-blue-500/50' },
    { value: 'glass', label: 'Glass', preview: 'rounded-lg backdrop-blur-sm bg-white/10' },
    { value: 'minimal', label: 'Minimal', preview: 'rounded-md' },
  ]

  const gradientPresets = [
    { name: 'Ocean', colors: ['#667eea', '#764ba2'] },
    { name: 'Sunset', colors: ['#f83600', '#f9d423'] },
    { name: 'Purple Dream', colors: ['#c471ed', '#f64f59'] },
    { name: 'Green Beach', colors: ['#02aab0', '#00cdac'] },
    { name: 'Red Sunset', colors: ['#355c7d', '#6c5b7b', '#c06c84'] },
    { name: 'Blue Moon', colors: ['#2193b0', '#6dd5ed'] },
    { name: 'Fire', colors: ['#f12711', '#f5af19'] },
    { name: 'Pink Flavour', colors: ['#800080', '#ffc0cb'] },
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          custom_colors: customColors,
          font_heading: fonts.heading,
          font_body: fonts.body,
          background_type: backgroundType,
          background_color: backgroundColor,
          background_gradient: backgroundGradient,
          enable_particles: enableParticles,
          button_style: buttonStyle,
        })
        .eq('id', userId)

      if (error) throw error
      
      onSave()
    } catch (error) {
      console.error('Error saving theme:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-slate-900/50 rounded-lg">
        {[
          { id: 'colors', label: 'Colors', icon: Palette },
          { id: 'fonts', label: 'Fonts', icon: Type },
          { id: 'background', label: 'Background', icon: Image },
          { id: 'buttons', label: 'Buttons', icon: Sparkles },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <ColorPicker
            label="Accent Color"
            value={customColors.accent}
            onChange={(color) => setCustomColors({ ...customColors, accent: color })}
          />
          <ColorPicker
            label="Button Color"
            value={customColors.button}
            onChange={(color) => setCustomColors({ ...customColors, button: color })}
          />
          <ColorPicker
            label="Button Text Color"
            value={customColors.buttonText}
            onChange={(color) => setCustomColors({ ...customColors, buttonText: color })}
          />
          <ColorPicker
            label="Primary Text Color"
            value={customColors.text}
            onChange={(color) => setCustomColors({ ...customColors, text: color })}
          />
          <ColorPicker
            label="Secondary Text Color"
            value={customColors.textSecondary}
            onChange={(color) => setCustomColors({ ...customColors, textSecondary: color })}
          />
        </div>
      )}

      {/* Fonts Tab */}
      {activeTab === 'fonts' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <FontSelector
            label="Heading Font"
            value={fonts.heading}
            onChange={(font) => setFonts({ ...fonts, heading: font })}
          />
          <FontSelector
            label="Body Font"
            value={fonts.body}
            onChange={(font) => setFonts({ ...fonts, body: font })}
          />
        </div>
      )}

      {/* Background Tab */}
      {activeTab === 'background' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Background Type</label>
            <div className="grid grid-cols-2 gap-3">
              {['gradient', 'solid', 'image'].map((type) => (
                <button
                  key={type}
                  onClick={() => setBackgroundType(type)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition border-2 ${
                    backgroundType === type
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {backgroundType === 'solid' && (
            <ColorPicker
              label="Background Color"
              value={backgroundColor}
              onChange={setBackgroundColor}
            />
          )}

          {backgroundType === 'gradient' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Gradient Presets</label>
                <div className="grid grid-cols-4 gap-3">
                  {gradientPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() =>
                        setBackgroundGradient({
                          ...backgroundGradient,
                          colors: preset.colors,
                        })
                      }
                      className="h-16 rounded-lg border-2 border-slate-600 hover:border-white hover:scale-105 transition"
                      style={{
                        background: `linear-gradient(135deg, ${preset.colors.join(', ')})`,
                      }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              <ColorPicker
                label="Gradient Start Color"
                value={backgroundGradient?.colors?.[0] || '#0f172a'}
                onChange={(color) =>
                  setBackgroundGradient({
                    ...backgroundGradient,
                    colors: [color, backgroundGradient?.colors?.[1] || '#1e293b'],
                  })
                }
              />
              <ColorPicker
                label="Gradient End Color"
                value={backgroundGradient?.colors?.[1] || '#1e293b'}
                onChange={(color) =>
                  setBackgroundGradient({
                    ...backgroundGradient,
                    colors: [backgroundGradient?.colors?.[0] || '#0f172a', color],
                  })
                }
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Gradient Angle: {backgroundGradient?.angle || 135}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={backgroundGradient.angle}
                  onChange={(e) =>
                    setBackgroundGradient({
                      ...backgroundGradient,
                      angle: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <div>
              <h4 className="text-white font-medium">Particle Effects</h4>
              <p className="text-sm text-slate-400">Add animated floating particles</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableParticles}
                onChange={(e) => setEnableParticles(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      )}

      {/* Buttons Tab */}
      {activeTab === 'buttons' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <label className="block text-sm font-medium text-slate-300 mb-3">Button Style</label>
          <div className="grid grid-cols-3 gap-3">
            {buttonStyles.map((style) => (
              <button
                key={style.value}
                onClick={() => setButtonStyle(style.value)}
                className={`p-4 rounded-lg border-2 transition ${
                  buttonStyle === style.value
                    ? 'border-blue-500 bg-blue-600/20'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className={`h-10 ${style.preview} bg-blue-600 mb-2`}></div>
                <p className="text-sm text-white font-medium">{style.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="pt-4 border-t border-slate-700">
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Theme
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
