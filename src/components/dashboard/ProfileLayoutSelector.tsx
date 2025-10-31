'use client'

import { useState } from 'react'
import { LayoutGrid, List, Grid, Layers, Check } from 'lucide-react'

interface ProfileLayoutSelectorProps {
  currentLayout: string
  onLayoutChange: (layout: string) => void
}

const layouts = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional vertical stack of links',
    icon: List,
    preview: (
      <div className="space-y-1.5">
        <div className="h-8 bg-slate-600 rounded" />
        <div className="h-8 bg-slate-600 rounded" />
        <div className="h-8 bg-slate-600 rounded" />
        <div className="h-8 bg-slate-600 rounded" />
      </div>
    ),
  },
  {
    id: 'grid',
    name: 'Grid',
    description: 'Two-column grid layout',
    icon: Grid,
    preview: (
      <div className="grid grid-cols-2 gap-1.5">
        <div className="h-8 bg-slate-600 rounded" />
        <div className="h-8 bg-slate-600 rounded" />
        <div className="h-8 bg-slate-600 rounded" />
        <div className="h-8 bg-slate-600 rounded" />
      </div>
    ),
  },
  {
    id: 'masonry',
    name: 'Masonry',
    description: 'Pinterest-style card layout',
    icon: LayoutGrid,
    preview: (
      <div className="grid grid-cols-2 gap-1.5">
        <div className="space-y-1.5">
          <div className="h-10 bg-slate-600 rounded" />
          <div className="h-6 bg-slate-600 rounded" />
        </div>
        <div className="space-y-1.5">
          <div className="h-6 bg-slate-600 rounded" />
          <div className="h-10 bg-slate-600 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'card',
    name: 'Card',
    description: 'Individual cards with spacing',
    icon: Layers,
    preview: (
      <div className="space-y-2">
        <div className="p-2 bg-slate-600 rounded border border-slate-500">
          <div className="h-4 bg-slate-500 rounded" />
        </div>
        <div className="p-2 bg-slate-600 rounded border border-slate-500">
          <div className="h-4 bg-slate-500 rounded" />
        </div>
        <div className="p-2 bg-slate-600 rounded border border-slate-500">
          <div className="h-4 bg-slate-500 rounded" />
        </div>
      </div>
    ),
  },
]

export default function ProfileLayoutSelector({ currentLayout, onLayoutChange }: ProfileLayoutSelectorProps) {
  const [selectedLayout, setSelectedLayout] = useState(currentLayout || 'classic')

  const handleSelect = (layoutId: string) => {
    setSelectedLayout(layoutId)
    onLayoutChange(layoutId)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Profile Layout</h3>
        <p className="text-sm text-slate-400">
          Choose how your links are displayed on your profile
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {layouts.map((layout) => {
          const Icon = layout.icon
          const isSelected = selectedLayout === layout.id

          return (
            <button
              key={layout.id}
              onClick={() => handleSelect(layout.id)}
              className={`relative p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              }`}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Icon */}
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className={`font-medium ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {layout.name}
                </span>
              </div>

              {/* Preview */}
              <div className="mb-3 p-3 bg-slate-800 rounded-lg">
                {layout.preview}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 text-left">
                {layout.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Layout Details */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Layout Details</h4>
        <ul className="text-sm text-slate-400 space-y-1">
          {selectedLayout === 'classic' && (
            <>
              <li>• Links stacked vertically</li>
              <li>• Best for simplicity and mobile</li>
              <li>• Full-width buttons</li>
            </>
          )}
          {selectedLayout === 'grid' && (
            <>
              <li>• Links in 2-column grid</li>
              <li>• Space-efficient layout</li>
              <li>• Great for many links</li>
            </>
          )}
          {selectedLayout === 'masonry' && (
            <>
              <li>• Pinterest-style cards</li>
              <li>• Dynamic height based on content</li>
              <li>• Visual and modern</li>
            </>
          )}
          {selectedLayout === 'card' && (
            <>
              <li>• Individual card containers</li>
              <li>• Extra padding and borders</li>
              <li>• Premium appearance</li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
