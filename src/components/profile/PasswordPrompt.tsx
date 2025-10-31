'use client'

import { useState } from 'react'
import { Lock, X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface PasswordPromptProps {
  isOpen: boolean
  linkTitle: string
  onClose: () => void
  onSubmit: (password: string) => Promise<boolean>
}

export default function PasswordPrompt({
  isOpen,
  linkTitle,
  onClose,
  onSubmit,
}: PasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await onSubmit(password)
      if (!success) {
        setError('Incorrect password. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
      setPassword('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Protected Link</h2>
            <p className="text-sm text-slate-400">{linkTitle}</p>
          </div>
        </div>

        <p className="text-slate-300 mb-4">
          This link is password protected. Please enter the password to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
              autoFocus
              required
            />
            {error && (
              <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <Button
              type="submit"
              disabled={loading || !password}
              className="flex-1"
            >
              {loading ? 'Verifying...' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
