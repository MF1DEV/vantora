'use client'

import { useState } from 'react'
import { Code, AlertCircle, Check, X } from 'lucide-react'

interface CustomCSSEditorProps {
  initialCSS: string
  onSave: (css: string) => void
}

export default function CustomCSSEditor({ initialCSS, onSave }: CustomCSSEditorProps) {
  const [css, setCSS] = useState(initialCSS || '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await onSave(sanitizeCSS(css))
    setIsSaving(false)
    setIsEditing(false)
  }

  const sanitizeCSS = (cssString: string): string => {
    // Remove potentially dangerous CSS
    let sanitized = cssString
      .replace(/@import/gi, '') // Remove @import
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/expression\(/gi, '') // Remove IE expression()
      .replace(/behavior:/gi, '') // Remove IE behavior
      .replace(/binding:/gi, '') // Remove XBL binding
      .trim()

    return sanitized
  }

  const handleCancel = () => {
    setCSS(initialCSS || '')
    setIsEditing(false)
  }

  if (!isEditing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Custom CSS</h3>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition"
          >
            Edit CSS
          </button>
        </div>

        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          {css ? (
            <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto">
              {css}
            </pre>
          ) : (
            <p className="text-slate-400 text-sm">No custom CSS added yet</p>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Pro Tip:</p>
            <p>Add custom CSS to override default styles. Use CSS variables like <code className="px-1 py-0.5 bg-slate-800 rounded">--accent-color</code> for dynamic theming.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Code className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Edit Custom CSS</h3>
      </div>

      <div className="relative">
        <textarea
          value={css}
          onChange={(e) => setCSS(e.target.value)}
          placeholder="/* Add your custom CSS here */
.profile-container {
  /* Your styles */
}

.link-button {
  /* Customize link buttons */
}

/* Use CSS variables */
button {
  background: var(--accent-color);
}"
          className="w-full h-96 p-4 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-sm outline-none focus:border-purple-500 transition resize-y"
          spellCheck={false}
        />
        <div className="absolute top-2 right-2 text-xs text-slate-500">
          {css.length} characters
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-300">
              <p className="font-medium">Safety Notice</p>
              <p>Dangerous CSS patterns (@import, javascript:, expression) are automatically removed.</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="text-xs text-purple-300">
            <p className="font-medium mb-1">Available CSS Variables:</p>
            <code className="text-xs">--accent-color, --button-color, --button-text-color, --primary-text, --secondary-text</code>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Save CSS</span>
            </>
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>

      <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
        <p className="text-xs text-slate-400 mb-2">Example CSS:</p>
        <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
{`/* Gradient background */
.profile-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Glass effect buttons */
.link-button {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Custom animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.avatar {
  animation: float 3s ease-in-out infinite;
}`}
        </pre>
      </div>
    </div>
  )
}
