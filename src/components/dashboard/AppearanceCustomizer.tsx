'use client'

import { ButtonStyle, BorderRadius, Animation } from '@/types/link'

interface AppearanceCustomizerProps {
  buttonStyle: ButtonStyle
  customColor?: string
  borderRadius: BorderRadius
  animation: Animation
  onButtonStyleChange: (style: ButtonStyle) => void
  onCustomColorChange: (color: string) => void
  onBorderRadiusChange: (radius: BorderRadius) => void
  onAnimationChange: (animation: Animation) => void
}

export function AppearanceCustomizer({
  buttonStyle,
  customColor,
  borderRadius,
  animation,
  onButtonStyleChange,
  onCustomColorChange,
  onBorderRadiusChange,
  onAnimationChange,
}: AppearanceCustomizerProps) {
  const buttonStyles: { value: ButtonStyle; label: string; description: string }[] = [
    { value: 'solid', label: 'Solid', description: 'Filled background' },
    { value: 'outline', label: 'Outline', description: 'Border only' },
    { value: 'soft-shadow', label: 'Soft Shadow', description: 'Elevated look' },
    { value: 'neon-glow', label: 'Neon Glow', description: 'Glowing effect' },
  ]

  const radiusOptions: { value: BorderRadius; label: string }[] = [
    { value: 'none', label: 'Square' },
    { value: 'sm', label: 'Small' },
    { value: 'rounded', label: 'Rounded' },
    { value: 'lg', label: 'Large' },
    { value: 'full', label: 'Pill' },
  ]

  const animationOptions: { value: Animation; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'glow', label: 'Glow' },
  ]

  return (
    <div className="space-y-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <h3 className="text-sm font-semibold text-white">Appearance Customization</h3>

      {/* Button Style */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Button Style</label>
        <div className="grid grid-cols-2 gap-2">
          {buttonStyles.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onButtonStyleChange(style.value)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                buttonStyle === style.value
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <div className="text-sm font-medium text-white">{style.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Custom Color</label>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={customColor || '#3b82f6'}
            onChange={(e) => onCustomColorChange(e.target.value)}
            className="h-10 w-20 rounded border-2 border-slate-700 bg-slate-800 cursor-pointer"
          />
          <input
            type="text"
            value={customColor || ''}
            onChange={(e) => onCustomColorChange(e.target.value)}
            placeholder="Leave empty for theme color"
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm"
          />
          {customColor && (
            <button
              type="button"
              onClick={() => onCustomColorChange('')}
              className="px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Reset
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500">Override theme color for this link only</p>
      </div>

      {/* Border Radius */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Border Radius</label>
        <div className="flex gap-2">
          {radiusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onBorderRadiusChange(option.value)}
              className={`flex-1 px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                borderRadius === option.value
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Animation */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Hover Animation</label>
        <div className="grid grid-cols-4 gap-2">
          {animationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onAnimationChange(option.value)}
              className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                animation === option.value
                  ? 'border-blue-500 bg-blue-500/10 text-white'
                  : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
