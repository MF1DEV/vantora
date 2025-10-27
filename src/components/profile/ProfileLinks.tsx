'use client'

import { ExternalLink } from 'lucide-react'

interface Link {
  id: string
  title: string
  url: string
  icon?: string
}

interface ProfileLinksProps {
  links: Link[]
  userId: string
  buttonStyle: string
  accentColor: string
}

export default function ProfileLinks({ links, userId, buttonStyle, accentColor }: ProfileLinksProps) {
  const trackClick = async (linkId: string) => {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          link_id: linkId,
          event_type: 'click',
        }),
      })
    } catch (error) {
      console.error('Failed to track click:', error)
    }
  }

  const getButtonClasses = () => {
    const baseClasses = 'flex items-center justify-between w-full p-4 bg-slate-800/50 backdrop-blur-sm border border-white/10 transition group'
    
    const styleClasses: { [key: string]: string } = {
      'rounded': 'rounded-xl',
      'pill': 'rounded-full',
      'square': 'rounded-lg',
      'sharp': 'rounded-none',
    }

    const colorClasses: { [key: string]: string } = {
      'blue': 'hover:bg-slate-700/50 hover:border-blue-500',
      'purple': 'hover:bg-slate-700/50 hover:border-purple-500',
      'pink': 'hover:bg-slate-700/50 hover:border-pink-500',
      'green': 'hover:bg-slate-700/50 hover:border-green-500',
      'orange': 'hover:bg-slate-700/50 hover:border-orange-500',
      'red': 'hover:bg-slate-700/50 hover:border-red-500',
    }

    return `${baseClasses} ${styleClasses[buttonStyle] || styleClasses['rounded']} ${colorClasses[accentColor] || colorClasses['blue']}`
  }

  const getIconColorClass = () => {
    const colors: { [key: string]: string } = {
      'blue': 'text-slate-400 group-hover:text-blue-400',
      'purple': 'text-slate-400 group-hover:text-purple-400',
      'pink': 'text-slate-400 group-hover:text-pink-400',
      'green': 'text-slate-400 group-hover:text-green-400',
      'orange': 'text-slate-400 group-hover:text-orange-400',
      'red': 'text-slate-400 group-hover:text-red-400',
    }
    return colors[accentColor] || colors['blue']
  }

  return (
    <div className="space-y-3">
      {links && links.length > 0 ? (
        links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(link.id)}
            className={getButtonClasses()}
          >
            <div className="flex items-center gap-2">
              {link.icon && <span className="text-lg">{link.icon}</span>}
              <span className="text-white font-medium">{link.title}</span>
            </div>            <ExternalLink className={`w-5 h-5 transition ${getIconColorClass()}`} />
          </a>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400">No links yet</p>
        </div>
      )}
    </div>
  )
}