'use client'

import { ExternalLink } from 'lucide-react'

interface Link {
  id: string
  title: string
  url: string
}

interface ProfileLinksProps {
  links: Link[]
  userId: string
}

export default function ProfileLinks({ links, userId }: ProfileLinksProps) {
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
            className="flex items-center justify-between w-full p-4 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-xl transition group"
          >
            <span className="text-white font-medium">{link.title}</span>
            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition" />
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