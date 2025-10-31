'use client'

import { Lock, Unlock } from 'lucide-react'

interface PasswordProtectionProps {
  isProtected: boolean
  password: string
  onProtectionChange: (data: {
    isProtected: boolean
    password: string
  }) => void
}

export default function PasswordProtection({
  isProtected,
  password,
  onProtectionChange,
}: PasswordProtectionProps) {
  const handleToggle = () => {
    const newProtected = !isProtected
    onProtectionChange({
      isProtected: newProtected,
      password: newProtected ? password : '',
    })
  }

  const handlePasswordChange = (value: string) => {
    onProtectionChange({
      isProtected: isProtected,
      password: value,
    })
  }

  return (
    <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isProtected ? (
            <Lock className="w-5 h-5 text-blue-400" />
          ) : (
            <Unlock className="w-5 h-5 text-slate-400" />
          )}
          <span className="font-medium text-white">Password Protection</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isProtected}
            onChange={handleToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {isProtected && (
        <div className="pt-2">
          <p className="text-sm text-slate-400 mb-3">
            Visitors will need to enter this password to access the link
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none focus:border-blue-500 transition"
            required={isProtected}
          />
        </div>
      )}
    </div>
  )
}
