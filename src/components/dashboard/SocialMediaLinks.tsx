'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { type SocialLinks } from '@/types/user'
import SocialIcon from './SocialIcon'

interface SocialMediaLinksProps {
  links?: Record<string, string>
  readonly?: boolean
  className?: string
  onAddLink?: (platform: string, url: string) => void
}

const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', placeholder: 'username', baseUrl: 'https://instagram.com/' },
  { id: 'twitter', name: 'Twitter/X', placeholder: 'username', baseUrl: 'https://x.com/' },
  { id: 'facebook', name: 'Facebook', placeholder: 'username', baseUrl: 'https://facebook.com/' },
  { id: 'youtube', name: 'YouTube', placeholder: 'channel or @handle', baseUrl: 'https://youtube.com/' },
  { id: 'twitch', name: 'Twitch', placeholder: 'username', baseUrl: 'https://twitch.tv/' },
  { id: 'github', name: 'GitHub', placeholder: 'username', baseUrl: 'https://github.com/' },
  { id: 'linkedin', name: 'LinkedIn', placeholder: 'in/username', baseUrl: 'https://linkedin.com/' },
  { id: 'email', name: 'Email', placeholder: 'email address', baseUrl: 'mailto:' },
  { id: 'website', name: 'Website', placeholder: 'https://your-site.com', baseUrl: '' }
]

export default function SocialMediaLinks({ links = {}, readonly = false, className = '', onAddLink }: SocialMediaLinksProps) {
  const [showForm, setShowForm] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedPlatform && url && onAddLink) {
      const platform = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)
      let fullUrl = url
      
      if (platform && platform.baseUrl && !url.startsWith('http') && !url.startsWith('mailto:')) {
        fullUrl = platform.baseUrl + url
      }
      
      onAddLink(selectedPlatform, fullUrl)
      setSelectedPlatform('')
      setUrl('')
      setShowForm(false)
    }
  }
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex gap-3 justify-center flex-wrap">
        {Object.entries(links).map(([platform, url]) => {
          if (!url) return null
          return (
            <SocialIcon
              key={platform}
              platform={platform}
              url={url}
              readonly={readonly}
            />
          )
        })}
        
        {!readonly && (
          <button
            onClick={() => setShowForm(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {showForm && !readonly && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-slate-800 rounded px-3 py-1 text-sm"
            required
          >
            <option value="">Select platform</option>
            {SOCIAL_PLATFORMS.map(platform => (
              <option key={platform.id} value={platform.id}>{platform.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={selectedPlatform ? 
              SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)?.placeholder :
              'Enter URL or username'
            }
            className="flex-1 bg-slate-800 rounded px-3 py-1 text-sm"
            required
          />
          <button
            type="submit"
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium"
          >
            Add
          </button>
        </form>
      )}
    </div>
  )
}