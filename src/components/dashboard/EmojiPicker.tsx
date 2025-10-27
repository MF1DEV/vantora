'use client'

import { useState } from 'react'
import { Smile } from 'lucide-react'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  currentIcon?: string
}

export default function EmojiPicker({ onSelect, currentIcon }: EmojiPickerProps) {
  const [show, setShow] = useState(false)

  const emojis = [
    '🌐', '💼', '📱', '🎨', '📸', '🎮', '🎵', '📧', '💬', '🛒',
    '📝', '🏠', '🎬', '📚', '💰', '🏃', '🍕', '☕', '🚀', '⭐',
    '💡', '🔗', '📊', '🎯', '🏆', '🎓', '💻', '🌟', '🔥', '💎',
    '🎪', '🎭', '🎡', '🎢', '🎠', '🎰', '🎲', '✨', '🎉', '🎈',
  ]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition text-xl"
      >
        {currentIcon || <Smile className="w-5 h-5 text-slate-400" />}
      </button>
      
      {show && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShow(false)}
          />
          <div className="absolute left-0 top-12 z-20 bg-slate-800 border border-slate-700 rounded-lg p-2 shadow-xl w-64">
            <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelect(emoji)
                    setShow(false)
                  }}
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded text-xl transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                onSelect('')
                setShow(false)
              }}
              className="w-full mt-2 py-1 text-xs text-slate-400 hover:text-white transition"
            >
              Remove Icon
            </button>
          </div>
        </>
      )}
    </div>
  )
}