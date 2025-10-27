'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface ThemeSelectorProps {
  currentTheme: {
    background: string
    buttonStyle: string
    accentColor: string
  }
  onThemeChange: (theme: any) => void
}

export default function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const backgrounds = [
    { id: 'gradient-blue', name: 'Blue Gradient', class: 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' },
    { id: 'gradient-purple', name: 'Purple Gradient', class: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' },
    { id: 'gradient-pink', name: 'Pink Gradient', class: 'bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900' },
    { id: 'gradient-green', name: 'Green Gradient', class: 'bg-gradient-to-br from-slate-900 via-green-900 to-slate-900' },
    { id: 'solid-dark', name: 'Dark', class: 'bg-slate-900' },
    { id: 'solid-black', name: 'Black', class: 'bg-black' },
  ]

  const buttonStyles = [
    { id: 'rounded', name: 'Rounded', class: 'rounded-xl' },
    { id: 'pill', name: 'Pill', class: 'rounded-full' },
    { id: 'square', name: 'Square', class: 'rounded-lg' },
    { id: 'sharp', name: 'Sharp', class: 'rounded-none' },
  ]

  const accentColors = [
    { id: 'blue', name: 'Blue', class: 'bg-blue-600' },
    { id: 'purple', name: 'Purple', class: 'bg-purple-600' },
    { id: 'pink', name: 'Pink', class: 'bg-pink-600' },
    { id: 'green', name: 'Green', class: 'bg-green-600' },
    { id: 'orange', name: 'Orange', class: 'bg-orange-600' },
    { id: 'red', name: 'Red', class: 'bg-red-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Background Selection */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Background</h3>
        <div className="grid grid-cols-2 gap-3">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onThemeChange({ ...currentTheme, background: bg.id })}
              className={`relative p-4 ${bg.class} rounded-lg border-2 transition ${
                currentTheme.background === bg.id
                  ? 'border-blue-500'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="text-white text-sm font-medium">{bg.name}</div>
              {currentTheme.background === bg.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Button Style Selection */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Button Style</h3>
        <div className="grid grid-cols-2 gap-3">
          {buttonStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onThemeChange({ ...currentTheme, buttonStyle: style.id })}
              className={`relative p-3 bg-slate-800 border-2 transition ${style.class} ${
                currentTheme.buttonStyle === style.id
                  ? 'border-blue-500'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className={`text-white text-sm font-medium mb-2`}>{style.name}</div>
              <div className={`bg-blue-600 text-white text-xs py-2 ${style.class}`}>
                Sample Button
              </div>
              {currentTheme.buttonStyle === style.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color Selection */}
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-3">Accent Color</h3>
        <div className="flex gap-3">
          {accentColors.map((color) => (
            <button
              key={color.id}
              onClick={() => onThemeChange({ ...currentTheme, accentColor: color.id })}
              className={`relative w-12 h-12 ${color.class} rounded-lg border-2 transition ${
                currentTheme.accentColor === color.id
                  ? 'border-white'
                  : 'border-transparent hover:border-slate-500'
              }`}
              title={color.name}
            >
              {currentTheme.accentColor === color.id && (
                <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}