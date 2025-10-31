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
      className="group w-full px-5 py-4 md:px-6 flex items-center justify-between bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg touch-manipulation"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {icon && (
          <span className="text-xl md:text-2xl flex-shrink-0">{icon}</span>
        )}
        <span className="font-medium text-white truncate">{title}</span>
      </div>
      <ExternalLink size={18} className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
    </a>
  )
}

