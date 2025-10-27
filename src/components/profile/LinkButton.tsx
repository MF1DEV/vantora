'use client'

import { ExternalLink } from 'lucide-react'

interface LinkButtonProps {
  title: string
  url: string
  icon?: string
  onClick?: () => void
}

export function LinkButton({ title, url, icon, onClick }: LinkButtonProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="w-full px-6 py-3 flex items-center justify-between bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span className="text-xl">{icon}</span>
        )}
        <span className="font-medium">{title}</span>
      </div>
      <ExternalLink size={18} className="text-slate-400" />
    </a>
  )
}
